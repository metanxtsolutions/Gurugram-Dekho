'use client';

import { useSyncExternalStore } from 'react';
import { Icon } from '@/components/Icons';

/*
  PG safety checklist.

  A list to take to a viewing, ticked on the phone in the room. Ticks are kept
  in this browser only, so a checklist started at one PG on Saturday is still
  there for the second one on Sunday. Nothing is sent anywhere.
*/

type Item = { id: string; label: string; why: string; ask: string; critical?: boolean };
type Group = { title: string; items: Item[] };

export const GROUPS: Group[] = [
  {
    title: 'Getting out in an emergency',
    items: [
      { id: 'exit', label: 'A second way out, not just the main stair', critical: true, why: 'Most PG buildings are converted houses with one staircase. A grille on the terrace door is the difference between an exit and a trap.', ask: 'Show me the other way out if the stairs are blocked.' },
      { id: 'grilles', label: 'Window grilles open from inside, or there are none', critical: true, why: 'Welded grilles on every window are common and make a room a box.', ask: 'Do any of these grilles open?' },
      { id: 'extinguisher', label: 'A fire extinguisher on each floor, with a date on it', why: 'One on the ground floor by the door is decoration. One per floor, serviced in the last year, is a system.', ask: 'When was this last checked?' },
      { id: 'wiring', label: 'No exposed wiring or tangled extension boards', why: 'Overloaded boards in rooms full of laptops and heaters start most PG fires.', ask: 'How many sockets are in the room, and can I run a heater?' },
    ],
  },
  {
    title: 'Who can get in',
    items: [
      { id: 'cctv', label: 'CCTV at the entrance, and someone actually looks at it', why: 'A camera nobody reviews is a deterrent at best. Ask who has the footage.', ask: 'Who watches the cameras, and for how long is footage kept?' },
      { id: 'guard', label: 'A guard or warden present overnight', critical: true, why: 'The difference between a locked door and a staffed one is who answers at 2am.', ask: 'Who is here between midnight and 6am?' },
      { id: 'lock', label: 'Your room locks, and you hold the only key', why: 'Spare keys with the owner are normal; spare keys with the cleaner are not.', ask: 'Who else has a key to my room?' },
      { id: 'guests', label: 'The guest and curfew rules are written down', why: 'Unwritten rules change when it suits the owner. Written ones are the ones you can hold them to.', ask: 'Can I see the house rules on paper?' },
    ],
  },
  {
    title: 'Water, power and the basics',
    items: [
      { id: 'water', label: 'Water comes every day, and you have seen the tank', critical: true, why: 'Summer water cuts are routine in parts of Gurugram. A PG with its own storage rides them out; one without buys tankers and passes the cost on.', ask: 'What happens when the supply stops for two days?' },
      { id: 'backup', label: 'Power backup covers the room, not just the corridor', why: '"Full backup" often means one light and one fan. Ask whether it runs the AC, and for how long.', ask: 'What exactly runs on backup, and is it metered?' },
      { id: 'wifi', label: 'Wi-Fi speed tested in the room, not the lobby', why: 'Routers live downstairs. Rooms on the top floor get the leftovers.', ask: 'Can I run a speed test in the room now?' },
      { id: 'food', label: 'Meal times and menu written down, and a sample tasted', why: 'Food is the reason people leave PGs. A written menu is a promise; a tasting is evidence.', ask: 'What was dinner last night?' },
    ],
  },
  {
    title: 'Money and paperwork',
    items: [
      { id: 'deposit', label: 'Deposit amount and return timeline in writing', critical: true, why: 'Deposits vanish when the terms were verbal. One month is normal; two is negotiable.', ask: 'Within how many days is the deposit returned, and what is deducted?' },
      { id: 'notice', label: 'Notice period and lock-in stated', why: 'A three-month lock-in on a place you have not slept in yet is a bet with your own money.', ask: 'What does it cost to leave after one month?' },
      { id: 'receipt', label: 'You get a receipt for every payment', why: 'Cash with no receipt is the most common dispute in the city.', ask: 'Can you send the receipt on WhatsApp each month?' },
      { id: 'police', label: 'Police verification is done for tenants and staff', why: 'It is required, it is free, and a PG that skips it is skipping other things too.', ask: 'Is the verification form filled for me and for the staff?' },
    ],
  },
];

