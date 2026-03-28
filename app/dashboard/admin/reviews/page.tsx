"use client";

import { useState } from "react";
import { updateCriteriaScore } from "./actions";
import Toast from "@/components/Toast";

export default function ReviewList({ sections = [] }: { sections: any[] }) {
  // Safety check: Initialize with the first section code if available
  // This prevents the "undefined (reading '0')" error if the database returns no sections
  const [activeTab, setActiveTab] = useState(
    sections.length > 0 ? sections[0].code : "",
  );
  const [notification, setNotification] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleGradeUpdate = async (
    criteriaId: string,
    score: number,
    note?: string,
  ) => {
    setIsUpdating(criteriaId);
    try {
      await updateCriteriaScore({
        criteriaId,
        reviewerScore: score,
        reviewerNote: note,
      });
      setNotification({ message: "Score saved successfully", type: "success" });
    } catch (err: any) {
      setNotification({
        message: err.message || "Failed to update",
        type: "error",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Find the current section safely
  const currentSection =
    sections.find((s) => s.code === activeTab) || sections[0];

  // If the server passes an empty array, show a friendly message instead of crashing
  if (!sections || sections.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">
          No benchmark data available for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Toast {...notification} onClose={() => setNotification(null)} />
      )}

      {/* Pillar Tabs: Added horizontal scroll for mobile responsiveness */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto gap-2 shadow-sm sticky top-20 z-10 scrollbar-hide">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.code)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === s.code
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            Pillar {s.code}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="px-6 md:px-10 py-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">
              {currentSection?.code}. {currentSection?.title}
            </h3>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">
              Audit Mode: Official Verification
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1">
              Weight: {currentSection?.weightTotal}%
            </p>
          </div>
        </div>

        {/* Responsive Table Wrapper: Allows swiping on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Activity / Indicator</th>
                <th className="px-8 py-5 text-center">Target</th>
                <th className="px-8 py-5 text-center">Leader Claim (Self)</th>
                <th className="px-8 py-5 text-center bg-blue-50/30">
                  Reviewer Score
                </th>
                <th className="px-8 py-5">Reviewer Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentSection?.criteria.map((c: any) => (
                <tr
                  key={c.id}
                  className={`transition-colors group ${isUpdating === c.id ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
                >
                  <td className="px-8 py-6">
                    <span className="block text-[10px] font-black text-blue-600 mb-1">
                      {c.serialNo}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 block max-w-sm leading-relaxed">
                      {c.description}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-900">
                      {c.target}
                    </span>
                    <span className="ml-1 text-[9px] font-bold text-slate-400 uppercase">
                      {c.unitOfMeasure}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-black border border-amber-100">
                      {c.selfValue || 0}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center bg-blue-50/30">
                    <input
                      type="number"
                      defaultValue={c.reviewerScore}
                      disabled={isUpdating === c.id}
                      className="w-20 p-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-center focus:ring-2 focus:ring-blue-600 outline-none shadow-sm disabled:opacity-50"
                      onBlur={(e) =>
                        handleGradeUpdate(
                          c.id,
                          Number(e.target.value),
                          c.reviewerNote,
                        )
                      }
                    />
                  </td>
                  <td className="px-8 py-6">
                    <input
                      type="text"
                      placeholder="Add feedback..."
                      defaultValue={c.reviewerNote || ""}
                      disabled={isUpdating === c.id}
                      className="w-full p-2 bg-transparent border-b border-slate-100 text-xs font-medium focus:border-blue-300 outline-none transition-all disabled:opacity-50"
                      onBlur={(e) =>
                        handleGradeUpdate(c.id, c.reviewerScore, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="px-4 text-[10px] font-bold text-slate-400 uppercase">
        * Auditor changes are saved automatically when clicking outside the
        input fields.
      </p>
    </div>
  );
}
