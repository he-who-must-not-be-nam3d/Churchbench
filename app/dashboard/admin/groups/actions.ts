"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upsertGroup(data: { id?: string; name: string }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (data.id) {
    await prisma.group.update({
      where: { id: data.id },
      data: { name: data.name },
    });
  } else {
    await prisma.group.create({
      data: { name: data.name },
    });
  }

  revalidatePath("/dashboard/admin/groups");
  return { success: true };
}

export async function deleteGroup(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");

  // Security: Check if group has active benchmarks or users before deleting
  const group = await prisma.group.findUnique({
    where: { id },
    include: { _count: { select: { users: true, benchmarks: true } } }
  });

  if (group?._count.users || group?._count.benchmarks) {
    throw new Error("Cannot delete group with active users or benchmarks.");
  }

  await prisma.group.delete({ where: { id } });
  revalidatePath("/dashboard/admin/groups");
  return { success: true };
}