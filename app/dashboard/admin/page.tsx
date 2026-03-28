import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

// Define a type that includes the relations we fetched in the query
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

  // Security: Ensure only ADMINS can access this specific route
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Calculate Dynamic Church Year (Oct to Sept cycle)
  const now = new Date();
  const currentMonth = now.getMonth();
  const startYear =
    currentMonth >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const dynamicYearLabel = `${startYear}/${startYear + 1}`;

  // Fetch all groups and their benchmark status for the current year
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
  });

  // Calculate System-Wide Stats
  const totalGroups = groups.length;
  const groupsWithBenchmarks = groups.filter(
    (g: GroupWithRelations) => g.benchmarks.length > 0,
  ).length;

  // Fix for 'acc' implicitly has an 'any' type
  const activeLeaders = groups.reduce(
    (acc: number, g: GroupWithRelations) => acc + g.users.length,
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          System Administration
        </h2>
        <p className="text-slate-500 mt-1">
          Parish-wide oversight for the {dynamicYearLabel} Performance Cycle.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase">
            Total Groups
          </p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{totalGroups}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase">
            Benchmarks Active
          </p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {groupsWithBenchmarks}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase">
            Registered Leaders
          </p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {activeLeaders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase">
            Global Compliance
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {totalGroups > 0
              ? Math.round((groupsWithBenchmarks / totalGroups) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Group Status Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">
            Fellowship & Committee Status
          </h3>
        </div>
        <div className="overflow-x-auto md:overflow-x-hidden">
          <table className="responsive-table w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-slate-400 font-semibold bg-slate-50/50">
                <th className="px-6 py-3">Group Name</th>
                <th className="px-6 py-3">Leader(s)</th>
                <th className="px-6 py-3">Benchmark Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((group: GroupWithRelations) => (
                <tr
                  key={group.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {group.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {group.users.length > 0
                      ? group.users[0].email
                      : "No Leader Assigned"}
                  </td>
                  <td className="px-6 py-4">
                    {group.benchmarks.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Initialized
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Pending Ingestion
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Prompt for Empty State */}
      {groupsWithBenchmarks === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl text-center">
          <div className="bg-blue-600 text-white p-3 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-blue-900">
            No Benchmarks Found
          </h4>
          <p className="text-blue-700 mt-2 max-w-sm">
            It looks like the {dynamicYearLabel} targets haven't been uploaded
            for any groups yet.
          </p>
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            Go to Benchmark Master
          </button>
        </div>
      )}
    </div>
  );
}
