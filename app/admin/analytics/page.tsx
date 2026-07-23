"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2, TrendingUp, Layers } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const downloadExcel = () => {
    window.open("/api/export/excel", "_blank");
  };

  const downloadCSV = () => {
    window.open("/api/export/csv", "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Analytics & Data Exports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate executive reports, score distributions, and export full hackathon data to Excel & CSV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            data-magnetic="true"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <FileText className="w-3.5 h-3.5 text-orange-400" /> Export CSV
          </button>
          <button
            onClick={downloadExcel}
            data-magnetic="true"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-glow transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Excel (.xlsx)
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Calculating hackathon metrics...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Average Criteria Score Breakdown */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              Criteria Average Score Distribution (Max 20 Each)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
              {[
                { name: "Innovation", score: data.averages.innovation, color: "from-blue-600 to-indigo-600" },
                { name: "Tech Excellence", score: data.averages.technicalExcellence, color: "from-indigo-600 to-purple-600" },
                { name: "Presentation", score: data.averages.presentation, color: "from-purple-600 to-pink-600" },
                { name: "Feasibility", score: data.averages.feasibility, color: "from-orange-500 to-amber-500" },
                { name: "Impact", score: data.averages.impact, color: "from-emerald-500 to-teal-500" },
              ].map((c) => (
                <div key={c.name} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">{c.name}</span>
                  <div className="text-xl font-black text-white">{c.score} / 20</div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${c.color}`}
                      style={{ width: `${(c.score / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Progress Metrics */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Evaluation Progress Per Room
            </h3>

            {data.roomMetrics.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No rooms available for metrics.
              </div>
            ) : (
              <div className="space-y-3">
                {data.roomMetrics.map((rm: any) => (
                  <div
                    key={rm.roomNumber}
                    className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">
                        {rm.roomName} (#{rm.roomNumber})
                      </span>
                      <span className="text-slate-400 font-medium">
                        {rm.evaluated}/{rm.teams} Teams ({rm.completion}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-orange-500 h-full transition-all duration-500"
                        style={{ width: `${rm.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
