import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import EditWizard from "./EditWizard";

export default async function EditBenchmarkPage({
  params,
}: {
  params: Promise<{ benchmarkId: string }>; // 1. Define params as a Promise
}) {
  const session = await getServerSession(authOptions);

  // 2. Unwrap the params Promise [Next.js 15 Requirement]
  const { benchmarkId } = await params;

  // 3. Security Check: Only ADMINs can modify the Master Blueprint
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  // 4. Fetch Full Benchmark Data using the unwrapped ID
  const benchmark = await prisma.benchmark.findUnique({
    where: { id: benchmarkId }, // Now benchmarkId is a valid string
    include: {
      group: true, // To show the Fellowship name (e.g., Youth Fellowship)
      sections: {
        orderBy: { code: "asc" }, // Ensures Pillars A-G are in order [cite: 39-46]
        include: {
          criteria: {
            orderBy: { serialNo: "asc" }, // Orders indicators like D1.1, D1.2
          },
        },
      },
    },
  });

  // 5. Handle Invalid ID
  if (!benchmark) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header with Context */}
      <div className="flex justify-between items-end bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
              Master Editor
            </span>
            <span className="text-slate-300 text-sm">/</span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              {benchmark.year} Cycle
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            {benchmark.group.name}
          </h1>
        </div>

        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Database ID
          </p>
          <code className="text-[10px] bg-slate-50 px-2 py-1 rounded font-mono text-slate-500">
            {benchmarkId}
          </code>
        </div>
      </div>

      <EditWizard benchmark={benchmark} />
    </div>
  );
}
