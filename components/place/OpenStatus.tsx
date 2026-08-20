import type { OpenState } from '@/lib/opening-hours';

const TONE: Record<OpenState['status'], string> = {
  open: 'bg-emerald-500/12 text-emerald-700 ring-emerald-600/20',
  always: 'bg-emerald-500/12 text-emerald-700 ring-emerald-600/20',
  closed: 'bg-ink-500/8 text-ink-600 ring-ink-500/15',
  unknown: 'bg-ink-500/8 text-ink-500 ring-ink-500/10',
};

export function OpenStatus({
  state,
  className = '',
  onDark = false,
}: {
  state: OpenState;
  className?: string;
  onDark?: boolean;
}) {
  const isOpen = state.status === 'open' || state.status === 'always';
  const closingSoon = state.status === 'open' && state.closingSoon;

  const tone = onDark
    ? isOpen
      ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/25'
      : 'bg-white/10 text-ink-300 ring-white/15'
    : TONE[state.status];

  const dot = closingSoon
    ? 'bg-amber-500'
    : isOpen
      ? onDark ? 'bg-emerald-400' : 'bg-emerald-500'
      : 'bg-ink-400';

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset ${tone} ${className}`}
    >
      <span className="relative flex w-2 h-2 shrink-0">
        {closingSoon && (
          <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping" />
        )}
        <span className={`relative w-2 h-2 rounded-full ${dot}`} />
      </span>
      {state.label}
    </span>
  );
}
