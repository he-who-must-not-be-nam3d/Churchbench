import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const groupId = (session?.user as any).groupId;

  // Calculate Dynamic Year for Query
  const now = new Date();
  const currentMonth = now.getMonth();
  const startYear =
    currentMonth >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const dynamicYearLabel = `${startYear}/${startYear + 1}`;

  const benchmark = groupId
    ? await prisma.benchmark.findFirst({
        where: {
          groupId,
          year: dynamicYearLabel,
        },
        include: {
          sections: {
            include: { criteria: true },
          },
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Performance Overview
        </h2>
        <p className="text-slate-500">
          Track your progress against the {dynamicYearLabel} benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase">
            Spiritual Growth
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">0%</span>
            <span className="text-sm text-slate-500">Target: 35%</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-0"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase">
            Financial Management
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">0%</span>
            <span className="text-sm text-slate-500">Target: 20%</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full w-0"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase">
            Governance
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">0%</span>
            <span className="text-sm text-slate-500">Target: 20%</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full w-0"></div>
          </div>
        </div>
      </div>

      {!benchmark && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
          <h4 className="text-amber-800 font-semibold text-lg">
            Benchmark Not Initialized
          </h4>
          <p className="text-amber-700 mt-1">
            The {dynamicYearLabel} benchmark targets have not been uploaded for
            your group yet.
          </p>
        </div>
      )}
    </div>
  );
}
