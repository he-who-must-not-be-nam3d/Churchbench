"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth"; // Added missing import
import { authOptions } from "@/lib/auth"; // Added missing import

export async function updateMasterCriteria(data: {
  id: string;
  description: string;
  unitOfMeasure: string;
  weight: number;
  target: number;
}) {
  const session = await getServerSession(authOptions);
  
  // Security: Ensure only ADMINs can change the master blueprint
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.criteria.update({
    where: { id: data.id },
    data: {
      description: data.description,
      unitOfMeasure: data.unitOfMeasure,
      weight: data.weight,
      target: data.target,
    },
  });

  revalidatePath("/dashboard/admin/ingestion/edit");
  return { success: true };
}

export async function updateBenchmarkCycle(data: {
  benchmarkId: string;
  newYear: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.benchmark.update({
    where: { id: data.benchmarkId },
    data: { year: data.newYear },
  });

  // Revalidate the dynamic edit path and the group management list
  revalidatePath("/dashboard/admin/ingestion/edit");
  revalidatePath(`/dashboard/admin/ingestion/edit/${data.benchmarkId}`);
  revalidatePath("/dashboard/admin/groups");
  
  return { success: true };
}