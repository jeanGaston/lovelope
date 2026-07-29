'use client';

import { motion } from 'framer-motion';
import { Hachi_Maru_Pop } from 'next/font/google';

const logoFont = Hachi_Maru_Pop({ weight: '400', subsets: ['latin'] });

// 💕 + ✉️ = 💌, "love" + "envelope" = "lovelope.app": the two slide in from
// opposite sides and fade out AS they approach center, so opacity hits zero
// right when they'd otherwise overlap - neither ever renders "in front of"
// the other. The flash on the icon row is a bonus bloom on top of that, not
// the only thing hiding the seam. Plays once, on mount, then holds.
const times = [0, 0.25, 0.45, 0.58, 0.7, 0.85, 1];
const transition = { duration: 1.8, times, ease: 'easeInOut' as const };
const willChange = { willChange: 'transform, opacity' } as const;

export default function LoveFusion({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="grid place-items-center h-44">
        <motion.span
          style={{ gridRow: 1, gridColumn: 1, ...willChange }}
          className="text-8xl"
          initial={{ x: -72, opacity: 1, scale: 1 }}
          animate={{ x: [-72, -43, -11, 0, 0, 0, 0], opacity: [1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.6, 0.2, 0, 0, 0] }}
          transition={transition}
        >
          💕
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1, ...willChange }}
          className="text-8xl"
          initial={{ x: 72, opacity: 1, scale: 1 }}
          animate={{ x: [72, 43, 11, 0, 0, 0, 0], opacity: [1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.6, 0.2, 0, 0, 0] }}
          transition={transition}
        >
          ✉️
        </motion.span>
        <motion.div
          style={{ gridRow: 1, gridColumn: 1, ...willChange }}
          className="w-7 h-7 rounded-full bg-white shadow-[0_0_36px_16px_rgba(255,255,255,0.95)]"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0, 0.4, 0.95, 1, 0.4, 0], scale: [0, 0, 0.7, 1.8, 2.2, 1.1, 0] }}
          transition={transition}
        />
        <motion.span
          style={{ gridRow: 1, gridColumn: 1, ...willChange }}
          className="text-9xl"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0, 0, 0.15, 0.5, 0.9, 1], scale: [0.3, 0.3, 0.3, 0.4, 0.6, 0.95, 1] }}
          transition={transition}
        >
          💌
        </motion.span>
      </div>

      <div className="grid place-items-center h-14 mt-1">
        <motion.span
          style={{ gridRow: 1, gridColumn: 1, ...willChange }}
          className={`${logoFont.className} text-2xl sm:text-4xl text-yellow-300 tracking-tight whitespace-nowrap`}
          initial={{ x: -60, opacity: 1, scale: 1 }}
          animate={{ x: [-60, -36, -8, 0, 0, 0, 0], opacity: [1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.6, 0.2, 0, 0, 0] }}
          transition={transition}
        >
          love
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1, ...willChange }}
          className={`${logoFont.className} text-2xl sm:text-4xl text-white tracking-tight whitespace-nowrap`}
          initial={{ x: 60, opacity: 1, scale: 1 }}
          animate={{ x: [60, 36, 8, 0, 0, 0, 0], opacity: [1, 1, 0.5, 0, 0, 0, 0], scale: [1, 1, 0.6, 0.2, 0, 0, 0] }}
          transition={transition}
        >
          envelope
        </motion.span>
        <motion.span
          style={{ gridRow: 1, gridColumn: 1, ...willChange }}
          className={`${logoFont.className} text-2xl sm:text-4xl tracking-tight whitespace-nowrap`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0, 0, 0.15, 0.5, 0.9, 1], scale: [0.6, 0.6, 0.6, 0.65, 0.8, 0.95, 1] }}
          transition={transition}
        >
          <span className="bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">lovelope</span>
          <span className="text-white/70">.app</span>
        </motion.span>
      </div>
    </div>
  );
}
