"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateCriteriaScore(data: {
  criteriaId: string;
  reviewerScore: number;
  reviewerNote?: string;
}) {
  const session = await getServerSession(authOptions);
  
  // 1. Security Gate
  const user = session?.user as any;
  if (!session || !["ADMIN", "REVIEWER"].includes(user.role)) {
    throw new Error("Unauthorized: Only Admins or Reviewers can grade benchmarks.");
  }

  // 2. Fetch current criteria to validate against target (Optional but recommended)
  const current = await prisma.criteria.findUnique({
    where: { id: data.criteriaId },
    select: { target: true }
  });

  if (!current) throw new Error("Criteria not found.");

  // 3. Database Update
  await prisma.criteria.update({
    where: { id: data.criteriaId },
    data: {
      reviewerScore: data.reviewerScore,
      reviewerNote: data.reviewerNote || null, // Ensure empty strings are stored as null
      // We could also track WHO did the review if you have a reviewerId field:
      // reviewerId: user.id 
    },
  });

  // 4. Targeted Revalidation
  // Revalidates the main review list and any dynamic sub-routes
  revalidatePath("/dashboard/admin/reviews");
  revalidatePath("/dashboard/admin/reviews/[id]", "page"); 
  
  return { success: true };
}