'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

// A classical portrait given scroll-driven life: it zooms and parallaxes as it
// moves through the viewport (the same scroll-scrub motion the reference site
// uses on its Renaissance paintings). Static under reduced motion.
export default function LivePortrait({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.22, 1.04]);
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-void-2 ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={reduce ? undefined : { scale, y }}
        className="h-full w-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
