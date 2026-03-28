"use client";

import { useState } from "react";
import { updateMasterCriteria, updateBenchmarkCycle } from "../actions";
import Toast from "@/components/Toast";

export default function EditWizard({ benchmark }: { benchmark: any }) {
  const [isEditingCycle, setIsEditingCycle] = useState(false);
  const [tempYear, setTempYear] = useState(benchmark.year);
  const [currentStep, setCurrentStep] = useState(0);
  const [notification, setNotification] = useState<any>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const sections = benchmark.sections;
  const activeSection = sections[currentStep];

  // 1. Logic for updating the Church Year cycle
  const handleCycleUpdate = async () => {
    try {
      await updateBenchmarkCycle({
        benchmarkId: benchmark.id,
        newYear: tempYear,
      });
      setIsEditingCycle(false);
      setNotification({
        message: "Church Year updated successfully",
        type: "success",
      });
    } catch (err: any) {
      setNotification({
        message: "Update failed: Cycle already exists or server error",
        type: "error",
      });
    }
  };

  // 2. Logic for updating specific Criteria rows on Blur
  const handleBlurUpdate = async (
    cId: string,
    currentCriteria: any,
    field: string,
    newValue: any,
  ) => {
    if (currentCriteria[field] === newValue) return;

    setIsSaving(cId);
    try {
      const updatedData = {
        id: cId,
        description:
          field === "description" ? newValue : currentCriteria.description,
        unitOfMeasure:
          field === "unitOfMeasure" ? newValue : currentCriteria.unitOfMeasure,
        weight: field === "weight" ? Number(newValue) : currentCriteria.weight,
        target: field === "target" ? Number(newValue) : currentCriteria.target,
      };

      await updateMasterCriteria(updatedData);
      setNotification({
        message: `Indicator ${currentCriteria.serialNo} updated.`,
        type: "success",
      });
    } catch (err) {
      setNotification({
        message: "Failed to update master record.",
        type: "error",
      });
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Toast {...notification} onClose={() => setNotification(null)} />
      )}

      {/* Cycle Configuration Header */}
      <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-lg shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
              Active Benchmark Cycle
            </p>
            {isEditingCycle ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  className="bg-white text-slate-900 px-3 py-1 rounded-lg font-bold text-sm outline-none w-28"
                  value={tempYear}
                  onChange={(e) => setTempYear(e.target.value)}
                />
                <button
                  onClick={handleCycleUpdate}
                  className="bg-emerald-500 px-3 py-1 rounded-lg text-xs font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingCycle(false)}
                  className="text-xs font-bold opacity-70"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h3 className="text-xl font-black flex items-center gap-2">
                {tempYear}
                <button
                  onClick={() => setIsEditingCycle(true)}
                  className="p-1 hover:bg-white/20 rounded-md transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </h3>
            )}
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
            Fellowship
          </p>
          <p className="font-bold">{benchmark.group.name}</p>
        </div>
      </div>

      {/* Pillar Navigation Tabs (A-G) */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto gap-2 shadow-sm sticky top-20 z-10">
        {sections.map((s: any, i: number) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              currentStep === i
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            Pillar {s.code}
          </button>
        ))}
      </div>

      {/* Main Editor Table with Mobile Responsiveness */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {activeSection.code}. {activeSection.title}
            </h2>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">
              Editing Section Blueprint
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1">
              Total Weight
            </p>
            <p className="text-3xl font-black text-blue-400">
              {activeSection.weightTotal}%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">ID</th>
                <th className="px-8 py-5 w-1/2">Indicator Description</th>
                <th className="px-8 py-5">Unit</th>
                <th className="px-8 py-5">Weight</th>
                <th className="px-8 py-5 text-right">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeSection.criteria.map((c: any) => (
                <tr
                  key={c.id}
                  className={`group transition-colors ${isSaving === c.id ? "bg-blue-50/50" : "hover:bg-slate-50/50"}`}
                >
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-400">
                      {c.serialNo}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <textarea
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 resize-none p-0 leading-relaxed"
                      defaultValue={c.description}
                      rows={2}
                      onBlur={(e) =>
                        handleBlurUpdate(c.id, c, "description", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-8 py-5">
                    <input
                      className="w-16 bg-transparent border-none focus:ring-0 text-[10px] font-black text-slate-500 uppercase p-0"
                      defaultValue={c.unitOfMeasure}
                      onBlur={(e) =>
                        handleBlurUpdate(
                          c.id,
                          c,
                          "unitOfMeasure",
                          e.target.value,
                        )
                      }
                    />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className="w-10 bg-transparent border-none focus:ring-0 text-sm font-black text-slate-900 p-0"
                        defaultValue={c.weight}
                        onBlur={(e) =>
                          handleBlurUpdate(c.id, c, "weight", e.target.value)
                        }
                      />
                      <span className="text-[10px] font-bold text-slate-300">
                        %
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <input
                      type="number"
                      className="w-20 bg-transparent border-none focus:ring-0 text-sm font-black text-blue-600 text-right p-0"
                      defaultValue={c.target}
                      onBlur={(e) =>
                        handleBlurUpdate(c.id, c, "target", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase text-center sm:text-left">
          Changes are saved automatically when you click away from a field.
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase disabled:opacity-30"
          >
            Previous
          </button>
          <button
            disabled={currentStep === sections.length - 1}
            onClick={() => setCurrentStep((prev) => prev + 1)}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