const STORAGE_KEY = 'gd-pg-checklist';
const TOTAL = GROUPS.reduce((n, g) => n + g.items.length, 0);
const CRITICAL = GROUPS.flatMap((g) => g.items).filter((i) => i.critical).map((i) => i.id);

/*
  The ticks live in localStorage and reach React through useSyncExternalStore,
  which is the hook made for exactly this. The server snapshot is always empty,
  so the first client render matches the HTML and the saved ticks arrive in
  the render straight after, with no effect writing state.
*/
const listeners = new Set<() => void>();
const EMPTY = '[]';

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}
function writeRaw(next: string) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage: ticks still work for this visit via
    // the in-memory fallback below.
    memory = next;
  }
  listeners.forEach((l) => l());
}
let memory: string | null = null;
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}
const getSnapshot = () => memory ?? readRaw();
const getServerSnapshot = () => EMPTY;

export function PgChecklist() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ticked = new Set<string>(JSON.parse(raw) as string[]);

  const toggle = (id: string) => {
    const next = new Set(ticked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    writeRaw(JSON.stringify([...next]));
  };
  const reset = () => writeRaw(EMPTY);

  const done = ticked.size;
  const criticalMissing = CRITICAL.filter((id) => !ticked.has(id));
  const verdict =
    done === 0
      ? 'Tick things as you check them. The critical ones are marked.'
      : criticalMissing.length > 0
        ? `${criticalMissing.length} critical ${criticalMissing.length === 1 ? 'item is' : 'items are'} still unchecked. Do not pay a deposit until they are.`
        : done === TOTAL
          ? 'Everything checked. This is as safe as a viewing can tell you.'
          : 'All the critical items are covered. The rest are comfort, and worth asking about.';

  return (
    <div className="grid gap-6">
      {/* ── Score ── */}
      <div className={`rounded-card p-5 sm:p-6 ${criticalMissing.length > 0 && done > 0 ? 'bg-ink-950 text-white' : 'bg-brand-500 text-ink-950'}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="eyebrow opacity-70">Checked</p>
          <p className="display text-[2rem] tabular-nums">
            {done} <span className="text-[1rem] opacity-70">of {TOTAL}</span>
          </p>
        </div>
        <div className="mt-2 h-2 rounded-full bg-current/15 overflow-hidden">
          <div className="h-full rounded-full bg-current transition-[width] duration-300" style={{ width: `${(done / TOTAL) * 100}%` }} />
        </div>
        <p className="mt-3 text-[15px] leading-snug">{verdict}</p>
      </div>

      {/* ── The list ── */}
      {GROUPS.map((g) => (
        <section key={g.title} className="rounded-card border border-line bg-card overflow-hidden">
          <h2 className="display-sm text-[19px] text-fg px-5 pt-5 pb-3 border-b border-line">{g.title}</h2>
          <ul>
            {g.items.map((it) => {
              const on = ticked.has(it.id);
              return (
                <li key={it.id} className="border-b border-line last:border-b-0">
                  <label className="flex items-start gap-3.5 px-5 py-4 cursor-pointer hover:bg-card-2 transition-colors">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(it.id)}
                      className="mt-1 w-5 h-5 shrink-0 accent-brand-500"
                    />
                    <span className="min-w-0">
                      <span className={`block text-[15.5px] font-medium ${on ? 'text-fg-subtle line-through' : 'text-fg'}`}>
                        {it.label}
                        {it.critical && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-pill bg-brand-500/15 text-brand-700 text-[10.5px] font-semibold uppercase tracking-wide align-middle">
                            critical
                          </span>
                        )}
                      </span>
                      <span className="block mt-1 text-[13.5px] text-fg-muted leading-relaxed">{it.why}</span>
                      <span className="block mt-1.5 text-[13px] text-fg leading-relaxed">
                        <span className="font-medium text-brand-700">Ask:</span> {it.ask}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-2.5 no-print">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-ink-950 text-white text-[14px] font-medium hover:bg-ink-800 transition-colors"
        >
          <Icon name="book" className="w-4 h-4" />
          Print this list
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill border border-line bg-card text-fg text-[14px] font-medium hover:border-brand-500 transition-colors"
        >
          Start again for the next viewing
        </button>
      </div>
      <p className="text-[12.5px] text-fg-subtle no-print">
        Ticks are saved in this browser only. Nothing is sent anywhere.
      </p>
    </div>
  );
}
