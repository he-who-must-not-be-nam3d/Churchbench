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

export async function saveEvidenceToDb(data: {
  criteriaId: string;
  url: string;
  name: string;
  type: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please log in to upload evidence.");
  }

  // Save to the Evidence model defined in your schema
  await prisma.evidence.create({
    data: {
      fileName: data.name,
      filePath: data.url,   // URL provided by UploadThing
      fileType: data.type,
      criteriaId: data.criteriaId,
    },
  });

  // Revalidate ensures the UI updates to show evidence is attached
  revalidatePath("/dashboard/my-benchmark");
  
  return { success: true };
}
export async function deleteEvidence(evidenceId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Delete the record from the Evidence table
  await prisma.evidence.delete({
    where: { id: evidenceId },
  });

  revalidatePath("/dashboard/my-benchmark");
  return { success: true };
}