"use client";

import { useState, useRef } from "react";
import {
  saveEvidenceToDb,
  deleteEvidence,
} from "@/app/dashboard/my-benchmark/actions";
import { useUploadThing } from "@/lib/uploadthing";

export default function EvidenceModal({
  criteria,
  onClose,
  isLocked = false, // Received from LeaderEntryForm
}: {
  criteria: any;
  onClose: () => void;
  isLocked?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("evidenceUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res[0]) {
        await saveEvidenceToDb({
          criteriaId: criteria.id,
          url: res[0].url,
          name: res[0].name,
          type: res[0].type,
        });
        setLoading(false);
      }
    },
    onUploadError: () => {
      alert("Upload failed.");
      setLoading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    await startUpload([file]);
  };

  const handleDelete = async (id: string) => {
    if (isLocked) return;
    if (confirm("Are you sure you want to remove this evidence?")) {
      await deleteEvidence(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md mt-12 md:mt-0 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-top-10 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
              Pillar {criteria.serialNo}
            </p>
            <h3 className="text-lg font-bold text-slate-900">
              Evidence {isLocked ? "Viewer" : "Manager"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 scrollbar-hide">
          <p className="text-sm font-semibold text-slate-600 italic">
            "{criteria.description}"
          </p>

          {/* Conditional Upload Section */}
          {!isLocked ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-2xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Camera
                </span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-2xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Files
                </span>
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                Read Only Mode
              </p>
            </div>
          )}

          {/* List of Files */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Gallery ({criteria.evidence?.length || 0})
            </h4>

            {loading && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-pulse">
                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Uploading...
                </span>
              </div>
            )}

            <div className="space-y-2">
              {criteria.evidence?.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <a
                      href={file.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden cursor-pointer"
                    >
                      {file.fileType.includes("image") ? (
                        <img
                          src={file.filePath}
                          className="h-full w-full object-cover"
                          alt="preview"
                        />
                      ) : (
                        <div className="text-blue-600">
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
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </a>
                    <div className="overflow-hidden leading-tight">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                        {file.fileName}
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Delete button only shown if NOT locked */}
                  {!isLocked && (
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
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
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {!loading &&
                (!criteria.evidence || criteria.evidence.length === 0) && (
                  <p className="text-center py-8 text-xs font-medium text-slate-400 italic">
                    No evidence attached yet.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Hidden Inputs */}
        <input
          type="file"
          ref={photoInputRef}
          hidden
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
        />
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
