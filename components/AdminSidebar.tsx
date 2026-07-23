"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  GitPullRequest,
  BarChart3,
  ChevronRight,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Rooms Management",
      href: "/admin/rooms",
      icon: Layers,
    },
    {
      name: "Users & Roles",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Selection Requests",
      href: "/admin/requests",
      icon: GitPullRequest,
    },
    {
      name: "Analytics & Exports",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-full md:w-64 glass-panel border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Admin Control Center
          </span>
        </div>

        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800/80 px-2 text-[11px] text-slate-500 text-center">
        Realtime Sync Active • Socket.io
      </div>
    </aside>
  );
}
