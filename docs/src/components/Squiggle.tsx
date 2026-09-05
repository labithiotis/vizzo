export function Squiggle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <path
        d="M2 8 Q 20 1 38 8 T 74 8 T 110 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength="1"
        className="vizzo-squiggle"
      />
    </svg>
  );
}
