"use client";

import { useState, useTransition } from "react";
import { updateSelfValue } from "./actions";
import Toast from "@/components/Toast";
import EvidenceModal from "@/components/EvidenceModal";

export default function LeaderEntryForm({
  sections = [],
  isLocked = false, // Received from parent page.tsx
}: {
  sections: any[];
  isLocked?: boolean;
}) {
  const [activeTab, setActiveTab] = useState(sections[0]?.code || "A");
  const [notification, setNotification] = useState<any>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<any>(null);

  const [isPending, startTransition] = useTransition();

  const currentIndex = sections.findIndex((s) => s.code === activeTab);
  const currentSection = sections[currentIndex] || sections[0];

  const handleUpdate = async (criteriaId: string, value: number) => {
    if (isLocked) return; // Guard clause
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

  const handleTabChange = (code: string) => {
    startTransition(() => {
      setActiveTab(code);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const goToNext = () => {
    if (currentIndex < sections.length - 1) {
      handleTabChange(sections[currentIndex + 1].code);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      handleTabChange(sections[currentIndex - 1].code);
    }
  };

  return (
    <div className="space-y-6 pb-32">
      {notification && (
        <Toast {...notification} onClose={() => setNotification(null)} />
      )}

      {/* LOCK BANNER */}
      {isLocked && (
        <div className="bg-slate-900 text-white p-5 rounded-[24px] flex items-center gap-4 border border-slate-800 shadow-xl animate-in slide-in-from-top-4 duration-500">
          <div className="h-10 w-10 bg-amber-400/20 rounded-xl flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
              Status: Locked
            </p>
            <p className="text-xs font-bold text-slate-300">
              The audit period has started. Editing is disabled.
            </p>
          </div>
        </div>
      )}

      {/* Pillar Tabs */}
      <div className="flex bg-white p-2 rounded-2xl border border-slate-200 overflow-x-auto gap-2 shadow-sm sticky top-0 md:top-20 z-10 scrollbar-hide">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => handleTabChange(s.code)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
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

        {/* MOBILE STACKED VIEW */}
        <div className="md:hidden divide-y divide-slate-100">
          {currentSection.criteria.map((c: any) => {
            const variance = (c.selfValue || 0) - c.target;
            const isMet = variance >= 0;
            const hasEvidence = c.evidence && c.evidence.length > 0;

            return (
              <div
                key={c.id}
                className={`p-6 space-y-4 relative ${isSaving === c.id ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 bg-blue-100 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black">
                    {c.serialNo}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      {c.description}
                    </p>
                    {hasEvidence && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-tight">
                        <span className="h-1 w-1 bg-emerald-600 rounded-full" />
                        {c.evidence.length} Evidence Uploaded
                      </span>
                    )}
                  </div>
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
                  <button
                    disabled={isLocked}
                    onClick={() => setSelectedCriteria(c)}
                    className={`p-3 rounded-2xl text-center flex flex-col items-center justify-center border transition-all active:scale-95 ${
                      isLocked
                        ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : hasEvidence
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600 cursor-pointer"
                          : "bg-blue-50 border-blue-100 text-blue-600 cursor-pointer"
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase">
                      {hasEvidence ? "View/Add" : "Evidence"}
                    </span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                    Actual Achievement
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      disabled={isLocked}
                      defaultValue={c.selfValue || ""}
                      className={`w-full p-4 border-2 rounded-[20px] text-center font-black text-lg outline-none shadow-sm transition-all ${
                        isLocked
                          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-white border-slate-100 text-slate-900 focus:border-blue-500 cursor-text"
                      }`}
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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/95 backdrop-blur-md p-2 rounded-[24px] shadow-2xl border border-white/10 z-30 flex items-center justify-between">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0 || isPending}
          className="flex items-center gap-2 px-6 py-3 text-white disabled:opacity-20 transition-opacity cursor-pointer group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 group-active:-translate-x-1 transition-transform"
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

        <div className="text-center min-w-[80px] flex flex-col items-center justify-center">
          {isPending ? (
            <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin my-1"></div>
          ) : (
            <>
              <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">
                Pillar
              </p>
              <p className="text-sm font-black text-white">
                {currentSection.code}
              </p>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-white/10" />

        <button
          onClick={goToNext}
          disabled={currentIndex === sections.length - 1 || isPending}
          className="flex items-center gap-2 px-6 py-3 text-white disabled:opacity-20 transition-opacity cursor-pointer group"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">
            Next
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 group-active:translate-x-1 transition-transform"
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

      {selectedCriteria && (
        <EvidenceModal
          criteria={selectedCriteria}
          onClose={() => setSelectedCriteria(null)}
          isLocked={isLocked} // Ensure modal also knows if it should disable uploads
        />
      )}
    </div>
  );
}
