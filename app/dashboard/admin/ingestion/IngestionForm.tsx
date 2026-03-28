"use client";

import { useState, useEffect } from "react";
import { saveParsedBenchmark } from "./actions";
import { parseBenchmarkDoc } from "@/lib/benchmark-parser";
import Toast from "@/components/Toast";

export default function IngestionForm({ groups }: { groups: any[] }) {
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [notification, setNotification] = useState<any>(null);

  const CACHE_KEY = "churchbench_ingestion_data";

  // Initial States
  const [groupId, setGroupId] = useState("");
  const [year, setYear] = useState("2024/2025");
  const [sections, setSections] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // 1. Load from Cache (Run once on mount)
  useEffect(() => {
    const savedData = localStorage.getItem(CACHE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setGroupId(parsed.groupId || "");
        setYear(parsed.year || "2024/2025");
        setSections(parsed.sections || []);
        setCurrentStep(parsed.currentStep || 0);
      } catch (e) {
        console.error("Cache parsing failed", e);
      }
    }
  }, []);

  // 2. Save to Cache (Fixed: Dependency array size remains constant)
  useEffect(() => {
    if (sections.length > 0 || groupId !== "" || year !== "2024/2025") {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ groupId, year, sections, currentStep }),
      );
    }
  }, [groupId, year, sections, currentStep]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    try {
      const parsedData = await parseBenchmarkDoc(file);
      setSections(parsedData);
      setCurrentStep(1);
      setNotification({
        message: "Document parsed! Please verify the Church Year and Pillars.",
        type: "success",
      });
    } catch (err: any) {
      setNotification({
        message: "Parse failed. Check document format.",
        type: "error",
      });
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!groupId) return alert("Select a fellowship first");
    if (!year || year.trim() === "") return alert("Please enter a Church Year");

    setLoading(true);
    try {
      await saveParsedBenchmark({ groupId, year, sections });
      setNotification({
        message: "Benchmark Successfully Published!",
        type: "success",
      });

      // Clear all states and cache on success
      localStorage.removeItem(CACHE_KEY);
      setSections([]);
      setGroupId("");
      setYear("2024/2025");
      setCurrentStep(0);
    } catch (err: any) {
      setNotification({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, sections.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const activeSection = sections[currentStep - 1];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {notification && (
        <Toast {...notification} onClose={() => setNotification(null)} />
      )}

      {/* HEADER: Fellowship Selection and Editable Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-0 z-20">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
            Target Fellowship
          </label>
          <select
            className="w-full p-3 rounded-xl border font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">Select Fellowship...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
            Church Year (Editable)
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-xl border font-bold text-center bg-white outline-none focus:ring-2 focus:ring-blue-500 text-blue-600 placeholder-slate-300"
            placeholder="e.g. 2024/2025"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>

      {/* Progress Tracker */}
      {sections.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {sections.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all duration-500 shrink-0 ${currentStep > i ? "bg-blue-600" : "bg-slate-100"}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Pillar {activeSection?.code || "Draft"} — Step {currentStep} of{" "}
            {sections.length}
          </span>
        </div>
      )}

      {/* STEP 0: UPLOAD AREA */}
      {currentStep === 0 && (
        <div className="relative border-4 border-dashed border-slate-100 bg-white rounded-[40px] p-10 md:p-20 text-center hover:border-blue-400 transition-all group animate-in fade-in zoom-in-95 duration-300">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="space-y-4">
            <div className="mx-auto h-20 w-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 group-hover:rotate-12 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {parsing ? "Analyzing Document..." : "Upload Fellowship Contract"}
            </h2>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">
              Upload the .docx file to map indicators to church pillars.
            </p>
          </div>
        </div>
      )}

      {/* STEPS 1-7: REVIEW PORTAL */}
      {currentStep > 0 && activeSection && (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 md:px-10 py-8 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                  Reviewing Church Pillar
                </p>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {activeSection.code}. {activeSection.title}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">
                  Section Weight
                </p>
                <p className="text-4xl font-black text-blue-400">
                  {activeSection.weightTotal}
                  <span className="text-xl">%</span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-5">Sr#</th>
                    <th className="px-8 py-5">Indicator Description</th>
                    <th className="px-8 py-5">Metric</th>
                    <th className="px-8 py-5 text-right">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeSection.criteria.map((c: any, cIdx: number) => (
                    <tr
                      key={cIdx}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-8 py-5 font-bold text-slate-400">
                        {c.serialNo}
                      </td>
                      <td className="px-8 py-5">
                        <textarea
                          className="w-full bg-transparent font-semibold text-slate-700 outline-none focus:text-blue-600 border-b border-transparent focus:border-blue-100 py-1 resize-none"
                          value={c.description}
                          rows={2}
                          onChange={(e) => {
                            const n = [...sections];
                            n[currentStep - 1].criteria[cIdx].description =
                              e.target.value;
                            setSections(n);
                          }}
                        />
                      </td>
                      <td className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">
                        {c.unitOfMeasure}
                      </td>
                      <td className="px-8 py-5 text-right font-black text-blue-600 text-lg">
                        {c.target}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={prevStep}
              className="px-10 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50 shadow-sm"
            >
              PREVIOUS
            </button>
            {currentStep < sections.length ? (
              <button
                onClick={nextStep}
                className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-2xl hover:bg-black transition-all"
              >
                CONFIRM & NEXT PILLAR →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "PUBLISHING..." : "PUBLISH BENCHMARK"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
