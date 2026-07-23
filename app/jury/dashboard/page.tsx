"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Lock,
  Unlock,
  PlusCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  X,
  Sliders,
  Send,
  Star,
  Layers,
} from "lucide-react";
import { ITeam, IEvaluation, IRoom } from "@/types";
import { useSocket } from "@/hooks/useSocket";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

export default function JuryDashboardPage() {
  const [room, setRoom] = useState<IRoom | null>(null);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [evaluations, setEvaluations] = useState<IEvaluation[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Team for Evaluation Modal
  const [evalTeam, setEvalTeam] = useState<ITeam | null>(null);
  const [innovation, setInnovation] = useState(15);
  const [techExcellence, setTechExcellence] = useState(15);
  const [presentation, setPresentation] = useState(15);
  const [feasibility, setFeasibility] = useState(15);
  const [impact, setImpact] = useState(15);
  const [remarks, setRemarks] = useState("");
  const [submittingEval, setSubmittingEval] = useState(false);
  const [evalError, setEvalError] = useState("");

  // Request Additional Team Selection Modal
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqTeamId, setReqTeamId] = useState("");
  const [reqReason, setReqReason] = useState("");
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqMsg, setReqMsg] = useState("");

  // Team Profile View Drawer
  const [profileTeam, setProfileTeam] = useState<ITeam | null>(null);

  const { socket } = useSocket(room?._id);

  const fetchJuryData = async () => {
    try {
      setLoading(true);
      const [roomRes, teamRes, evalRes, leaderRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/teams"),
        fetch("/api/evaluations"),
        fetch("/api/leaderboard"),
      ]);

      if (roomRes.ok) {
        const rData = await roomRes.json();
        if (rData.rooms && rData.rooms.length > 0) setRoom(rData.rooms[0]);
      }
      if (teamRes.ok) {
        const tData = await teamRes.json();
        setTeams(tData.teams || []);
      }
      if (evalRes.ok) {
        const eData = await evalRes.json();
        setEvaluations(eData.evaluations || []);
      }
      if (leaderRes.ok) {
        const lData = await leaderRes.json();
        if (lData.leaderboards && lData.leaderboards.length > 0) {
          setLeaderboard(lData.leaderboards[0].leaderboard || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuryData();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleSync = () => fetchJuryData();
      socket.on("team:added", handleSync);
      socket.on("team:updated", handleSync);
      socket.on("team:deleted", handleSync);
      socket.on("evaluation:submitted", handleSync);
      socket.on("request:updated", handleSync);
      socket.on("room:lock_changed", handleSync);

      return () => {
        socket.off("team:added", handleSync);
        socket.off("team:updated", handleSync);
        socket.off("team:deleted", handleSync);
        socket.off("evaluation:submitted", handleSync);
        socket.off("request:updated", handleSync);
        socket.off("room:lock_changed", handleSync);
      };
    }
  }, [socket]);

  const openEvaluationModal = (team: ITeam) => {
    const existing = evaluations.find(
      (e) => (e.teamId as any)?._id === team._id || e.teamId === team._id
    );
    if (existing) {
      setInnovation(existing.innovation);
      setTechExcellence(existing.technicalExcellence);
      setPresentation(existing.presentation);
      setFeasibility(existing.feasibility);
      setImpact(existing.impact);
      setRemarks(existing.remarks || "");
    } else {
      setInnovation(15);
      setTechExcellence(15);
      setPresentation(15);
      setFeasibility(15);
      setImpact(15);
      setRemarks("");
    }
    setEvalError("");
    setEvalTeam(team);
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalTeam) return;
    setEvalError("");
    setSubmittingEval(true);

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: evalTeam._id,
          innovation: Number(innovation),
          technicalExcellence: Number(techExcellence),
          presentation: Number(presentation),
          feasibility: Number(feasibility),
          impact: Number(impact),
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit marks");

      // Burst Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#2563EB", "#F97316", "#3B82F6", "#FB923C"],
        });
      } catch {}

      setEvalTeam(null);
      fetchJuryData();
    } catch (err: any) {
      setEvalError(err.message);
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTeamId) return;
    setReqMsg("");
    setSubmittingReq(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: reqTeamId,
          reason: reqReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");

      setReqMsg("Request submitted successfully to Admin!");
      setTimeout(() => {
        setIsReqModalOpen(false);
        setReqTeamId("");
        setReqReason("");
        setReqMsg("");
      }, 1000);
    } catch (err: any) {
      setReqMsg(`Error: ${err.message}`);
    } finally {
      setSubmittingReq(false);
    }
  };

  const evalMap = new Map();
  evaluations.forEach((e) => {
    const tid = (e.teamId as any)?._id || e.teamId;
    evalMap.set(tid?.toString(), e);
  });

  const evaluatedCount = Array.from(evalMap.keys()).length;
  const totalTeams = teams.length;
  const progressPercent = totalTeams > 0 ? Math.round((evaluatedCount / totalTeams) * 100) : 0;
  const currentTotalScore = innovation + techExcellence + presentation + feasibility + impact;

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading assigned jury room panel...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
        <Layers className="w-10 h-10 text-orange-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-200">No Room Assigned</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          You are currently not assigned to any evaluation room. Please contact the administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Header & Evaluation Progress */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded badge-orange font-bold uppercase">
                Assigned Room
              </span>
              <span className="text-xs text-slate-400">#{room.roomNumber}</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">{room.name}</h2>
            <p className="text-xs text-slate-400">
              Evaluate teams on 5 core parameters (Max 20 each). Live room leaderboard updates automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReqModalOpen(true)}
              data-magnetic="true"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-xs font-bold text-white shadow-glow-orange transition"
            >
              <Star className="w-4 h-4 fill-white" /> Request Extra Team
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Evaluation Progress: {evaluatedCount} / {totalTeams} Teams ({progressPercent}%)
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              {room.isLocked ? (
                <span className="text-orange-400 flex items-center gap-1 font-bold">
                  <Lock className="w-3.5 h-3.5" /> Room Locked By Admin
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <Unlock className="w-3.5 h-3.5" /> Evaluation Open
                </span>
              )}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-orange-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Teams to Evaluate + Live Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Teams List in {room.name}</span>
            <span className="text-xs font-normal text-slate-400">
              {teams.length} Teams Registered
            </span>
          </h3>

          {teams.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center space-y-2 border border-slate-800">
              <h4 className="text-sm font-bold text-slate-300">No teams registered yet</h4>
              <p className="text-xs text-slate-500">
                Student Coordinator will add teams to this room shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((team) => {
                const ev = evalMap.get(team._id.toString());
                const isEvaluated = Boolean(ev);
                const isLocked = ev?.isLocked || room.isLocked;

                return (
                  <motion.div
                    key={team._id}
                    whileHover={{ y: -2 }}
                    className={`glass-card rounded-2xl p-5 border space-y-4 flex flex-col justify-between transition-all ${
                      isEvaluated
                        ? "bg-slate-900/60 border-slate-800"
                        : "bg-blue-950/20 border-blue-800/40 hover:border-blue-500/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-100 text-base">
                          {team.name}
                        </span>

                        {isEvaluated ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold badge-green">
                            <CheckCircle2 className="w-3 h-3" /> Evaluated
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold badge-orange animate-pulse">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1">{team.college}</p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        <span className="text-slate-300 font-medium">Problem: </span>
                        {team.problemStatement}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Total Score:</span>
                        <span className="font-extrabold text-sm text-slate-100">
                          {isEvaluated ? `${ev.totalScore} / 100` : "Not Scored"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setProfileTeam(team)}
                          className="px-3 py-2 rounded-xl glass-card hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex-1 transition"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => openEvaluationModal(team)}
                          disabled={isLocked && isEvaluated}
                          data-magnetic="true"
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                            isLocked && isEvaluated
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                              : isEvaluated
                              ? "bg-amber-600 hover:bg-amber-500 text-white"
                              : "bg-blue-600 hover:bg-blue-500 text-white shadow-glow"
                          }`}
                        >
                          {isLocked && isEvaluated ? (
                            <>
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </>
                          ) : isEvaluated ? (
                            "Edit Marks"
                          ) : (
                            "Evaluate Team"
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Room Leaderboard */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-400" />
            Live Room Leaderboard
          </h3>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No leaderboard items calculated.
              </div>
            ) : (
              leaderboard.map((item: any) => (
                <div
                  key={item.team._id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                    item.isTop2
                      ? "bg-blue-950/40 border-blue-500/40"
                      : item.isApprovedExtra
                      ? "bg-orange-950/40 border-orange-500/40"
                      : "bg-slate-900/50 border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-sm">
                      {item.rank === 1
                        ? "🥇"
                        : item.rank === 2
                        ? "🥈"
                        : item.rank === 3
                        ? "🥉"
                        : `${item.rank}`}
                    </span>
                    <div>
                      <div className="font-bold text-slate-100 flex items-center gap-1">
                        {item.team.name}
                        {item.isTop2 && (
                          <span className="text-[9px] px-1 rounded badge-blue font-bold">
                            TOP 2
                          </span>
                        )}
                        {item.isApprovedExtra && (
                          <span className="text-[9px] px-1 rounded badge-orange font-bold">
                            ⭐ Approved Extra
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.team.college}
                      </span>
                    </div>
                  </div>

                  <span className="font-black text-slate-100 text-xs">
                    {item.evaluation ? `${item.totalScore}/100` : "-"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Modal Drawer */}
      {evalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  Evaluate: {evalTeam.name}
                </h3>
                <p className="text-xs text-slate-400">{evalTeam.college}</p>
              </div>
              <button
                onClick={() => setEvalTeam(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {evalError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                {evalError}
              </div>
            )}

            <form onSubmit={handleScoreSubmit} className="space-y-4">
              {/* 5 Scoring Sliders */}
              {[
                { name: "Innovation", val: innovation, set: setInnovation },
                { name: "Technical Excellence", val: techExcellence, set: setTechExcellence },
                { name: "Presentation", val: presentation, set: setPresentation },
                { name: "Feasibility", val: feasibility, set: setFeasibility },
                { name: "Impact", val: impact, set: setImpact },
              ].map((param) => (
                <div key={param.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{param.name}</span>
                    <span className="font-bold text-blue-400">{param.val} / 20</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={param.val}
                    onChange={(e) => param.set(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              ))}

              {/* Total Score Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-700/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-semibold block">Total Computed Score</span>
                  <span className="text-[10px] text-slate-400">Sum of 5 criteria</span>
                </div>
                <div className="text-3xl font-black text-white bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                  {currentTotalScore} / 100
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jury Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Constructive feedback for team..."
                  rows={2}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEvalTeam(null)}
                  className="px-4 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 text-xs font-bold text-white shadow-glow flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingEval ? "Submitting..." : "Submit Marks & Lock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Additional Selection Modal */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                Request Extra Team Selection
              </h3>
              <button
                onClick={() => setIsReqModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reqMsg && (
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/50 text-blue-300 text-xs">
                {reqMsg}
              </div>
            )}

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Team (Required)
                </label>
                <select
                  value={reqTeamId}
                  onChange={(e) => setReqTeamId(e.target.value)}
                  required
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                >
                  <option value="">-- Select Team --</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.college})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Request (Required)
                </label>
                <textarea
                  required
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Explain why this team deserves special qualification..."
                  rows={3}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-glow-orange"
                >
                  {submittingReq ? "Submitting..." : "Submit to Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Profile Drawer */}
      {profileTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Team Profile: {profileTeam.name}
              </h3>
              <button
                onClick={() => setProfileTeam(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">College:</span>
                <p className="text-slate-200 font-semibold">{profileTeam.college}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Leader Name:</span>
                <p className="text-slate-200 font-semibold">{profileTeam.leaderName}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Problem Statement:</span>
                <p className="text-slate-300 leading-relaxed">{profileTeam.problemStatement}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Members:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {profileTeam.members.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {profileTeam.submissionLink && (
                <div>
                  <span className="text-slate-400 font-medium">Submission Link:</span>
                  <a
                    href={profileTeam.submissionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {profileTeam.submissionLink} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setProfileTeam(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
