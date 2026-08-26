/*
  The lockup, built the same way KolkataDekho's is: the city name set in its
  own script inside a marigold badge, followed by "dekho" where the round
  letters are drawn as eyes. Dekho means look, so the mark looks back.

  Composed from HTML and inline SVG rather than an image file, so it stays
  crisp at any size, inherits the current text colour in both themes, and can
  be scaled from one prop.
*/

/** One eye: a ring with a pupil, standing in for a round letter. */
function Eye({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <circle cx="12" cy="12" r="10.6" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="12" cy="12" r="5" fill="currentColor" />
    </svg>
  );
}

const SIZES = {
  sm: { badge: 'text-[13px] px-2 py-[3px]', word: 'text-[19px]', eye: 'w-[13px] h-[13px]', stem: 'h-[19px]', gap: 'gap-1.5' },
  md: { badge: 'text-[17px] px-2.5 py-1', word: 'text-[26px]', eye: 'w-[18px] h-[18px]', stem: 'h-[26px]', gap: 'gap-2' },
  lg: { badge: 'text-[22px] px-3.5 py-1.5', word: 'text-[34px]', eye: 'w-[23px] h-[23px]', stem: 'h-[34px]', gap: 'gap-2.5' },
} as const;

export function Wordmark({
  size = 'md',
  city = 'गुरुग्राम',
  className = '',
}: {
  size?: keyof typeof SIZES;
  /** The city name in its own script. Devanagari for Gurugram. */
  city?: string;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <span
        className={`inline-block rounded-[10px] bg-brand-500 font-display font-extrabold leading-none text-ink-950 ${s.badge}`}
      >
        {city}
      </span>

      {/* "dekho", with the d's bowl and the final o drawn as eyes */}
      <span
        className={`inline-flex items-end font-display font-extrabold leading-none tracking-tight ${s.word}`}
      >
        {/* the d: an eye for the bowl, a stem to its right */}
        <span className="inline-flex items-end">
          <Eye className={s.eye} />
          <span
            aria-hidden="true"
            className={`inline-block w-[2.6px] rounded-[2px] bg-current -ml-[2.6px] ${s.stem}`}
          />
        </span>
        <span className="ml-[0.06em]">ekh</span>
        <Eye className={`${s.eye} ml-[0.04em]`} />
      </span>

      <span className="sr-only">dekho</span>
    </span>
  );
}
