import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LeaderEntryForm from "./LeaderEntryForm";

export default async function MyBenchmarkPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userWithGroup = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
    select: { groupId: true },
  });

  if (!userWithGroup?.groupId) {
    return (
      <div className="p-12 text-center bg-white rounded-[40px] border border-slate-200 mt-10 shadow-sm">
        <h2 className="text-xl font-bold">No Fellowship Assigned</h2>
        <p className="text-slate-500 text-sm mt-2">
          Contact Admin to link your group.
        </p>
      </div>
    );
  }

  const now = new Date();

  const benchmark = await prisma.benchmark.findFirst({
    where: { groupId: userWithGroup.groupId },
    include: {
      group: true,
      sections: {
        orderBy: { code: "asc" },
        include: {
          criteria: {
            orderBy: { serialNo: "asc" },
            include: { evidence: { orderBy: { uploadedAt: "desc" } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!benchmark || !benchmark.sections || benchmark.sections.length === 0) {
    return (
      <div className="p-16 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 mt-10">
        <h2 className="text-xl font-black text-slate-900 uppercase">
          Pillars Not Initialized
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          The cycle for {benchmark?.year || "this year"} is pending pillar
          assignment.
        </p>
      </div>
    );
  }

  const isExpired = benchmark.dueDate
    ? now > new Date(benchmark.dueDate)
    : false;
  const isLocked = benchmark.isClosed || isExpired;

  const daysRemaining = benchmark.dueDate
    ? Math.ceil(
        (new Date(benchmark.dueDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="space-y-8 pb-20">
      {benchmark.dueDate && !isLocked && daysRemaining !== null && (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                Submission Window
              </p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {daysRemaining} Days to Deadline
              </h3>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {new Date(benchmark.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${Math.max(5, (daysRemaining / 30) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            My Benchmarks
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-bold text-slate-500 uppercase">
              {benchmark.group.name}
            </span>
            <span className="h-1 w-1 bg-slate-300 rounded-full" />
            <span className="text-sm font-bold text-slate-400">
              Cycle {benchmark.year}
            </span>
          </div>
        </div>

        {isLocked && (
          <div className="bg-rose-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3">
            {isExpired ? "⏰ Window Expired" : "🔒 Manual Lock"}
          </div>
        )}
      </div>

      <LeaderEntryForm sections={benchmark.sections} isLocked={isLocked} />
    </div>
  );
}
