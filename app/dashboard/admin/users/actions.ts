"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateUserAdmin(data: {
  userId: string;
  email: string;
  role: Role;
  groupId?: string | null;
  password?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updateData: any = {
    email: data.email,
    role: data.role,
    groupId: data.groupId === "none" ? null : data.groupId,
  };

  // Only hash and update password if provided
  if (data.password && data.password.length > 0) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  await prisma.user.update({
    where: { id: data.userId },
    data: updateData,
  });

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}