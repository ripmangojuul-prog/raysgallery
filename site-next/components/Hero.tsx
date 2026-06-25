'use client';

import { motion, useReducedMotion } from 'motion/react';
import LivePortrait from './LivePortrait';
import Button from './Button';

const EASE = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay, reduce }: { children: React.ReactNode; delay: number; reduce: boolean }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={reduce ? false : { y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const reduce = useReducedMotion() ?? false;

  return (
    <header id="top" className="relative min-h-[100svh] border-b border-rule">
      <div className="shell flex min-h-[100svh] flex-col">
        {/* meta strip under the nav */}
        <div className="flex items-center justify-between border-b border-rule pt-[58px] font-mono text-[0.68rem] uppercase tracking-[0.2em] text-dim">
          <span className="py-3 text-acid">// fineline surrealism</span>
          <span className="py-3">PHX // by appointment</span>
        </div>

        <div className="grid flex-1 grid-cols-1 md:grid-cols-[1.45fr_1fr]">
          {/* wordmark + value prop */}
          <div className="flex flex-col justify-center py-12 md:border-r md:border-rule md:pr-10">
            <h1 className="border-l-[3px] border-acid pl-5 font-head font-bold uppercase leading-[0.84] tracking-[-0.02em] text-paper text-[clamp(3.4rem,13vw,11rem)] md:pl-7">
              <Line delay={0.1} reduce={reduce}>
                <span className="block">Hinter</span>
              </Line>
              <Line delay={0.22} reduce={reduce}>
                <span className="block">Tattoo</span>
              </Line>
            </h1>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
            >
              <p className="mt-8 max-w-[42ch] text-[0.95rem] leading-relaxed text-dim">
                Engravings on skin. Black and grey surrealism in single-needle line. Classical
                technique, uneasy dreams.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="#book" variant="acid">
                  Request an appointment
                </Button>
                <Button href="#work" variant="ghost">
                  View the work
                </Button>
              </div>
            </motion.div>
          </div>

          {/* framed living portrait */}
          <div className="relative min-h-[44svh] border-t border-rule md:min-h-0 md:border-t-0">
            <LivePortrait
              src="/artwork/portrait-1.jpg"
              alt="Black and grey neoclassical painting of a seated woman, head bowed, the lower edge dissolving into fine engraving lines"
              className="absolute inset-0"
              priority
            />
          </div>
        </div>
      </div>
    </header>
  );
}
