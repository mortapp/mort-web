// MORT logomark — a guiding star over a wave (the safe crossing).
export function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg className="mort-logomark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="mort-mark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#8fb2e0" />
        </linearGradient>
      </defs>
      <path d="M16 2.5l1.7 4.9 4.9 1.7-4.9 1.7L16 15.6l-1.7-4.8L9.4 9.1l4.9-1.7z" fill="url(#mort-mark-grad)" />
      <path d="M4.5 21 Q16 28 27.5 21" fill="none" stroke="url(#mort-mark-grad)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M7 25.6 Q16 31 25 25.6" fill="none" stroke="url(#mort-mark-grad)" strokeWidth="1.9" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}
