"use client";

import { useState, useTransition, useEffect } from "react";
import { updateSelfValue } from "./actions";
import Toast from "@/components/Toast";
import EvidenceModal from "@/components/EvidenceModal";

export default function LeaderEntryForm({
  sections = [],
  isLocked = false,
}: {
  sections: any[];
  isLocked?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  // Initialize the first tab once data is available
  useEffect(() => {
    if (sections.length > 0 && !activeTab) {
      setActiveTab(sections[0].code);
    }
  }, [sections, activeTab]);

  const currentSection =
    sections.find((s) => s.code === activeTab) || sections[0];
  const currentIndex = sections.findIndex(
    (s) => s.code === (activeTab || sections[0]?.code),
  );

  const handleUpdate = async (criteriaId: string, value: number) => {
    if (isLocked) return;
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

  if (!sections || sections.length === 0) return null;
  if (!currentSection) return null;

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

      {/* PILLAR TABS */}
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

      {/* CONTENT CARD */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-10 py-8 bg-slate-900 text-white">
          <h3 className="text-2xl font-bold uppercase tracking-tight">
            {currentSection.code}. {currentSection.title}
          </h3>
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Self-Reporting Portal
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {currentSection.criteria?.map((c: any) => {
            const variance = (c.selfValue || 0) - c.target;
            const isMet = variance >= 0;
            const hasEvidence = c.evidence && c.evidence.length > 0;

            return (
              <div key={c.id} className="p-6 md:px-10 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 bg-blue-100 text-blue-700 h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black">
                    {c.serialNo}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      {c.description}
                    </p>
                    {hasEvidence && (
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">
                        ● {c.evidence.length} Evidence Uploaded
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 text-center">
                      Target
                    </p>
                    <p className="text-sm font-black text-slate-900 text-center">
                      {c.target}{" "}
                      <span className="text-[8px] opacity-50">
                        {c.unitOfMeasure}
                      </span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 text-center">
                      Variance
                    </p>
                    <p
                      className={`text-sm font-black text-center ${isMet ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {isMet ? "+" : ""}
                      {variance}
                    </p>
                  </div>

                  <div className="col-span-1">
                    <input
                      type="number"
                      disabled={isLocked}
                      defaultValue={c.selfValue || ""}
                      placeholder="0"
                      className={`w-full p-3 border-2 rounded-2xl text-center font-black outline-none transition-all ${
                        isLocked
                          ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-white border-slate-100 focus:border-blue-500"
                      }`}
                      onBlur={(e) => handleUpdate(c.id, Number(e.target.value))}
                    />
                  </div>

                  <button
                    disabled={isLocked}
                    onClick={() => setSelectedCriteria(c)}
                    className={`p-3 rounded-2xl font-black text-[10px] uppercase border transition-all ${
                      isLocked
                        ? "opacity-30 grayscale cursor-not-allowed"
                        : "cursor-pointer active:scale-95"
                    } ${hasEvidence ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                  >
                    {hasEvidence ? "View Evidence" : "+ Add Proof"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER NAV BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900 p-2 rounded-[24px] shadow-2xl flex items-center justify-between z-50">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 text-white disabled:opacity-20 cursor-pointer"
        >
          <span className="text-[10px] font-black uppercase">Back</span>
        </button>
        <div className="text-white font-black text-xs uppercase tracking-widest">
          Pillar {currentSection.code}
        </div>
        <button
          onClick={goToNext}
          disabled={currentIndex === sections.length - 1}
          className="px-6 py-3 text-white disabled:opacity-20 cursor-pointer"
        >
          <span className="text-[10px] font-black uppercase">Next</span>
        </button>
      </div>

      {selectedCriteria && (
        <EvidenceModal
          criteria={selectedCriteria}
          onClose={() => setSelectedCriteria(null)}
          isLocked={isLocked}
        />
      )}
    </div>
  );
}
