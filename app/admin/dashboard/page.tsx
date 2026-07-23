"use client";

import React, { useEffect, useState } from "react";
import {
  Layers,
  Users,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Trophy,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalTeams: 0,
    totalEvaluated: 0,
    pendingEvaluations: 0,
    pendingRequests: 0,
    qualifiedTeamsCount: 0,
  });
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, leaderRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/leaderboard"),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        if (aData.stats) setStats(aData.stats);
      }

      if (leaderRes.ok) {
        const lData = await leaderRes.json();
        if (lData.leaderboards) setLeaderboards(lData.leaderboards);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      const handleRealtimeUpdate = () => {
        fetchDashboardData();
      };

      socket.on("team:added", handleRealtimeUpdate);
      socket.on("team:updated", handleRealtimeUpdate);
      socket.on("team:deleted", handleRealtimeUpdate);
      socket.on("evaluation:submitted", handleRealtimeUpdate);
      socket.on("request:created", handleRealtimeUpdate);
      socket.on("request:updated", handleRealtimeUpdate);
      socket.on("room:created", handleRealtimeUpdate);
      socket.on("room:lock_changed", handleRealtimeUpdate);

      return () => {
        socket.off("team:added", handleRealtimeUpdate);
        socket.off("team:updated", handleRealtimeUpdate);
        socket.off("team:deleted", handleRealtimeUpdate);
        socket.off("evaluation:submitted", handleRealtimeUpdate);
        socket.off("request:created", handleRealtimeUpdate);
        socket.off("request:updated", handleRealtimeUpdate);
        socket.off("room:created", handleRealtimeUpdate);
        socket.off("room:lock_changed", handleRealtimeUpdate);
      };
    }
  }, [socket]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Admin Overview & Live Leaderboard
            <Sparkles className="w-4 h-4 text-orange-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring across all rooms, teams, evaluations, and selection requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            data-magnetic="true"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/admin/rooms"
            data-magnetic="true"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 text-xs font-bold text-white shadow-glow transition"
          >
            + Create Room
          </Link>
        </div>
      </div>

      {/* 6 Core Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Rooms Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Rooms</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.totalRooms}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Assigned evaluation rooms</div>
          </div>
        </motion.div>

        {/* Teams Card */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Teams</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.totalTeams}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Registered participating teams</div>
          </div>
        </motion.div>

        {/* Evaluated Teams */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Evaluated</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.totalEvaluated}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">Completed evaluations</div>
          </div>
        </motion.div>

        {/* Pending Evaluations */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Eval</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.pendingEvaluations}</div>
            <div className="text-[10px] text-amber-400 mt-0.5 font-medium">Awaiting jury scoring</div>
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Req</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <GitPullRequest className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.pendingRequests}</div>
            <div className="text-[10px] text-orange-400 mt-0.5 font-medium">Extra selection requests</div>
          </div>
        </motion.div>

        {/* Qualified Teams */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Qualified</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-white">{stats.qualifiedTeamsCount}</div>
            <div className="text-[10px] text-purple-400 mt-0.5 font-medium">Top 2 + Approved extra</div>
          </div>
        </motion.div>
      </div>

      {/* Real-time Leaderboards Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center justify-between">
          <span>Room Live Leaderboards</span>
          <span className="text-xs font-normal text-slate-400">
            Real-time update stream
          </span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading live leaderboards...
          </div>
        ) : leaderboards.length === 0 ? (
          /* Zero Data State */
          <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-200">No rooms created yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Get started by creating rooms and assigning Jury panels and Student Coordinators.
            </p>
            <Link
              href="/admin/rooms"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-glow"
            >
              Go to Rooms Management
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {leaderboards.map((lb) => (
              <div
                key={lb.room._id}
                className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Room Header & Progress bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">
                          {lb.room.name}
                        </h4>
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          #{lb.room.roomNumber}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {lb.evaluatedCount}/{lb.totalTeams} Teams Evaluated
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {lb.room.isLocked ? (
                        <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full badge-orange font-semibold">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full badge-green font-semibold">
                          <Unlock className="w-3 h-3" /> Open
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-orange-500 h-full transition-all duration-500"
                      style={{ width: `${lb.completionPercentage}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-slate-400 mt-1 font-medium">
                    {lb.completionPercentage}% Complete
                  </div>

                  {/* Team Rank Table */}
                  <div className="mt-4 space-y-2">
                    {lb.leaderboard.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No teams registered in this room yet.
                      </div>
                    ) : (
                      lb.leaderboard.map((item: any) => (
                        <div
                          key={item.team._id}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            item.isTop2
                              ? "bg-blue-950/40 border-blue-500/50 shadow-glow"
                              : item.isApprovedExtra
                              ? "bg-orange-950/40 border-orange-500/50 shadow-glow-orange"
                              : "bg-slate-900/50 border-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm w-6 text-center">
                              {item.rank === 1
                                ? "🥇"
                                : item.rank === 2
                                ? "🥈"
                                : item.rank === 3
                                ? "🥉"
                                : `${item.rank}`}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100">
                                  {item.team.name}
                                </span>
                                {item.isTop2 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded badge-blue font-bold">
                                    TOP 2
                                  </span>
                                )}
                                {item.isApprovedExtra && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded badge-orange font-bold flex items-center gap-0.5">
                                    ⭐ Approved Extra
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block">
                                {item.team.college}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-sm text-slate-100">
                              {item.evaluation ? `${item.totalScore}/100` : "Pending"}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              {item.evaluation ? "Score Submitted" : "Awaiting Jury"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
