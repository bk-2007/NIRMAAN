"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { LogOut, Search, Shield, UserCheck, Award, Layers } from "lucide-react";
import NotificationBell from "./NotificationBell";
import GlobalSearchModal from "./GlobalSearchModal";
import { useAuthStore } from "@/store/useAuthStore";
import { IUser } from "@/types";

interface NavbarProps {
  user: IUser;
}

export default function Navbar({ user }: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { logout } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold badge-blue">
            <Shield className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case "JURY":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold badge-orange">
            <Award className="w-3.5 h-3.5" /> Jury Panel
          </span>
        );
      case "COORDINATOR":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold badge-green">
            <UserCheck className="w-3.5 h-3.5" /> Student Coordinator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/70 border-b border-slate-800/80 px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 shadow-glow">
            <Image
              src="/logo.svg"
              alt="Nirmaan Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-400 via-slate-100 to-orange-400 bg-clip-text text-transparent">
              NIRMAAN
            </h1>
          </div>
        </div>

        {/* Global Search Bar */}
        <button
          onClick={() => setIsSearchOpen(true)}
          data-magnetic="true"
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl glass-card hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-xs border border-slate-700/60 w-64 lg:w-80 transition"
        >
          <Search className="w-4 h-4 text-blue-400" />
          <span>Search rooms, teams, colleges...</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          {getRoleBadge(user.role)}

          {/* Assigned Room pill if present */}
          {user.roomId && typeof user.roomId === "object" && (
            <span className="hidden xl:flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Room: {(user.roomId as any).name || (user.roomId as any).roomNumber}
            </span>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-slate-100">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400">{user.email}</div>
            </div>
            <button
              onClick={() => logout()}
              data-magnetic="true"
              className="p-2.5 rounded-xl glass-card hover:bg-red-950/40 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
