"use client";

import { useState } from "react";
import { updateSelfValue } from "./actions";
import Toast from "@/components/Toast";

export default function LeaderEntryForm({
  sections = [],
}: {
  sections: any[];
}) {
  const [activeTab, setActiveTab] = useState(sections[0]?.code || "A");
  const [notification, setNotification] = useState<any>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  // Find index for Next/Prev logic
  const currentIndex = sections.findIndex((s) => s.code === activeTab);
  const currentSection = sections[currentIndex] || sections[0];

  const handleUpdate = async (criteriaId: string, value: number) => {
    setIsSaving(criteriaId);
    try {
      await updateSelfValue({ criteriaId, selfValue: value });
      setNotification({ message: "Progress saved!", type: "success" });
    } catch (err: any) {
      setNotification({ message: "Error saving progress", type: "error" });
    } finally {
      setIsSaving(null);
    }
  };

  // Navigation Logic
  const goToNext = () => {
    if (currentIndex < sections.length - 1) {
      setActiveTab(sections[currentIndex + 1].code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setActiveTab(sections[currentIndex - 1].code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 pb-32">
      {" "}
      {/* Increased bottom padding for the fixed nav */}
      {notification && (
        <Toast {...notification} onClose={() => setNotification(null)} />
      )}
      {/* Pillar Tabs */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto gap-2 shadow-sm sticky top-0 md:top-20 z-10 scrollbar-hide">
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
        <div className="px-6 md:px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">
              {currentSection.code}. {currentSection.title}
            </h3>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">
              Self-Reporting Portal
            </p>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Indicator</th>
                <th className="px-8 py-5 text-center">Target</th>
                <th className="px-8 py-5 text-center">Achievement</th>
                <th className="px-8 py-5 text-center">Variance</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentSection.criteria.map((c: any) => (
                <DesktopRow
                  key={c.id}
                  c={c}
                  isSaving={isSaving === c.id}
                  onUpdate={handleUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE STACKED VIEW */}
        <div className="md:hidden divide-y divide-slate-100">
          {currentSection.criteria.map((c: any) => {
            const variance = (c.selfValue || 0) - c.target;
            const isMet = variance >= 0;

            return (
              <div
                key={c.id}
                className={`p-6 space-y-4 relative ${isSaving === c.id ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 bg-blue-100 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black">
                    {c.serialNo}
                  </span>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {c.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Target
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {c.target}{" "}
                      <span className="text-[8px] opacity-50">
                        {c.unitOfMeasure}
                      </span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Variance
                    </p>
                    <p
                      className={`text-sm font-black ${isMet ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isMet ? "+" : ""}
                      {variance}
                    </p>
                  </div>
                  <button className="bg-blue-50 text-blue-600 p-3 rounded-2xl text-center flex flex-col items-center justify-center border border-blue-100">
                    <span className="text-[8px] font-black uppercase">
                      Evidence
                    </span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                    Actual Achievement
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      defaultValue={c.selfValue || ""}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-[20px] text-center font-black text-slate-900 text-lg focus:border-blue-500 outline-none shadow-sm"
                      onBlur={(e) => handleUpdate(c.id, Number(e.target.value))}
                    />
                    {isSaving === c.id && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-[20px] flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* FLOATING NAVIGATION FOOTER */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/90 backdrop-blur-md p-2 rounded-[24px] shadow-2xl border border-white/10 z-30 flex items-center justify-between">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 text-white disabled:opacity-30 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">
            Back
          </span>
        </button>

        <div className="h-8 w-px bg-white/10" />

        <div className="text-center">
          <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">
            Pillar
          </p>
          <p className="text-sm font-black text-white">{currentSection.code}</p>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <button
          onClick={goToNext}
          disabled={currentIndex === sections.length - 1}
          className="flex items-center gap-2 px-6 py-3 text-white disabled:opacity-30 transition-opacity"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">
            Next
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function DesktopRow({
  c,
  isSaving,
  onUpdate,
}: {
  c: any;
  isSaving: boolean;
  onUpdate: (id: string, val: number) => void;
}) {
  const variance = (c.selfValue || 0) - c.target;
  const isMet = variance >= 0;

  return (
    <tr
      className={`transition-colors group ${isSaving ? "bg-blue-50" : "hover:bg-slate-50/50"}`}
    >
      <td className="px-8 py-6">
        <span className="block text-[10px] font-black text-blue-600 mb-1">
          {c.serialNo}
        </span>
        <span className="text-sm font-semibold text-slate-700 block max-w-md">
          {c.description}
        </span>
      </td>
      <td className="px-8 py-6 text-center font-black text-slate-400">
        {c.target}{" "}
        <span className="text-[9px] uppercase opacity-60 ml-1">
          {c.unitOfMeasure}
        </span>
      </td>
      <td className="px-8 py-6 text-center">
        <input
          type="number"
          defaultValue={c.selfValue || ""}
          disabled={isSaving}
          className="w-24 p-3 bg-white border-2 border-slate-100 rounded-xl text-center font-black text-slate-900 focus:border-blue-500 outline-none transition-all"
          onBlur={(e) => onUpdate(c.id, Number(e.target.value))}
        />
      </td>
      <td className="px-8 py-6 text-center">
        <span
          className={`inline-block text-xs font-black px-3 py-1 rounded-lg ${isMet ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100"}`}
        >
          {isMet ? "+" : ""}
          {variance}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
          + Evidence
        </button>
      </td>
    </tr>
  );
}
