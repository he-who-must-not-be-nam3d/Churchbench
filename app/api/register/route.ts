import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, role, groupName } = await request.json();

    // 1. Basic Validation
    if (!email || !password || !groupName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // 3. Securely hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Handle Group Logic
    // We use connectOrCreate to ensure the "Youth Fellowship" group exists 
    // in the database the moment the first user registers.
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role, // ADMIN, REVIEWER, or LEADER
        group: {
          connectOrCreate: {
            where: { name: groupName },
            create: { name: groupName },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}