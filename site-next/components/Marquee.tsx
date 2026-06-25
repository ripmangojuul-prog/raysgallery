const ITEMS = [
  'Fineline SurRealism',
  'Black & Grey',
  'By appointment only',
  '@hintertattoo',
  'Custom & available flash',
  'Phoenix, Arizona',
];

function Run({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {ITEMS.map((t, i) => (
        <span key={i} className="flex items-center font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          <span className="whitespace-nowrap px-6">{t}</span>
          <span className="text-acid">/</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div
      className="overflow-hidden border-b border-rule bg-void-2/50 py-3"
      aria-label="Fineline SurRealism, by appointment only"
    >
      <div className="marquee-track">
        <Run />
        <Run ariaHidden />
      </div>
    </div>
  );
}
