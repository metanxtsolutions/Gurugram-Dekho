import { Icon } from './Icons';

/**
 * The designed stand-in for "we have no honest photograph of this yet".
 *
 * Deliberately not a photo: a misleading image costs more trust than an
 * obviously-designed card. Deterministic from the name, so a place keeps the
 * same treatment between renders instead of flickering.
 */

const PALETTES = [
  'from-brand-500/25 via-brand-200/40 to-amber-100',
  'from-sky-500/20 via-sky-200/40 to-slate-100',
  'from-emerald-500/20 via-emerald-200/40 to-lime-100',
  'from-violet-500/20 via-violet-200/40 to-indigo-100',
  'from-rose-500/20 via-rose-200/40 to-orange-100',
  'from-teal-500/20 via-teal-200/40 to-cyan-100',
];

function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Placeholder({
  name,
  icon,
  label,
  className = '',
}: {
  name: string;
  /** Icon key from the shared set, e.g. the category's icon. */
  icon?: string;
  /** Small caption, e.g. the place type. */
  label?: string;
  className?: string;
}) {
  const palette = PALETTES[hash(name) % PALETTES.length];
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      role="img"
      aria-label={`No photograph available for ${name}`}
      className={`absolute inset-0 grid place-items-center bg-gradient-to-br ${palette} ${className}`}
    >
      {/* faint grid so it reads as designed rather than a failed load */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative flex flex-col items-center gap-2 text-ink-700/80">
        {icon ? (
          <Icon name={icon} className="w-7 h-7" />
        ) : (
          <span className="display-sm text-2xl tracking-tight">{initials}</span>
        )}
        {label && (
          <span className="eyebrow text-[10px] text-ink-600/70">{label}</span>
        )}
      </div>
    </div>
  );
}
