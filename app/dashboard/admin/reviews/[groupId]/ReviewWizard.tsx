"use client";

import { useState } from "react";
import { updateCriteriaScore } from "../actions";
import Toast from "@/components/Toast";

export default function ReviewWizard({ benchmark }: { benchmark: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const sections = benchmark.sections;

  const handleUpdate = async (
    submissionId: string,
    value: number,
    status: any,
  ) => {
    setLoading(true);
    try {
      await updateCriteriaScore({
        criteriaId: submissionId,
        reviewerScore: value,
        reviewerNote: status,
      });
      setNotification({
        message: "Data updated & saved to Neon",
        type: "success",
      });
    } catch (err: any) {
      setNotification({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const activeSection = sections[currentStep];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {notification && (
        <Toast {...notification} onClose={() => setNotification(null)} />
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((s: any, i: number) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all flex-shrink-0 ${
              currentStep === i
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            Pillar {s.code}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
        <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {activeSection.code}. {activeSection.title}
          </h2>
          <span className="bg-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">
            Weight: {activeSection.weightTotal}%
          </span>
        </div>

        <div className="p-4">
          <table className="responsive-table w-full text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-4">Indicator</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Achieved (Editable)</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeSection.criteria.map((c: any) => {
                const sub = c.submissions[0] || {
                  achievedValue: 0,
                  status: "PENDING",
                  id: "",
                };
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-400">
                        {c.serialNo}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 max-w-sm">
                        {c.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-600">
                      {c.target} {c.unitOfMeasure}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className="w-24 p-2 border rounded-xl font-black text-center text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        defaultValue={sub.achievedValue}
                        onBlur={(e) =>
                          handleUpdate(
                            sub.id,
                            Number(e.target.value),
                            sub.status,
                          )
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        className={`text-[10px] font-black p-2 rounded-lg border outline-none ${
                          sub.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                        defaultValue={sub.status}
                        onChange={(e) =>
                          handleUpdate(
                            sub.id,
                            sub.achievedValue,
                            e.target.value,
                          )
                        }
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
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
