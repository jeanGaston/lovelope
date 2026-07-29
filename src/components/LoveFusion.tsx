'use client';

import { motion } from 'framer-motion';
import { Hachi_Maru_Pop } from 'next/font/google';

const logoFont = Hachi_Maru_Pop({ weight: '400', subsets: ['latin'] });

// 💕 + ✉️ = 💌, "love" + "envelope" = "lovelope.app": the two slide in from
// opposite sides, and the instant they'd overlap they hand off to a white
// flash (bigger + brighter than the glyphs so neither is ever visibly "in
// front of" the other) which then blooms back out into the merged result.
// Plays once, on mount, then holds its final state (no loop).
const times = [0, 0.22, 0.42, 0.52, 0.62, 0.74, 0.88, 1];
const transition = { duration: 2.4, times, ease: 'easeInOut' as const };

export default function LoveFusion({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="grid place-items-center h-44">
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="text-8xl"
          initial={{ x: -72, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: [-72, -50, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.95, 0.55, 0, 0, 0, 0], rotate: [0, -10, 0, 0, 0, 0, 0, 0] }}
          transition={transition}
        >
          💕
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="text-8xl"
          initial={{ x: 72, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: [72, 50, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.95, 0.55, 0, 0, 0, 0], rotate: [0, 10, 0, 0, 0, 0, 0, 0] }}
          transition={transition}
        >
          ✉️
        </motion.span>
        <motion.div
          style={{ gridRow: 1, gridColumn: 1 }}
          className="w-8 h-8 rounded-full bg-white shadow-[0_0_48px_22px_rgba(255,255,255,0.95)]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0, 0.15, 0.75, 1, 0.55, 0, 0], scale: [0, 0, 0.5, 1.5, 2.4, 1.3, 0, 0] }}
          transition={transition}
        />
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className="text-9xl"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0, 0, 0, 0.25, 0.75, 1, 1], scale: [0.3, 0.3, 0.3, 0.3, 0.4, 0.85, 1.12, 1] }}
          transition={transition}
        >
          💌
        </motion.span>
      </div>

      <div className="grid place-items-center h-14 mt-1">
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className={`${logoFont.className} text-2xl sm:text-4xl text-yellow-300 tracking-tight whitespace-nowrap`}
          initial={{ x: -60, opacity: 1, scale: 1 }}
          animate={{ x: [-60, -40, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.95, 0.55, 0, 0, 0, 0] }}
          transition={transition}
        >
          love
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className={`${logoFont.className} text-2xl sm:text-4xl text-white tracking-tight whitespace-nowrap`}
          initial={{ x: 60, opacity: 1, scale: 1 }}
          animate={{ x: [60, 40, 0, 0, 0, 0, 0, 0], opacity: [1, 1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.95, 0.55, 0, 0, 0, 0] }}
          transition={transition}
        >
          envelope
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1 }}
          className={`${logoFont.className} text-2xl sm:text-4xl tracking-tight whitespace-nowrap`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0, 0, 0, 0.25, 0.75, 1, 1], scale: [0.6, 0.6, 0.6, 0.6, 0.65, 0.9, 1.15, 1] }}
          transition={transition}
        >
          <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">lovelope</span>
          <span className="text-white/70">.app</span>
        </motion.span>
      </div>
    </div>
  );
}
