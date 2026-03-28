import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import IngestionForm from "./IngestionForm";

export default async function IngestionPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    redirect("/dashboard");

  const groups = await prisma.group.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Benchmark Master
        </h2>
        <p className="text-slate-500">
          Digitize performance contracts for PCEA Nkoroi fellowships.
        </p>
      </div>

      <IngestionForm groups={groups} />
    </div>
  );
}
