'use client';

import { motion } from 'framer-motion';

// ✉️ + ❤️ = 💌, "envelope" + "love" = "lovelope.app": everything collides,
// contracts into a single point, then bursts into the merged result. Plays
// once, on mount, then holds its final state (no loop).
const times = [0, 0.28, 0.5, 0.58, 0.66, 0.78, 0.88, 1];
const transition = { duration: 2.4, times, ease: 'easeInOut' as const };

export default function LoveFusion({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="grid place-items-center h-44">
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="text-8xl"
          initial={{ x: -72, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: [-72, -72, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 1, 0, 0, 0, 0], scale: [1, 1, 1, 0.5, 0, 0, 0, 0], rotate: [0, -8, 0, 0, 0, 0, 0, 0] }}
          transition={transition}
        >
          ✉️
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="text-8xl"
          initial={{ x: 72, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: [72, 72, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 1, 0, 0, 0, 0], scale: [1, 1, 1, 0.5, 0, 0, 0, 0], rotate: [0, 8, 0, 0, 0, 0, 0, 0] }}
          transition={transition}
        >
          ❤️
        </motion.span>
        <motion.div
          style={{ gridRow: 1, gridColumn: 1 }}
          className="w-5 h-5 rounded-full bg-white shadow-[0_0_28px_12px_rgba(255,255,255,0.85)]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0, 0, 0.9, 1, 0, 0, 0], scale: [0, 0, 0, 0.15, 0.22, 1.8, 0, 0] }}
          transition={transition}
        />
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="text-9xl"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0, 0, 0, 0, 0.15, 1, 1], scale: [0.3, 0.3, 0.3, 0.3, 0.3, 0.5, 1.18, 1] }}
          transition={transition}
        >
          💌
        </motion.span>
      </div>

      <div className="grid place-items-center h-14 mt-1">
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight whitespace-nowrap"
          initial={{ x: -60, opacity: 1, scale: 1 }}
          animate={{ x: [-60, -60, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 1, 0, 0, 0, 0], scale: [1, 1, 1, 0.5, 0, 0, 0, 0] }}
          transition={transition}
        >
          envelope
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="font-display font-extrabold text-2xl sm:text-4xl text-yellow-300 tracking-tight whitespace-nowrap"
          initial={{ x: 60, opacity: 1, scale: 1 }}
          animate={{ x: [60, 60, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 1, 0, 0, 0, 0], scale: [1, 1, 1, 0.5, 0, 0, 0, 0] }}
          transition={transition}
        >
          love
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight whitespace-nowrap"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0, 0, 0, 0, 0.2, 1, 1], scale: [0.6, 0.6, 0.6, 0.6, 0.6, 0.8, 1.15, 1] }}
          transition={transition}
        >
          <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">lovelope</span>
          <span className="text-white/70">.app</span>
        </motion.span>
      </div>
    </div>
  );
}
