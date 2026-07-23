"use client";

import React, { useEffect, useState } from "react";
import { UserCheck, Plus, Edit2, Trash2, CheckCircle2, XCircle, Phone, Mail, Globe, Layers, X } from "lucide-react";
import { ITeam, IRoom } from "@/types";
import { useSocket } from "@/hooks/useSocket";

export default function CoordinatorDashboardPage() {
  const [room, setRoom] = useState<IRoom | null>(null);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [membersStr, setMembersStr] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { socket } = useSocket(room?._id);

  const fetchCoordData = async () => {
    try {
      setLoading(true);
      const [roomRes, teamRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/teams"),
      ]);

      if (roomRes.ok) {
        const rData = await roomRes.json();
        if (rData.rooms && rData.rooms.length > 0) setRoom(rData.rooms[0]);
      }
      if (teamRes.ok) {
        const tData = await teamRes.json();
        setTeams(tData.teams || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordData();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleSync = () => fetchCoordData();
      socket.on("team:added", handleSync);
      socket.on("team:updated", handleSync);
      socket.on("team:deleted", handleSync);

      return () => {
        socket.off("team:added", handleSync);
        socket.off("team:updated", handleSync);
        socket.off("team:deleted", handleSync);
      };
    }
  }, [socket]);

  const openAddModal = () => {
    setEditingTeam(null);
    setName("");
    setCollege("");
    setLeaderName("");
    setMembersStr("");
    setProblemStatement("");
    setPhone("");
    setEmail("");
    setSubmissionLink("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (team: ITeam) => {
    setEditingTeam(team);
    setName(team.name);
    setCollege(team.college);
    setLeaderName(team.leaderName);
    setMembersStr(team.members.join(", "));
    setProblemStatement(team.problemStatement);
    setPhone(team.phone);
    setEmail(team.email);
    setSubmissionLink(team.submissionLink || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    setError("");
    setSubmitting(true);

    const members = membersStr
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const payload = {
      name,
      college,
      leaderName,
      members,
      problemStatement,
      phone,
      email,
      submissionLink,
      roomId: room._id,
    };

    try {
      let res;
      if (editingTeam) {
        res = await fetch(`/api/teams/${editingTeam._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save team");

      setIsModalOpen(false);
      fetchCoordData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
      if (res.ok) fetchCoordData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAttendance = async (teamId: string, currentPresent: boolean) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPresent: !currentPresent }),
      });
      if (res.ok) fetchCoordData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading Student Coordinator Room...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
        <Layers className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-200">No Room Assigned</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          You are currently not assigned to any room. Please contact Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded badge-green font-bold uppercase">
              Coordinator Hub
            </span>
            <span className="text-xs text-slate-400">Room #{room.roomNumber}</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">{room.name}</h2>
          <p className="text-xs text-slate-400">
            Register teams, upload details, and manage live room attendance.
          </p>
        </div>

        <button
          onClick={openAddModal}
          data-magnetic="true"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-glow transition"
        >
          <Plus className="w-4 h-4" /> Add New Team
        </button>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
          <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No teams registered in this room</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add New Team" to register a team for evaluation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-400">{team.college}</p>
                  </div>

                  <button
                    onClick={() => toggleAttendance(team._id, team.isPresent)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                      team.isPresent
                        ? "badge-green hover:bg-emerald-950/80"
                        : "bg-red-950/60 text-red-400 border border-red-500/40 hover:bg-red-900/60"
                    }`}
                  >
                    {team.isPresent ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Present
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Absent
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <span className="font-semibold text-slate-300">Problem Statement:</span>
                  <p className="text-slate-400 leading-relaxed line-clamp-2">
                    {team.problemStatement}
                  </p>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Leader:</span>
                    <span className="font-semibold text-slate-200">{team.leaderName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Phone className="w-3 h-3 text-slate-500" /> {team.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Mail className="w-3 h-3 text-slate-500" /> {team.email}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(team)}
                  className="px-3 py-1.5 rounded-lg glass-card hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-400" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(team._id)}
                  className="px-3 py-1.5 rounded-lg hover:bg-red-950/60 text-slate-400 hover:text-red-400 text-xs font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 shadow-2xl border border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingTeam ? `Edit Team: ${editingTeam.name}` : "Add New Team"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Team CyberPulse"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="IIT Bombay"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Team Leader Name
                  </label>
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Members (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={membersStr}
                    onChange={(e) => setMembersStr(e.target.value)}
                    placeholder="Rohan, Sarah, Dev"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Problem Statement / Project Title
                </label>
                <textarea
                  required
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="AI-Driven Autonomous Emergency Response Engine..."
                  rows={2}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="team@cyberpulse.org"
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission / GitHub Link (Optional)
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://github.com/nirmaan/project"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-glow"
                >
                  {submitting ? "Saving..." : editingTeam ? "Update Team" : "Register Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
