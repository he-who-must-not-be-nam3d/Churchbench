import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserList from "./UserList"; // The component from the previous step

export default async function UserDirectoryPage() {
  const session = await getServerSession(authOptions);

  // 1. Security check
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  // 2. Fetch Users and Groups in parallel for the modal
  const [users, groups] = await Promise.all([
    prisma.user.findMany({
      include: { group: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.group.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">
            Manage roles, reset passwords, and assign groups for PCEA Nkoroi
            staff.
          </p>
        </div>
      </div>

      {/* 3. Pass data to the Client Component that handles the Modal state */}
      <UserList users={users} groups={groups} />
    </div>
  );
}
