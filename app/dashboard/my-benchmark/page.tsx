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
      <div className="p-12 text-center bg-white rounded-[32px] border border-slate-200">
        <h2 className="text-xl font-bold">No Fellowship Assigned</h2>
        <p className="text-slate-500 text-sm mt-2">Please contact Admin.</p>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const startYear =
    currentMonth >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const dynamicYearLabel = `${startYear}/${startYear + 1}`;

  const benchmark = await prisma.benchmark.findFirst({
    where: { groupId: userWithGroup.groupId, year: dynamicYearLabel },
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

  if (!benchmark) {
    return (
      <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          Benchmarks Not Initialized
        </h2>
      </div>
    );
  }

  // --- LOGIC: AUTOMATIC FREEZE CHECK ---
  const isExpired = benchmark.dueDate
    ? now > new Date(benchmark.dueDate)
    : false;
  const isLocked = benchmark.isClosed || isExpired;

  // Calculate days remaining for the UI
  const daysRemaining = benchmark.dueDate
    ? Math.ceil(
        (new Date(benchmark.dueDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="space-y-6">
      {/* TIMELINE PROGRESS BAR (Only shows if there is a deadline and not yet locked) */}
      {benchmark.dueDate && !isLocked && daysRemaining !== null && (
        <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                Submission Window
              </p>
              <p className="text-sm font-bold text-slate-900">
                {daysRemaining} Days Remaining
              </p>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Ends: {new Date(benchmark.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${daysRemaining < 7 ? "bg-rose-500" : "bg-blue-600"}`}
              style={{
                width: `${Math.max(0, Math.min(100, (daysRemaining / 30) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 md:px-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            My Benchmarks
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Reporting for:{" "}
            <span className="text-blue-600 font-bold">
              {benchmark.group.name}
            </span>{" "}
            — {benchmark.year}
          </p>
        </div>

        {isLocked && (
          <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-200 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            {isExpired ? "⏰ Window Expired" : "🔒 Manual Lock"}
          </div>
        )}
      </div>

      <LeaderEntryForm sections={benchmark.sections} isLocked={isLocked} />
    </div>
  );
}
