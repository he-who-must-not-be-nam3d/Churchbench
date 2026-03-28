import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const groupId = (session?.user as any).groupId;

  // 1. Calculate Dynamic Year for Query
  const now = new Date();
  const currentMonth = now.getMonth();
  const startYear =
    currentMonth >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const dynamicYearLabel = `${startYear}/${startYear + 1}`;

  // 2. Fetch the benchmark with all nested data
  const benchmark = groupId
    ? await prisma.benchmark.findFirst({
        where: { groupId, year: dynamicYearLabel },
        include: {
          sections: {
            orderBy: { code: "asc" },
            include: {
              criteria: {
                include: { evidence: true },
              },
            },
          },
        },
      })
    : null;

  // 3. Calculate Section-wise Progress
  const sectionStats =
    benchmark?.sections.map((section) => {
      const totalCriteria = section.criteria.length;
      // Count how many criteria have a value entered by the leader
      const completedCount = section.criteria.filter(
        (c) => c.selfValue > 0,
      ).length;
      // Calculate percentage of completion for this section
      const completionRate =
        totalCriteria > 0 ? (completedCount / totalCriteria) * 100 : 0;

      return {
        id: section.id,
        code: section.code,
        title: section.title,
        targetWeight: section.weightTotal,
        completionRate,
        evidenceCount: section.criteria.reduce(
          (acc, c) => acc + c.evidence.length,
          0,
        ),
      };
    }) || [];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Performance Overview
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Tracking progress for the{" "}
            <span className="text-blue-600 font-bold">{dynamicYearLabel}</span>{" "}
            cycle.
          </p>
        </div>
        <Link
          href="/dashboard/my-benchmark"
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all cursor-pointer text-center"
        >
          Update My Achievement
        </Link>
      </div>

      {/* Dynamic Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectionStats.map((section) => (
          <div
            key={section.id}
            className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                {section.code}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                Weight: {section.targetWeight}%
              </span>
            </div>

            <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight mb-2 truncate">
              {section.title}
            </h3>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-slate-900">
                {Math.round(section.completionRate)}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Reported
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${section.completionRate}%` }}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {section.evidenceCount} Files Attached
              </span>
              <Link
                href={`/dashboard/my-benchmark?pillar=${section.code}`}
                className="text-[10px] font-black text-blue-600 uppercase hover:underline cursor-pointer"
              >
                Details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!benchmark && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-12 rounded-[40px] text-center">
          <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h4 className="text-amber-900 font-black text-xl">
            Benchmarks Not Ready
          </h4>
          <p className="text-amber-700 mt-2 max-w-md mx-auto font-medium">
            The {dynamicYearLabel} targets haven't been assigned to your
            fellowship yet. Please notify the Admin.
          </p>
        </div>
      )}
    </div>
  );
}
