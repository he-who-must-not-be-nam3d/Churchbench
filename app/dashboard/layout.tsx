import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
// 1. Notice the curly braces {} - we are importing named exports now
import {
  NavProvider,
  MobileSidebar,
  MobileTrigger,
} from "@/components/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  const userEmail = session.user?.email;

  const now = new Date();
  const currentMonth = now.getMonth();
  const startYear =
    currentMonth >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const dynamicYearLabel = `${startYear}/${startYear + 1}`;

  return (
    <NavProvider>
      <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
        {/* 2. Changed from <MobileNav> to <MobileSidebar> */}
        <MobileSidebar>
          <div className="p-6 border-b border-slate-50">
            <h1 className="text-xl font-black text-blue-700 tracking-tight">
              ChurchBench
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
              PCEA Nkoroi Parish
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4 space-y-8">
            <div>
              <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Menu
              </p>
              <nav className="space-y-1">
                <Link
                  href={
                    userRole === "ADMIN" ? "/dashboard/admin" : "/dashboard"
                  }
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Overview
                </Link>

                {userRole === "LEADER" && (
                  <Link
                    href="/dashboard/my-benchmark"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    Submit Benchmarks
                  </Link>
                )}

                {(userRole === "REVIEWER" || userRole === "ADMIN") && (
                  <Link
                    href="/dashboard/admin/reviews"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    Performance Reviews
                  </Link>
                )}
              </nav>
            </div>

            {userRole === "ADMIN" && (
              <div>
                <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Administration
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/dashboard/admin/groups"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 rounded-xl"
                  >
                    Group Management
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 rounded-xl"
                  >
                    User Directory
                  </Link>
                  <Link
                    href="/dashboard/admin/ingestion"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 rounded-xl"
                  >
                    Benchmark Master
                  </Link>
                  <Link
                    href="/dashboard/admin/ingestion/edit"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 rounded-xl"
                  >
                    Manage Benchmarks
                  </Link>
                </nav>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {userEmail?.[0].toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {userEmail}
                </p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </MobileSidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shrink-0">
            <div className="flex items-center">
              {/* 3. The Hamburger Icon Button */}
              <MobileTrigger />

              <div className="text-sm font-medium text-slate-500 hidden sm:block">
                Cycle:{" "}
                <span className="text-slate-900 font-bold">
                  {dynamicYearLabel}
                </span>
              </div>
            </div>
            <LogoutButton />
          </header>

          <main className="p-4 md:p-8 flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </NavProvider>
  );
}
