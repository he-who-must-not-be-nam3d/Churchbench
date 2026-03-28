import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditBenchmarkDirectory() {
  const session = await getServerSession(authOptions);

  // Security: Ensure only ADMIN can access the Master Edit list
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch groups and their LATEST benchmark (Year-Agnostic)
  const groups = await prisma.group.findMany({
    include: {
      benchmarks: {
        orderBy: {
          createdAt: "desc", // Always get the most recently created/updated benchmark
        },
        take: 1, // We only need the current active one to provide the link
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 px-4 md:px-0">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Manage Benchmarks
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Select a fellowship to edit their master targets, weights, and
          indicators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const latestBenchmark = group.benchmarks[0];
          const hasBenchmark = !!latestBenchmark;
          const benchmarkId = latestBenchmark?.id;
          const benchmarkYear = latestBenchmark?.year;

          return (
            <div
              key={group.id}
              className={`group relative bg-white p-8 rounded-[32px] border transition-all duration-300 ${
                hasBenchmark
                  ? "border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
                  : "border-slate-100 opacity-60"
              }`}
            >
              <div className="space-y-4">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                    hasBenchmark
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-50 text-slate-300"
                  }`}
                >
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800 truncate">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${hasBenchmark ? "text-blue-600" : "text-slate-400"}`}
                    >
                      {hasBenchmark
                        ? `Cycle: ${benchmarkYear}`
                        : "No Data Found"}
                    </p>
                  </div>
                </div>

                {hasBenchmark ? (
                  <Link
                    href={`/dashboard/admin/ingestion/edit/${benchmarkId}`}
                    className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all"
                  >
                    Edit Master Template
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/admin/ingestion"
                    className="flex items-center justify-center w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold"
                  >
                    Upload .docx First
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper Note */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4 items-start mx-4 md:mx-0">
        <div className="text-blue-600 mt-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="text-sm text-blue-800 leading-relaxed">
          <p className="font-bold mb-1">Dynamic Cycle Detection</p>
          This page now automatically detects the most recent benchmark for each
          fellowship. When you update the cycle year in the editor, the change
          will reflect here instantly.
        </div>
      </div>
    </div>
  );
}
