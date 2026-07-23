"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, User, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import FuturisticBackground from "@/components/ui/FuturisticBackground";
import CursorFollower from "@/components/ui/CursorFollower";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [isSuperAdminSetup, setIsSuperAdminSetup] = useState(false);
  const [loadingSetupCheck, setLoadingSetupCheck] = useState(true);

  // Pre-filled Admin Credentials
  const [email, setEmail] = useState("balakrishnagorle2007@gmail.com");
  const [password, setPassword] = useState("12345");
  const [name, setName] = useState("Balakrishna Gorle");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then(async (res) => {
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data.user) {
              if (data.user.role === "ADMIN") router.push("/admin/dashboard");
              else if (data.user.role === "JURY") router.push("/jury/dashboard");
              else if (data.user.role === "COORDINATOR") router.push("/coord/dashboard");
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSetupCheck(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please verify database connection.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setSuccess("Authentication successful! Redirecting...");
      setTimeout(() => {
        if (data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (data.user.role === "JURY") {
          router.push("/jury/dashboard");
        } else if (data.user.role === "COORDINATOR") {
          router.push("/coord/dashboard");
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/setup-superadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Super Admin creation failed");
      }

      setSuccess("Super Admin created! Logging in...");
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        router.push("/admin/dashboard");
      } else {
        setIsSuperAdminSetup(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize Admin account");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0F172A]">
      <FuturisticBackground />
      <CursorFollower />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-20 w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl border border-slate-700/80 backdrop-blur-2xl"
      >
        {/* Official NIRMAAN Logo & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900/90 border border-slate-700 p-2 shadow-glow mb-3">
            <Image
              src="/logo.svg"
              alt="Nirmaan Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-slate-100 to-orange-400 bg-clip-text text-transparent">
            NIRMAAN
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Enterprise Hackathon Evaluation Platform
          </p>
        </div>

        {/* Message Banner */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loadingSetupCheck ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
            <span>Initializing Security Gateway...</span>
          </div>
        ) : isSuperAdminSetup ? (
          <form onSubmit={handleSetupSuperAdmin} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs mb-4">
              <span className="font-semibold block mb-0.5">Database Setup Mode</span>
              No users detected in database. Create initial Super Admin account to begin.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="System Administrator"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nirmaan.org"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={5}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-magnetic="true"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? "Creating Admin..." : "Initialize Platform"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@nirmaan.org"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              data-magnetic="true"
              className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Sign In to Platform"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Role-Based Multi-Tenant Authentication • Secured via JWT & Mongoose
        </div>
      </motion.div>
    </div>
  );
}
