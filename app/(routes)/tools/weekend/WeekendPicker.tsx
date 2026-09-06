'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icons';
import { BUDGET_LABEL, HOURS_LABEL, pick, type Budget, type Hours } from '@/lib/weekend';

/*
  Weekend picker. Three questions, three answers. The choice is mirrored to
  the URL so "here is what we should do" can be sent as a link.
*/

const HOURS: Hours[] = [2, 4, 8];
const BUDGETS: Budget[] = [1, 2, 3];

export function WeekendPicker({ published }: { published: string[] }) {
  const sp = useSearchParams();
  const [hours, setHours] = useState<Hours>(() => (HOURS.includes(Number(sp.get('hours')) as Hours) ? (Number(sp.get('hours')) as Hours) : 4));
  const [budget, setBudget] = useState<Budget>(() => (BUDGETS.includes(Number(sp.get('budget')) as Budget) ? (Number(sp.get('budget')) as Budget) : 2));
  const [car, setCar] = useState<boolean>(() => sp.get('car') === '1');

  useEffect(() => {
    const q = new URLSearchParams({ hours: String(hours), budget: String(budget), car: car ? '1' : '0' }).toString();
    window.history.replaceState(null, '', `?${q}`);
  }, [hours, budget, car]);

  const set = useMemo(() => new Set(published), [published]);
  const picks = useMemo(() => pick(hours, budget, car, set), [hours, budget, car, set]);

  return (
    <div className="grid gap-6">
      <div className="rounded-card border border-line bg-card p-5 sm:p-6 grid gap-6">
        <Choice label="How long have you got?">
          {HOURS.map((h) => (
            <Pill key={h} active={h === hours} onClick={() => setHours(h)}>
              {HOURS_LABEL[h]}
            </Pill>
          ))}
        </Choice>
        <Choice label="What do you want to spend?">
          {BUDGETS.map((b) => (
            <Pill key={b} active={b === budget} onClick={() => setBudget(b)}>
              {BUDGET_LABEL[b]}
            </Pill>
          ))}
        </Choice>
        <Choice label="Do you have a car?">
          <Pill active={!car} onClick={() => setCar(false)}>No, metro and cabs</Pill>
          <Pill active={car} onClick={() => setCar(true)}>Yes</Pill>
        </Choice>
      </div>

      {picks.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-card-2 p-6 text-center">
          <p className="display-sm text-fg text-xl">Nothing fits that exactly</p>
          <p className="mt-1.5 text-[15px] text-fg-muted">Give it more time or a little more money and something will.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {picks.map((p, i) => (
            <Link
              key={p.id}
              href={p.href}
              className={`group rounded-card p-5 sm:p-6 transition-colors ${
                i === 0 ? 'bg-brand-500 text-ink-950' : 'bg-card border border-line hover:border-brand-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`grid place-items-center w-10 h-10 shrink-0 rounded-full text-[15px] font-bold tabular-nums ${
                    i === 0 ? 'bg-ink-950 text-white' : 'bg-brand-500 text-ink-950'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className={`eyebrow ${i === 0 ? 'text-ink-950/60' : 'text-brand-600'}`}>{p.doing}</p>
                  <h3 className={`display-sm mt-1 text-[21px] sm:text-[24px] ${i === 0 ? '' : 'text-fg group-hover:text-brand-600 transition-colors'}`}>
                    {p.title}
                  </h3>
                  <p className={`mt-1.5 text-[15px] leading-relaxed ${i === 0 ? 'text-ink-950/80' : 'text-fg-muted'}`}>{p.line}</p>
                  <p className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] ${i === 0 ? 'text-ink-950/70' : 'text-fg-subtle'}`}>
                    <span className="inline-flex items-center gap-1"><Icon name="clock" className="w-3.5 h-3.5" />{HOURS_LABEL[p.hours]}</span>
                    <span>{BUDGET_LABEL[p.budget]}</span>
                    {p.needsCar && <span>Needs a car</span>}
                    {p.fit === 'shorter' && <span className="font-medium">Shorter than you asked for</span>}
                    {p.fit === 'cheaper' && <span className="font-medium">Cheaper than you allowed</span>}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Choice({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block font-medium text-fg mb-2.5">{label}</span>
      <div className="flex flex-wrap gap-2" role="radiogroup">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`h-11 px-4 rounded-pill border text-[14px] font-medium transition-colors ${
        active ? 'bg-brand-500 border-brand-500 text-ink-950' : 'bg-card border-line text-fg-muted hover:border-brand-500 hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}
