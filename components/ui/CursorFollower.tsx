"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function CursorFollower() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isOverInputOrText, setIsOverInputOrText] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const cursorX = useSpring(0, { stiffness: 450, damping: 30 });
  const cursorY = useSpring(0, { stiffness: 450, damping: 30 });

  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(500px circle at ${e.clientX}px ${e.clientY}px, rgba(37, 99, 235, 0.08), rgba(249, 115, 22, 0.04), transparent 80%)`;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.tagName === "OPTION" ||
          target.isContentEditable ||
          target.closest("input") !== null ||
          target.closest("textarea") !== null ||
          target.closest("select") !== null;

        setIsOverInputOrText(isInput);

        const isInteractive =
          !isInput &&
          (target.tagName === "BUTTON" ||
            target.tagName === "A" ||
            target.closest("button") !== null ||
            target.closest("a") !== null ||
            target.getAttribute("data-magnetic") === "true");

        const isCard =
          !isInput &&
          (target.classList.contains("glass-card") ||
            target.closest(".glass-card") !== null);

        setIsHovered(isInteractive);
        setIsCardHovered(isCard);
      }

      if (!isOverInputOrText && Math.random() > 0.8) {
        const newParticle: Particle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 3 + 2,
          color: Math.random() > 0.5 ? "#2563EB" : "#F97316",
        };
        setParticles((prev) => [...prev.slice(-10), newParticle]);
      }
    };

    const onClick = (e: MouseEvent) => {
      if (!isOverInputOrText) {
        const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
        setRipples((prev) => [...prev.slice(-4), newRipple]);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
    };
  }, [mounted, cursorX, cursorY, isOverInputOrText]);

  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) => prev.slice(1));
    }, 300);
    return () => clearTimeout(timer);
  }, [particles]);

  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 450);
    return () => clearTimeout(timer);
  }, [ripples]);

  if (!mounted || isOverInputOrText) {
    return (
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300 opacity-40"
      />
    );
  }

  return (
    <>
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300"
      />

      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-40 rounded-full border border-blue-400/50 transition-colors duration-200"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? 42 : isCardHovered ? 32 : 16,
          height: isHovered ? 42 : isCardHovered ? 32 : 16,
          backgroundColor: isCardHovered
            ? "rgba(249, 115, 22, 0.15)"
            : isHovered
            ? "rgba(37, 99, 235, 0.2)"
            : "rgba(37, 99, 235, 0.4)",
          borderColor: isCardHovered ? "#F97316" : "#3B82F6",
          opacity: 0.85,
        }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
      />

      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed z-30 rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}

      {ripples.map((r) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0.8, scale: 0.2 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pointer-events-none fixed z-30 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-orange"
          style={{
            left: r.x,
            top: r.y,
          }}
        />
      ))}
    </>
  );
}
