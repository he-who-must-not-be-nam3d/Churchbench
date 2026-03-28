"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBenchmarkLock(benchmarkId: string, isClosed: boolean) {
  try {
    await prisma.benchmark.update({
      where: { id: benchmarkId },
      data: { isClosed },
    });

    // Refresh all relevant paths
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/my-benchmark");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle lock:", error);
    return { success: false };
  }
}
export async function setBenchmarkDeadline(benchmarkId: string, date: Date) {
  await prisma.benchmark.update({
    where: { id: benchmarkId },
    data: { 
      dueDate: date,
      isClosed: false // Ensure it's open if we are setting a new deadline
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/my-benchmark");
  return { success: true };
}