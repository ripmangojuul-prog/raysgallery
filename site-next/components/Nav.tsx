'use client';

import { useEffect, useState } from 'react';
import { List, X } from '@phosphor-icons/react';
import { LINKS } from '@/lib/data';

const NAV_LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#flash', label: 'Flash' },
  { href: '#artist', label: 'Artist' },
  { href: '#faq', label: 'FAQ' },
  { href: '#create', label: 'Create' },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById('nav-sentinel');
    if (!sentinel) return;
    const io = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting), {
      rootMargin: '0px',
    });
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = open ? 'hidden' : '';
    return () => {
      root.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] border-b transition-colors duration-300 ${
          solid ? 'border-rule bg-void/90 backdrop-blur-sm' : 'border-transparent'
        }`}
      >
        <nav className="shell flex h-[58px] items-center justify-between">
          <a
            href="#top"
            onClick={() => setOpen(false)}
            className="font-head text-[1.05rem] font-bold uppercase tracking-[0.06em] text-paper"
          >
            Hinter<span className="text-acid">//</span>Tattoo
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-dim transition-colors hover:text-acid"
              >
                {l.label}
              </a>
            ))}
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint">[ PHX ]</span>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center border border-rule-2 text-paper md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[99] flex flex-col justify-center bg-void/97 px-[var(--gutter)] backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="flex flex-col gap-6">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="flex items-baseline gap-4 font-head text-[1.8rem] font-bold uppercase leading-none text-paper transition-colors hover:text-acid"
            >
              <span className="font-mono text-[0.8rem] text-acid">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-1 font-mono text-[0.74rem] uppercase tracking-[0.12em] text-faint">
          <a href={LINKS.instagram} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} className="hover:text-acid">
            @hintertattoo
          </a>
          <span>Phoenix, Arizona // by appointment only</span>
        </div>
      </div>
    </>
  );
}
