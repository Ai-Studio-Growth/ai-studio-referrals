import clsx from 'clsx';

/**
 * Ai Studio Referrals brand mark — a faithful SVG recreation of the supplied
 * logo: a chunky purple "A" holding an orange chat bubble (three dots), with an
 * orange figure + sparkle forming the dot of the "i". Colors are fixed (brand
 * purple + orange) so the mark reads on both light and dark surfaces.
 *
 * To use the original raster artwork instead, drop it at /public/logo.png and
 * swap <LogoMark/> for <img src="/logo.png" />.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} role="img" aria-label="Ai Studio Referrals">
      <defs>
        <linearGradient id="aiPurple" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#5B34F2" />
        </linearGradient>
      </defs>

      {/* Purple A */}
      <path
        d="M150 30 C159 30 167 36 171 46 L269 256 C277 274 265 288 247 288 L200 288 C188 288 180 282 176 272 L150 212 L124 272 C120 282 112 288 100 288 L53 288 C35 288 23 274 31 256 L129 46 C133 36 141 30 150 30 Z"
        fill="url(#aiPurple)"
      />

      {/* Orange chat bubble + tail */}
      <path
        d="M120 116 H180 C188.8 116 196 123.2 196 132 V166 C196 174.8 188.8 182 180 182 H146 L128 206 L126 182 H120 C111.2 182 104 174.8 104 166 V132 C104 123.2 111.2 116 120 116 Z"
        fill="none"
        stroke="#F5A623"
        strokeWidth={9}
        strokeLinejoin="round"
      />
      <g fill="#F5A623">
        <circle cx="130" cy="149" r="6" />
        <circle cx="150" cy="149" r="6" />
        <circle cx="170" cy="149" r="6" />
      </g>

      {/* Orange figure (the "i") */}
      <g fill="#F5A623">
        <circle cx="246" cy="46" r="17" />
        <path d="M246 72 C240 72 235 77 234 86 L224 168 C221 186 232 198 246 198 C260 198 271 186 268 168 L258 86 C257 77 252 72 246 72 Z" />
        {/* sparkle */}
        <path d="M278 10 L283 23 L296 28 L283 33 L278 46 L273 33 L260 28 L273 23 Z" />
      </g>
    </svg>
  );
}

/** Horizontal lockup: mark + themable wordmark. */
export function Logo({ className, wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <span className={clsx('flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9 shrink-0" />
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Ai Studio</span>
          <span className="text-base font-extrabold uppercase tracking-tight text-fg">
            Referrals<span className="text-accent">.</span>
          </span>
        </span>
      )}
    </span>
  );
}
