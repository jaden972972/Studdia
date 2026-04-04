"use client";
import { motion } from "framer-motion";

/**
 * PremiumPlant — decorative breathing SVG plant shown only to Pro users.
 * Uses Framer Motion for a subtle looping scale + opacity "breathing" effect.
 */
export default function PremiumPlant({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`select-none pointer-events-none ${className}`}
      animate={{
        scale: [1, 1.06, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
        {/* Stem */}
        <path
          d="M32 56V28"
          stroke="#6d28d9"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Left leaf */}
        <motion.path
          d="M32 36 C24 30 16 32 18 22 C22 26 28 30 32 36Z"
          fill="rgba(139,92,246,0.45)"
          stroke="#8b5cf6"
          strokeWidth="1"
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "32px 36px" }}
        />
        {/* Right leaf */}
        <motion.path
          d="M32 28 C40 22 48 24 46 14 C42 18 36 22 32 28Z"
          fill="rgba(167,139,250,0.4)"
          stroke="#a78bfa"
          strokeWidth="1"
          animate={{ rotate: [2, -2, 2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ transformOrigin: "32px 28px" }}
        />
        {/* Top bud */}
        <motion.circle
          cx="32"
          cy="18"
          r="5"
          fill="rgba(196,181,253,0.3)"
          stroke="#c4b5fd"
          strokeWidth="1.2"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ transformOrigin: "32px 18px" }}
        />
        {/* Pot */}
        <path
          d="M24 56h16l-3-8H27l-3 8Z"
          fill="rgba(109,40,217,0.3)"
          stroke="#7c3aed"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M23 49h18"
          stroke="#7c3aed"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
