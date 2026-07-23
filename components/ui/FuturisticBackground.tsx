"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FuturisticBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 pointer-events-none z-0 bg-[#0F172A]" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0F172A]">
      {/* Subtle Animated Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Floating Blurred Deep Blue Glowing Orb */}
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -100, 60, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/25 blur-[120px]"
      />

      {/* Floating Blurred Vibrant Orange Glowing Orb */}
      <motion.div
        animate={{
          x: [0, -90, 70, 0],
          y: [0, 110, -50, 0],
          scale: [1, 1.25, 0.85, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-orange-500/20 blur-[140px]"
      />

      {/* Floating Secondary Blue Glow */}
      <motion.div
        animate={{
          x: [0, 60, -80, 0],
          y: [0, 80, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-40 left-1/4 w-[28rem] h-[28rem] rounded-full bg-indigo-600/20 blur-[130px]"
      />

      {/* Subtle Particle Ambient Dots */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
        <div className="absolute top-2/3 left-3/4 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse" />
      </div>
    </div>
  );
}
