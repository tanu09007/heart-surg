import React from 'react';
import { X, FileText, Calendar, Download, Eye, ExternalLink } from 'lucide-react';

export default function ReportViewerModal({ report, isOpen, onClose }) {
  if (!isOpen || !report) return null;

  const isPdf = report.fileType === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{report.title}</h3>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">
                  {report.category}
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                </span>
                <span className="uppercase font-mono text-[11px] text-slate-400">
                  {report.fileType}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[320px] max-h-[500px]">
            {isPdf ? (
              <div className="p-8 text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base mb-1">
                  {report.title}
                </h4>
                <p className="text-xs text-slate-400 mb-4 font-mono">
                  Official Medical Laboratory & Diagnostic PDF Record
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-left text-xs text-slate-300 mb-4 space-y-1">
                  <p><span className="text-slate-500">Document Type:</span> Clinical Diagnostic Document</p>
                  <p><span className="text-slate-500">Security:</span> HIPAA Compliant Encrypted Tele-Archive</p>
                  <p><span className="text-slate-500">Status:</span> Verified by Surgical Staff</p>
                </div>
                <a
                  href="#pdf-view"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('about:blank', '_blank');
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open PDF in Full Screen</span>
                </a>
              </div>
            ) : report.previewUrl ? (
              <img
                src={report.previewUrl}
                alt={report.title}
                className="max-h-[500px] w-full object-contain"
              />
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Scan preview unavailable
              </div>
            )}
          </div>

          {/* Clinical Findings & Summary */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Diagnostic Findings & Doctor's Notes</span>
            </h5>
            <p className="text-sm text-slate-300 leading-relaxed">
              {report.summary || 'Uploaded document undergoing clinical evaluation.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            CardioTrack Secured Document Archive
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
