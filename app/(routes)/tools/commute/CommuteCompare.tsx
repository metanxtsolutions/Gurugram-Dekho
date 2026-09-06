'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icons';
import { COMMUTE_VERIFIED, HUBS, WHEN_LABEL, estimate, type When } from '@/lib/commute';

/*
  Commute comparison. Pick two hubs and a time of day; get metro, cab and auto
  side by side with time and cost bands and a one-line verdict. The choice is
  mirrored into the URL so a result can be sent as a link.
*/

const WHENS: When[] = ['offpeak', 'peak', 'late'];

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function isWhen(v: string | null): v is When {
  return v === 'offpeak' || v === 'peak' || v === 'late';
}

export function CommuteCompare() {
  const sp = useSearchParams();
  const known = new Set(HUBS.map((h) => h.slug));
  const [from, setFrom] = useState(() => (known.has(sp.get('from') ?? '') ? (sp.get('from') as string) : 'sector-56'));
  const [to, setTo] = useState(() => (known.has(sp.get('to') ?? '') ? (sp.get('to') as string) : 'cyber-city'));
  const [when, setWhen] = useState<When>(() => (isWhen(sp.get('when')) ? (sp.get('when') as When) : 'peak'));

  useEffect(() => {
    const q = new URLSearchParams({ from, to, when }).toString();
    window.history.replaceState(null, '', `?${q}`);
  }, [from, to, when]);

  const result = useMemo(() => estimate(from, to, when), [from, to, when]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-card border border-line bg-card p-5 sm:p-6 grid gap-5">
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <HubSelect id="from" label="From" value={from} onChange={setFrom} />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap from and to"
            className="hidden sm:grid place-items-center w-11 h-11 rounded-full border border-line bg-card-2 text-fg-muted hover:border-brand-500 hover:text-fg transition-colors"
          >
            <Icon name="arrow" className="w-4 h-4 rotate-90 sm:rotate-0" />
          </button>
          <HubSelect id="to" label="To" value={to} onChange={setTo} />
        </div>

        <div>
          <span className="block font-medium text-fg mb-2.5">When</span>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {WHENS.map((w) => {
              const active = w === when;
              return (
                <button
                  key={w}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setWhen(w)}
                  className={`h-11 px-4 rounded-pill border text-[14px] font-medium transition-colors ${
                    active
                      ? 'bg-brand-500 border-brand-500 text-ink-950'
                      : 'bg-card border-line text-fg-muted hover:border-brand-500 hover:text-fg'
                  }`}
                >
                  {WHEN_LABEL[w]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!result && (
        <div className="rounded-card border border-dashed border-line bg-card-2 p-5 text-[15px] text-fg-muted">
          Pick two different places.
        </div>
      )}

      {result && (
        <>
          <div className="rounded-card bg-brand-500 text-ink-950 p-5 sm:p-6">
            <p className="eyebrow text-ink-950/60">
              {result.from.name} to {result.to.name} · about {Math.round(result.roadKm)} km by road
            </p>
            <p className="display-sm mt-1.5 text-[20px] sm:text-[24px] leading-snug">{result.verdict}</p>
          </div>

          <div className="grid gap-3">
            {result.options.map((o) => (
              <div
                key={o.mode}
                className={`rounded-card border bg-card p-5 ${o.available ? 'border-line' : 'border-dashed border-line opacity-80'}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h3 className="display-sm text-[20px] text-fg flex items-center gap-2.5">
                    <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-500 text-ink-950">
                      <Icon name={o.mode === 'metro' ? 'navigation' : o.mode === 'cab' ? 'phone' : 'pin'} className="w-4 h-4" />
                    </span>
                    {o.label}
                  </h3>
                  {o.available ? (
                    <div className="flex items-baseline gap-5 tabular-nums">
                      <span>
                        <span className="display-sm text-[22px] text-fg">{o.timeMin} to {o.timeMax}</span>
                        <span className="ml-1 text-[13px] text-fg-subtle">min</span>
                      </span>
                      <span className="display-sm text-[22px] text-fg">
                        {inr.format(o.costMin)} to {inr.format(o.costMax)}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-pill bg-card-2 border border-line text-[12px] font-medium text-fg-muted">
                      Not an option here
                    </span>
                  )}
                </div>
                <p className="mt-2.5 text-[14.5px] text-fg-muted leading-relaxed">{o.note}</p>
              </div>
            ))}
          </div>

          <p className="text-[12.5px] text-fg-subtle">
            Estimates from a small table of fares and speeds, last checked {COMMUTE_VERIFIED}. Metro time includes the walk at each
            end and a wait for the train. Cab and auto bands cover a normal day; a bad one costs more.
          </p>
        </>
      )}
    </div>
  );
}

function HubSelect({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-fg mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-card border border-line bg-card text-fg text-[16px] focus:outline-none focus:border-brand-500 transition-colors"
      >
        {HUBS.map((h) => (
          <option key={h.slug} value={h.slug}>
            {h.name}
          </option>
        ))}
      </select>
    </div>
  );
}
