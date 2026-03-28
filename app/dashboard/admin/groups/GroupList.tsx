"use client";

import { useState } from "react";
import { upsertGroup, deleteGroup } from "./actions";
import Toast from "@/components/Toast";

export default function GroupList({ initialGroups }: { initialGroups: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertGroup({ id: editingGroup?.id, name: groupName });
      setNotification({
        msg: `Group ${editingGroup ? "updated" : "created"}!`,
        type: "success",
      });
      closeModal();
    } catch (err: any) {
      setNotification({ msg: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setGroupName("");
  };

  return (
    <>
      {notification && (
        <Toast
          message={notification.msg}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          + Add New Fellowship
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="responsive-table w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] uppercase text-slate-400 font-black bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4">Fellowship Name</th>
              <th className="px-6 py-4">Active Leaders</th>
              <th className="px-6 py-4">2025/2026 Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialGroups.map((group) => (
              <tr
                key={group.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-slate-800">
                  {group.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {group._count.users} Leaders
                </td>
                <td className="px-6 py-4">
                  {group.benchmarks.length > 0 ? (
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black border border-emerald-200">
                      INITIALIZED
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-black border border-amber-200">
                      PENDING DATA
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditingGroup(group);
                      setGroupName(group.name);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">
                {editingGroup ? "Edit Group" : "Create New Fellowship"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Group Name
                </label>
                <input
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Woman's Guild"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100"
              >
                {loading
                  ? "Processing..."
                  : editingGroup
                    ? "Update Group"
                    : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
