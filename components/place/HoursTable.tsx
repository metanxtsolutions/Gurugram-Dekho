'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icons';
import { weekSchedule, nowInGurugram, type Interval } from '@/lib/opening-hours';

export function HoursTable({
  intervals,
  alwaysOpen,
}: {
  intervals: Interval[];
  alwaysOpen: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (alwaysOpen) return <p className="text-sm text-ink-600">Open 24 hours, every day.</p>;
  if (intervals.length === 0)
    return <p className="text-sm text-ink-400">Opening hours not listed yet.</p>;

  const week = weekSchedule(intervals);
  const today = nowInGurugram().day;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-sm font-semibold text-ink-800"
      >
        Opening hours
        <Icon
          name="chevron"
          className={`w-4 h-4 text-ink-400 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <dl className="mt-4 space-y-2">
          {week.map((d) => (
            <div
              key={d.day}
              className={`flex items-baseline justify-between gap-4 text-sm ${
                d.day === today ? 'font-semibold text-ink-950' : 'text-ink-600'
              }`}
            >
              <dt>
                {d.name}
                {d.day === today && (
                  <span className="ml-2 text-[11px] font-bold uppercase tracking-wide text-brand-600">
                    today
                  </span>
                )}
              </dt>
              <dd className="text-right">
                {d.intervals.length > 0 ? d.intervals.join(', ') : 'Closed'}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
