"use client";

import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertCircle, Info, Sparkles, X } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { INotification } from "@/types";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, setNotifications, markAsRead } =
    useNotificationStore();

  useEffect(() => {
    // Fetch notifications
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error(err));
  }, [setNotifications]);

  const handleMarkRead = async (id: string) => {
    markAsRead(id);
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-magnetic="true"
        className="relative p-2.5 rounded-xl glass-card hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-blue-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-2xl p-4 shadow-2xl z-50 border border-slate-700/60 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-white text-sm">Notifications</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No recent notifications
              </div>
            ) : (
              notifications.map((n: INotification) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n._id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    n.readBy && n.readBy.length > 0
                      ? "bg-slate-900/40 border-slate-800/50 opacity-60"
                      : "bg-blue-950/30 border-blue-800/40 hover:border-blue-500/50"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.type.includes("APPROVED") || n.type.includes("SUBMITTED") ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    ) : n.type.includes("REQUEST") ? (
                      <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{n.title}</p>
                      <p className="text-slate-400 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
