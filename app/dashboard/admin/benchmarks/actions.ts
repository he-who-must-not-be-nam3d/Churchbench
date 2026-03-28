"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBenchmarkStatus(benchmarkId: string, isClosed: boolean) {
  // Update the master switch for this fellowship's year
  await prisma.benchmark.update({
    where: { id: benchmarkId },
    data: { isClosed },
  });

  revalidatePath("/admin/benchmarks");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/my-benchmark");
  
  return { success: true };
}