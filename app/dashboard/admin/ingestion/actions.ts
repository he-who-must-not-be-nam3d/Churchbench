"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveParsedBenchmark(data: {
  groupId: string;
  year: string;
  sections: any[];
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Unauthorized");

  // Create the Benchmark, Sections, and Criteria in a single Transaction
  return await prisma.$transaction(async (tx) => {
    const benchmark = await tx.benchmark.create({
      data: {
        year: data.year,
        groupId: data.groupId,
      },
    });

    for (const section of data.sections) {
      const createdSection = await tx.section.create({
        data: {
          code: section.code,
          title: section.title,
          weightTotal: section.weightTotal,
          benchmarkId: benchmark.id,
        },
      });

      await tx.criteria.createMany({
        data: section.criteria.map((c: any) => ({
          serialNo: c.serialNo,
          description: c.description,
          unitOfMeasure: c.unitOfMeasure,
          weight: c.weight,
          target: c.target,
          sectionId: createdSection.id,
        })),
      });
    }

    revalidatePath("/dashboard/admin/groups");
    return { success: true };
  });
}