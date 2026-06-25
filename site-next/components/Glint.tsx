// The brand's four-pointed antique-gold glint from the style bible. This is the
// one sanctioned hand-drawn mark (a single simple geometric glyph, not a UI
// icon): every functional icon on the site comes from Phosphor instead.
export default function Glint({
  size = 12,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`glint ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor" />
    </svg>
  );
}
