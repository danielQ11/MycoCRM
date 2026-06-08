"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroAnimationProps {
  onComplete: () => void;
}

// Generate random spores for the background
type Spore = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [spores, setSpores] = useState<Spore[]>([]);

  useEffect(() => {
    // Session check to prevent repeating animation for returning users
    const hasSeenIntro = sessionStorage.getItem("myco_intro_seen");
    if (hasSeenIntro) {
      onComplete();
      return;
    }

    setShouldRender(true);

    // Generate lightweight spores on client-side
    const generatedSpores = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      y: 70 + Math.random() * 30, // starting near bottom half
      size: 2 + Math.random() * 4, // 2px to 6px
      delay: Math.random() * 1.5,
      duration: 3 + Math.random() * 4,
    }));
    setSpores(generatedSpores);

    // Set seen flag in session storage
    sessionStorage.setItem("myco_intro_seen", "true");

    // Automatically complete after animation sequence (approx 3.8 seconds)
    const timeout = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  if (!shouldRender) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#040905]"
    >
      {/* ─── Animated Ambient Background ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow circles */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.45, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-1/4 -top-1/4 w-[70vw] h-[70vw] rounded-full bg-emerald-950/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -right-1/4 -bottom-1/4 w-[80vw] h-[80vw] rounded-full bg-amber-950/15 blur-[140px]"
        />
        
        {/* Bioluminescent grid/organic background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.02)_0%,transparent_70%)]" />
      </div>

      {/* ─── Floating Spores (Particles) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {spores.map((spore) => (
          <motion.div
            key={spore.id}
            initial={{ x: `${spore.x}%`, y: "100%", opacity: 0 }}
            animate={{
              y: "-10%",
              opacity: [0, 0.8, 0.8, 0],
              x: [`${spore.x}%`, `${spore.x + (Math.random() * 10 - 5)}%`, `${spore.x + (Math.random() * 20 - 10)}%`],
            }}
            transition={{
              duration: spore.duration,
              delay: spore.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: spore.size,
              height: spore.size,
            }}
            className="absolute rounded-full bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          />
        ))}
      </div>

      {/* ─── Main Animated Content ─── */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        {/* Growing Mycelium & Mushroom SVG */}
        <div className="relative mb-6 h-40 w-40 flex items-center justify-center">
          {/* Subtle pulse aura */}
          <motion.div
            animate={{
              scale: [0.85, 1.05, 0.85],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl"
          />

          <svg
            viewBox="0 0 100 100"
            className="w-32 h-32 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          >
            {/* Mycelium roots branching out */}
            <motion.path
              d="M 50 85 C 40 85, 30 90, 20 88 M 50 85 C 45 88, 35 93, 30 96 M 50 85 C 60 85, 70 90, 80 88 M 50 85 C 55 88, 65 93, 70 96"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
            />
            <motion.path
              d="M 35 93 C 32 94, 25 93, 22 95 M 65 93 C 68 94, 75 93, 78 95"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
            />

            {/* Mushroom Stem */}
            <motion.path
              d="M 46 85 C 47 70, 44 55, 42 45 M 54 85 C 53 70, 56 55, 58 45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            />

            {/* Mushroom Ring (Velo) */}
            <motion.path
              d="M 42 58 C 47 60, 53 60, 58 58"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            />

            {/* Main Cap outer dome */}
            <motion.path
              d="M 25 45 C 25 15, 75 15, 75 45 C 65 43, 55 45, 50 43 C 45 45, 35 43, 25 45 Z"
              fill="url(#mushroomGrad)"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0, fillOpacity: 0 }}
              animate={{ pathLength: 1, fillOpacity: 0.15 }}
              transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
            />

            {/* Bioluminescent dots/spores inside the cap */}
            <motion.circle
              cx="50"
              cy="28"
              r="2.5"
              className="fill-amber-300"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.2, type: "spring", stiffness: 100 }}
            />
            <motion.circle
              cx="38"
              cy="34"
              r="2"
              className="fill-amber-300"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.4, type: "spring", stiffness: 100 }}
            />
            <motion.circle
              cx="62"
              cy="34"
              r="2"
              className="fill-amber-300"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.5, type: "spring", stiffness: 100 }}
            />

            {/* Definitions for gradients */}
            <defs>
              <linearGradient id="mushroomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand Name Title */}
        <div className="overflow-hidden mb-2">
          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1,
              delay: 0.5,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-200"
          >
            MycoCRM
          </motion.h2>
        </div>

        {/* Tagline */}
        <div className="overflow-hidden">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 0.7 }}
            transition={{
              duration: 0.8,
              delay: 1.2,
              ease: "easeOut",
            }}
            className="text-[0.75rem] uppercase tracking-[0.25em] font-semibold text-emerald-300"
          >
            Conectando el micelio de tu negocio
          </motion.p>
        </div>

        {/* Progress bar loader */}
        <div className="mt-8 h-1 w-48 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{
              duration: 3,
              delay: 0.5,
              ease: "easeInOut",
            }}
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-400"
          />
        </div>
      </div>

      {/* ─── Skip Button ─── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        whileHover={{ opacity: 0.9 }}
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-20 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white active:scale-95"
      >
        Saltar intro ➔
      </motion.button>
    </motion.div>
  );
}
