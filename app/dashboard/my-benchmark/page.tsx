import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LeaderEntryForm from "./LeaderEntryForm";

export default async function MyBenchmarkPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // 1. Identify the Leader's Group
  const userWithGroup = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
    select: { groupId: true },
  });

  if (!userWithGroup?.groupId) {
    return (
      <div className="p-12 text-center bg-white rounded-[32px] border border-slate-200">
        <h2 className="text-xl font-bold">No Fellowship Assigned</h2>
        <p className="text-slate-500 text-sm mt-2">
          Please contact the Admin to assign you to a fellowship.
        </p>
      </div>
    );
  }

  // 2. Fetch the latest benchmark for their group
  const benchmark = await prisma.benchmark.findFirst({
    where: {
      groupId: userWithGroup.groupId,
      isClosed: false,
    },
    include: {
      group: true,
      sections: {
        orderBy: { code: "asc" },
        include: {
          criteria: {
            orderBy: { serialNo: "asc" },
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
        <p className="text-slate-500 text-sm mt-2">
          The Admin has not yet uploaded the contract for your fellowship.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            — Cycle {benchmark.year}
          </p>
        </div>
      </div>

      <LeaderEntryForm sections={benchmark.sections} />
    </div>
  );
}
