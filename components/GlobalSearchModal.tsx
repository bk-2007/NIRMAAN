"use client";

import React, { useEffect, useState } from "react";
import { Search, X, Layers, Users, BookOpen, Building } from "lucide-react";
import { ITeam, IRoom } from "@/types";
import { useRouter } from "next/navigation";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ teams: ITeam[]; rooms: IRoom[] }>({
    teams: [],
    rooms: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ teams: [], rooms: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-card rounded-2xl p-4 shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Search className="w-5 h-5 text-blue-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Room, Team, College, or Problem Statement..."
            className="w-full bg-transparent text-slate-100 text-sm focus:outline-none placeholder-slate-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 max-h-96 overflow-y-auto space-y-4">
          {loading && (
            <div className="text-center py-8 text-xs text-slate-400">
              Searching database...
            </div>
          )}

          {!loading &&
            query.trim() !== "" &&
            results.teams.length === 0 &&
            results.rooms.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No matching teams or rooms found.
              </div>
            )}

          {/* Rooms Results */}
          {results.rooms.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Rooms
              </h4>
              <div className="space-y-1.5">
                {results.rooms.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => {
                      router.push(`/admin/rooms?highlight=${room._id}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-semibold text-white">
                        {room.name}
                      </span>
                      <span className="ml-2 text-slate-400 text-[11px]">
                        Room #{room.roomNumber}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">
                      Capacity: {room.capacity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams Results */}
          {results.teams.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-orange-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Teams
              </h4>
              <div className="space-y-2">
                {results.teams.map((team) => (
                  <div
                    key={team._id}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm">
                        {team.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full badge-orange font-medium">
                        Leader: {team.leaderName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" /> {team.college}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-500" /> {team.problemStatement}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press ESC or X to close</span>
          <span>Global Search Engine</span>
        </div>
      </div>
    </div>
  );
}
