"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSelfValue(data: { criteriaId: string; selfValue: number }) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Security: Optional - Verify this criteria belongs to the user's group
  
  await prisma.criteria.update({
    where: { id: data.criteriaId },
    data: { selfValue: data.selfValue },
  });

  revalidatePath("/dashboard/my-benchmark");
  return { success: true };
}