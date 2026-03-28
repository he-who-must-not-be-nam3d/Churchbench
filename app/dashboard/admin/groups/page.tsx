import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GroupList from "./GroupList";

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    redirect("/dashboard");

  // Fetch groups with user counts and current year benchmark status
  const groups = await prisma.group.findMany({
    include: {
      _count: { select: { users: true } },
      benchmarks: {
        where: { year: "2025/2026" }, // Targets current church year
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Group Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage fellowships and monitor benchmark initialization.
          </p>
        </div>
      </div>
      <GroupList initialGroups={groups} />
    </div>
  );
}
