import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { toggleBenchmarkLock, setBenchmarkDeadline } from "./actions"; // Import both actions

type GroupWithRelations = Prisma.GroupGetPayload<{
  include: {
    benchmarks: {
      include: {
        sections: {
          include: { criteria: true };
        };
      };
    };
    users: true;
  };
}>;

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const startYear =
    currentMonth >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const dynamicYearLabel = `${startYear}/${startYear + 1}`;

  const groups: GroupWithRelations[] = await prisma.group.findMany({
    include: {
      benchmarks: {
        where: { year: dynamicYearLabel },
        include: {
          sections: {
            include: { criteria: true },
          },
        },
      },
      users: {
        where: { role: "LEADER" },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalGroups = groups.length;
  const groupsWithBenchmarks = groups.filter(
    (g) => g.benchmarks.length > 0,
  ).length;
  const activeLeaders = groups.reduce((acc, g) => acc + g.users.length, 0);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          System Administration
        </h2>
        <p className="text-slate-500 font-medium mt-1">
          Parish-wide oversight for the{" "}
          <span className="text-blue-600 font-bold">{dynamicYearLabel}</span>{" "}
          Cycle.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Groups
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {totalGroups}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Active Benchmarks
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {groupsWithBenchmarks}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Leaders Online
          </p>
          <p className="text-3xl font-black text-blue-600 mt-1">
            {activeLeaders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Global Progress
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {totalGroups > 0
              ? Math.round((groupsWithBenchmarks / totalGroups) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Group Status Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden transition-all">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
            Fellowship Audit Control
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-black border-b border-slate-50">
                <th className="px-8 py-4 tracking-[0.2em]">Group Name</th>
                <th className="px-8 py-4 tracking-[0.2em]">Reporting Status</th>
                <th className="px-8 py-4 tracking-[0.2em]">Manual Action</th>
                <th className="px-8 py-4 tracking-[0.2em] text-right">
                  Timeline Limit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groups.map((group) => {
                const benchmark = group.benchmarks[0];
                const isExpired = benchmark?.dueDate
                  ? new Date() > new Date(benchmark.dueDate)
                  : false;

                return (
                  <tr
                    key={group.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900 uppercase text-sm tracking-tight">
                        {group.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {group.users[0]?.email || "Unassigned"}
                      </p>
                    </td>

                    <td className="px-8 py-5">
                      {!benchmark ? (
                        <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                          Empty
                        </span>
                      ) : benchmark.isClosed || isExpired ? (
                        <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                          {isExpired ? "Expired" : "Locked"}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          Open
                        </span>
                      )}
                    </td>

                    <td className="px-8 py-5">
                      {benchmark && (
                        <form
                          action={async () => {
                            "use server";
                            await toggleBenchmarkLock(
                              benchmark.id,
                              !benchmark.isClosed,
                            );
                          }}
                        >
                          <button
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                              benchmark.isClosed
                                ? "bg-emerald-600 text-white border-emerald-700"
                                : "bg-white text-rose-600 border-rose-100 hover:bg-rose-50"
                            }`}
                          >
                            {benchmark.isClosed ? "▶ Open" : "🔒 Freeze"}
                          </button>
                        </form>
                      )}
                    </td>

                    <td className="px-8 py-5 text-right">
                      {benchmark ? (
                        <div className="flex flex-col items-end gap-2">
                          <form
                            action={async () => {
                              "use server";
                              const thirtyDays = new Date();
                              thirtyDays.setDate(thirtyDays.getDate() + 30);
                              await setBenchmarkDeadline(
                                benchmark.id,
                                thirtyDays,
                              );
                            }}
                          >
                            <button className="text-[9px] font-black uppercase text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                              + 30 Days Window
                            </button>
                          </form>
                          <p className="text-[9px] font-bold text-slate-400 italic">
                            {benchmark.dueDate
                              ? `Deadline: ${new Date(benchmark.dueDate).toLocaleDateString()}`
                              : "No Auto-Freeze Set"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-300 uppercase font-black">
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
