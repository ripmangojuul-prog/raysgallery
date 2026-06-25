'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X, CaretLeft, CaretRight } from '@phosphor-icons/react';

export type LightboxItem = { src: string; alt: string; title?: string; meta?: string };
type State = { items: LightboxItem[]; index: number } | null;

const LightboxCtx = createContext<{ open: (items: LightboxItem[], index: number) => void } | null>(
  null,
);

export function useLightbox() {
  const ctx = useContext(LightboxCtx);
  if (!ctx) throw new Error('useLightbox must be used within LightboxProvider');
  return ctx;
}

export default function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const open = useCallback((items: LightboxItem[], index: number) => setState({ items, index }), []);
  const close = useCallback(() => setState(null), []);
  const nav = useCallback(
    (dir: number) =>
      setState((s) => (s ? { ...s, index: (s.index + dir + s.items.length) % s.items.length } : s)),
    [],
  );

  return (
    <LightboxCtx.Provider value={{ open }}>
      {children}
      {mounted && state
        ? createPortal(<Dialog state={state} close={close} nav={nav} />, document.body)
        : null}
    </LightboxCtx.Provider>
  );
}

const navBtn =
  'absolute top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center border border-rule-2 text-dim transition-colors hover:border-acid hover:text-acid active:translate-y-[calc(-50%+1px)]';

function Dialog({
  state,
  close,
  nav,
}: {
  state: NonNullable<State>;
  close: () => void;
  nav: (dir: number) => void;
}) {
  const { items, index } = state;
  const item = items[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    root.style.overflow = 'hidden';

    // Make the rest of the page inert while the modal is open.
    const self = dialogRef.current;
    const siblings = Array.from(document.body.children).filter((el) => el !== self);
    siblings.forEach((el) => {
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    });

    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowRight') {
        nav(1);
      } else if (e.key === 'ArrowLeft') {
        nav(-1);
      } else if (e.key === 'Tab') {
        const f = self?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
        if (!f || !f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = '';
      siblings.forEach((el) => {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      });
      prevFocused?.focus?.();
    };
  }, [close, nav]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title ?? 'Artwork'}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-void/95 p-5 backdrop-blur-sm sm:p-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button
        ref={closeRef}
        onClick={close}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center border border-rule-2 text-dim transition-colors hover:border-acid hover:text-acid active:translate-y-px"
      >
        <X size={24} weight="light" />
      </button>

      {items.length > 1 ? (
        <button onClick={() => nav(-1)} aria-label="Previous piece" className={`${navBtn} left-2 sm:left-5`}>
          <CaretLeft size={30} weight="light" />
        </button>
      ) : null}

      <figure className="flex max-h-full max-w-[min(92vw,1100px)] flex-col items-center gap-5">
        <img
          src={item.src}
          alt={item.alt}
          className="max-h-[76vh] w-auto border border-rule-2 object-contain"
        />
        {item.title || item.meta ? (
          <figcaption className="text-center">
            {item.title ? (
              <span className="block font-head text-xl font-bold uppercase tracking-wide text-paper">
                {item.title}
              </span>
            ) : null}
            {item.meta ? (
              <span className="mt-1 block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-acid">
                {item.meta}
              </span>
            ) : null}
          </figcaption>
        ) : null}
      </figure>

      {items.length > 1 ? (
        <button onClick={() => nav(1)} aria-label="Next piece" className={`${navBtn} right-2 sm:right-5`}>
          <CaretRight size={30} weight="light" />
        </button>
      ) : null}
    </div>
  );
}
