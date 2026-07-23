"use client";

import React, { useEffect, useState } from "react";
import { GitPullRequest, CheckCircle2, XCircle, Clock, Star, Sparkles } from "lucide-react";
import { IRequest } from "@/types";
import { useSocket } from "@/hooks/useSocket";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (res.ok) setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    if (socket) {
      const handleRealtimeUpdate = () => fetchRequests();
      socket.on("request:created", handleRealtimeUpdate);
      socket.on("request:updated", handleRealtimeUpdate);

      return () => {
        socket.off("request:created", handleRealtimeUpdate);
        socket.off("request:updated", handleRealtimeUpdate);
      };
    }
  }, [socket]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/requests/${id}/approve`, { method: "POST" });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/requests/${id}/reject`, { method: "POST" });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter((r) =>
    filter === "ALL" ? true : r.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-orange-400" />
            Additional Selection Requests
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review and approve requests submitted by Jury panels to qualify an additional team beyond Top 2.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 glass-card rounded-xl border border-slate-800">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === st
                  ? "bg-blue-600 text-white shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading requests stream...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
          <GitPullRequest className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Jury panels can request an extra team selection beyond Top 2. Requests will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((reqItem) => {
            const team = reqItem.teamId as any;
            const room = reqItem.roomId as any;
            const jury = reqItem.juryId as any;

            return (
              <div
                key={reqItem._id}
                className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-400" /> Additional Qualification
                      </span>
                      <h3 className="font-bold text-white text-base mt-0.5">
                        Team: {team ? team.name : "Unknown Team"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {team ? team.college : ""}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                        reqItem.status === "APPROVED"
                          ? "badge-green"
                          : reqItem.status === "REJECTED"
                          ? "bg-red-950/60 text-red-400 border border-red-500/40"
                          : "badge-orange animate-pulse"
                      }`}
                    >
                      {reqItem.status === "APPROVED" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </>
                      ) : reqItem.status === "REJECTED" ? (
                        <>
                          <XCircle className="w-3 h-3" /> Rejected
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" /> Pending Review
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <span className="font-semibold text-slate-300 block">Jury Justification:</span>
                    <p className="text-slate-400 italic">"{reqItem.reason}"</p>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Room: {room ? room.name : "N/A"}</span>
                    <span>Jury: {jury ? jury.name : "N/A"}</span>
                  </div>
                </div>

                {reqItem.status === "PENDING" && (
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleReject(reqItem._id)}
                      data-magnetic="true"
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:border-red-500/50 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-semibold transition"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleApprove(reqItem._id)}
                      data-magnetic="true"
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-glow transition"
                    >
                      Approve Team
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
