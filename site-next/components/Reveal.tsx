'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

// Scroll-reveal leaf. Motion `whileInView` (never a scroll listener), and it
// collapses to a no-op when the visitor prefers reduced motion.
export default function Reveal({
  children,
  delay = 0,
  y = 38,
  amount = 0.25,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  amount?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
