"use client";

import React, { useEffect, useState } from "react";
import { Users, UserPlus, KeyRound, Shield, Award, UserCheck, X } from "lucide-react";
import { IUser, IRoom } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "JURY" | "COORDINATOR">("JURY");
  const [roomId, setRoomId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset Password modal state
  const [resetModalUser, setResetModalUser] = useState<IUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, rRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/rooms"),
      ]);
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsers(uData.users || []);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setRooms(rData.rooms || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          roomId: roomId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setIsModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRoomId("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser) return;
    setResetMsg("");

    try {
      const res = await fetch(`/api/users/${resetModalUser._id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset password failed");

      setResetMsg("Password reset successfully!");
      setTimeout(() => {
        setResetModalUser(null);
        setNewPassword("");
        setResetMsg("");
      }, 1000);
    } catch (err: any) {
      setResetMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Users & Roles Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create users, assign role access (Admin, Jury, Student Coordinator), and link room assignments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          data-magnetic="true"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 text-xs font-bold text-white shadow-glow transition"
        >
          <UserPlus className="w-4 h-4" /> Create New User
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading platform users...
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No users found</h3>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Room Assignment</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-semibold text-slate-100">
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {user.email}
                    </td>
                    <td className="p-4">
                      {user.role === "ADMIN" && (
                        <span className="badge-blue px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                      {user.role === "JURY" && (
                        <span className="badge-orange px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1">
                          <Award className="w-3 h-3" /> Jury
                        </span>
                      )}
                      {user.role === "COORDINATOR" && (
                        <span className="badge-green px-2.5 py-1 rounded-lg font-bold inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Coordinator
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      {user.roomId && typeof user.roomId === "object" ? (
                        <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-medium">
                          {(user.roomId as any).name || (user.roomId as any).roomNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None / All</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setResetModalUser(user)}
                        className="px-3 py-1.5 rounded-lg glass-card hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] inline-flex items-center gap-1 transition"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Create New User</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Aris Thorne"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jury@nirmaan.org"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                >
                  <option value="JURY">Jury Panel</option>
                  <option value="COORDINATOR">Student Coordinator</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              {role !== "ADMIN" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assign Room
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                  >
                    <option value="">-- Select Room --</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} (Room #{r.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-glow"
                >
                  {submitting ? "Creating..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                Reset Password: {resetModalUser.name}
              </h3>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetMsg && (
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/50 text-blue-300 text-xs">
                {resetMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-glow"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
