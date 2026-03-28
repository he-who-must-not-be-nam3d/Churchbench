"use client";

import { useState } from "react";
import { Role, Group } from "@prisma/client";
import UserEditModal from "@/components/UserEditModal";
import Toast from "@/components/Toast"; // Ensure this component exists

interface UserListProps {
  users: any[];
  groups: Group[];
}

export default function UserList({ users, groups }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Triggered when UserEditModal successfully saves
  const handleUpdateSuccess = (message: string) => {
    setNotification({ message, type: "success" });
    setSelectedUser(null);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "REVIEWER":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <>
      {/* Dynamic Notification Popup */}
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="responsive-table w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] uppercase text-slate-400 font-black bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4">User Identity</th>
              <th className="px-6 py-4">System Access</th>
              <th className="px-6 py-4">Fellowship / Group</th>
              <th className="px-6 py-4 text-right pr-10">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${getRoleBadge(user.role)}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                  {user.group?.name || (
                    <span className="text-slate-300 italic font-normal">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right pr-10">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Account
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          groups={groups}
          onClose={() => setSelectedUser(null)}
          onSuccess={handleUpdateSuccess} // Passes the feedback trigger to the modal
        />
      )}
    </>
  );
}
