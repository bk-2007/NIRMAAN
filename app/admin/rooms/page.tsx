"use client";

import React, { useEffect, useState } from "react";
import { Layers, Plus, Lock, Unlock, Users, Award, ShieldAlert, CheckCircle, X } from "lucide-react";
import { IRoom } from "@/types";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (res.ok) setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roomNumber, capacity: Number(capacity), description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      setIsModalOpen(false);
      setName("");
      setRoomNumber("");
      setDescription("");
      fetchRooms();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLock = async (roomId: string, currentLock: boolean) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !currentLock }),
      });

      if (res.ok) {
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Rooms Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure evaluation rooms, assign panels, and lock/unlock room scoring.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          data-magnetic="true"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 text-xs font-bold text-white shadow-glow transition"
        >
          <Plus className="w-4 h-4" /> Create New Room
        </button>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading rooms...
        </div>
      ) : rooms.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-2xl text-center space-y-3 border border-slate-800">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No rooms created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Create New Room" to set up your first evaluation room.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">
                      {room.name}
                    </h3>
                    <span className="text-xs text-slate-400">
                      Room #{room.roomNumber}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleLock(room._id, room.isLocked)}
                    data-magnetic="true"
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                      room.isLocked
                        ? "badge-orange border border-orange-500/40 hover:bg-orange-950/60"
                        : "badge-green border border-green-500/40 hover:bg-emerald-950/60"
                    }`}
                  >
                    {room.isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Unlocked
                      </>
                    )}
                  </button>
                </div>

                {room.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {room.description}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Award className="w-3.5 h-3.5 text-orange-400" /> Assigned Jury:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {room.jury ? room.jury.name : "Unassigned"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-blue-400" /> Student Coordinator:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {room.coordinator ? room.coordinator.name : "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Teams: {room.teamsCount}</span>
                <span>Evaluated: {room.evaluationsCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Create New Room</h3>
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

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Innovation Lab"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Room Number / Identifier
                </label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 101"
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Capacity (Max Teams)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding room location, hardware setup, etc."
                  rows={2}
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-glow"
                >
                  {submitting ? "Creating..." : "Save Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
