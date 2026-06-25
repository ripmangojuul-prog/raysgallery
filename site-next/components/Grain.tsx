// Fixed, non-interactive film-grain overlay. Static texture (see globals.css)
// so it never repaints during scroll.
export default function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
