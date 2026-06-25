import type { ReactNode } from 'react';

// Brutalist button: square, bordered, monospace, inverts on hover. `acid` is the
// primary (terminal green), `ghost` the secondary. Renders an anchor with href.
type Props = {
  children: ReactNode;
  href?: string;
  variant?: 'acid' | 'ghost';
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
};

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap border px-7 py-3 font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-[background-color,color,border-color,transform] duration-200 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none';

const variants = {
  acid: 'border-acid text-acid hover:bg-acid hover:text-void',
  ghost: 'border-rule-2 text-paper hover:bg-paper hover:text-void',
} as const;

export default function Button({
  children,
  href,
  variant = 'ghost',
  external,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: Props) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
