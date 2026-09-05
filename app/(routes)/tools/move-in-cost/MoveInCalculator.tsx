'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icons';

/*
  Move-in cost calculator.

  Every number is the reader's own. The defaults are the Gurugram norms a
  broker will quote when asked: two months' deposit and one month's brokerage.
  Nothing here is fetched; the page is fully usable offline and the inputs are
  mirrored into the URL so a result can be shared as a link.
*/

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

type Inputs = {
  rent: number;
  deposit: number; // months
  brokerage: number; // months
  maintenance: number; // per month
  backup: number; // per month, power backup / DG charge
  advance: boolean; // first month's rent paid on day one
};

const DEFAULTS: Inputs = {
  rent: 30000,
  deposit: 2,
  brokerage: 1,
  maintenance: 0,
  backup: 0,
  advance: true,
};

const DEPOSIT_OPTIONS = [0, 1, 2, 3];
const BROKERAGE_OPTIONS = [0, 0.5, 1];

function readParams(sp: URLSearchParams): Inputs {
  const num = (k: string, fallback: number, max: number) => {
    const v = parseFloat(sp.get(k) ?? '');
    return Number.isFinite(v) && v >= 0 && v <= max ? v : fallback;
  };
  return {
    rent: num('rent', DEFAULTS.rent, 10_000_000),
    deposit: num('deposit', DEFAULTS.deposit, 12),
    brokerage: num('brokerage', DEFAULTS.brokerage, 3),
    maintenance: num('maintenance', DEFAULTS.maintenance, 1_000_000),
    backup: num('backup', DEFAULTS.backup, 1_000_000),
    advance: sp.get('advance') !== '0',
  };
}

export function MoveInCalculator() {
  const searchParams = useSearchParams();
  const [inputs, setInputs] = useState<Inputs>(() => readParams(searchParams));
  const [copied, setCopied] = useState(false);

  // Mirror the inputs into the URL without adding history entries, so the
  // back button still leaves the page and the link in the bar is shareable.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (inputs.rent !== DEFAULTS.rent) sp.set('rent', String(inputs.rent));
    if (inputs.deposit !== DEFAULTS.deposit) sp.set('deposit', String(inputs.deposit));
    if (inputs.brokerage !== DEFAULTS.brokerage) sp.set('brokerage', String(inputs.brokerage));
    if (inputs.maintenance) sp.set('maintenance', String(inputs.maintenance));
    if (inputs.backup) sp.set('backup', String(inputs.backup));
    if (!inputs.advance) sp.set('advance', '0');
    const qs = sp.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [inputs]);

  const result = useMemo(() => {
    const r = inputs.rent || 0;
    const advanceRent = inputs.advance ? r : 0;
    const depositAmt = r * inputs.deposit;
    const brokerageAmt = r * inputs.brokerage;
    const dayOne = advanceRent + depositAmt + brokerageAmt;
    const monthly = r + (inputs.maintenance || 0) + (inputs.backup || 0);
    return { advanceRent, depositAmt, brokerageAmt, dayOne, monthly, refundable: depositAmt };
  }, [inputs]);

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  /*
    Built at click time rather than during render: the share text includes the
    page URL, and reading window.location while rendering made the server and
    client disagree on an href and trip a hydration warning.
  */
  const summaryText = () =>
    [
      `Moving in at ${inr.format(inputs.rent)}/month in Gurugram:`,
      `Cash needed on day one: ${inr.format(result.dayOne)}`,
      `(${inr.format(result.refundable)} of that is a refundable deposit)`,
      `Monthly from month two: ${inr.format(result.monthly)}`,
      window.location.href,
    ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked in some contexts; the share button still works.
    }
  };

  const share = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(summaryText())}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="grid gap-6">
      {/* ── Inputs ── */}
      <div className="rounded-card border border-line bg-card p-5 sm:p-6 grid gap-6">
        <Field label="Monthly rent" hint="What the listing says, before anything else.">
          <MoneyInput value={inputs.rent} onChange={(v) => set('rent', v)} />
        </Field>

        <Field label="Security deposit" hint="Two months is the Gurugram norm. Three is common for furnished flats.">
          <Segmented
            options={DEPOSIT_OPTIONS}
            value={inputs.deposit}
            onChange={(v) => set('deposit', v)}
            format={(v) => (v === 1 ? '1 month' : `${v} months`)}
          />
        </Field>

        <Field label="Brokerage" hint="One month is standard if a broker found it. Half a month is negotiable on longer leases.">
          <Segmented
            options={BROKERAGE_OPTIONS}
            value={inputs.brokerage}
            onChange={(v) => set('brokerage', v)}
            format={(v) => (v === 0 ? 'None' : v === 0.5 ? 'Half month' : '1 month')}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Society maintenance" hint="Per month. Often ₹2 to ₹4 per sq ft in gated societies.">
            <MoneyInput value={inputs.maintenance} onChange={(v) => set('maintenance', v)} />
          </Field>
          <Field label="Power backup charge" hint="Per month. Ask; it is rarely in the listing.">
            <MoneyInput value={inputs.backup} onChange={(v) => set('backup', v)} />
          </Field>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inputs.advance}
            onChange={(e) => set('advance', e.target.checked)}
            className="mt-1 w-5 h-5 accent-brand-500"
          />
          <span>
            <span className="block font-medium text-fg">First month&apos;s rent paid on move-in day</span>
            <span className="block text-[13px] text-fg-muted">Almost always. Untick only if your landlord bills at the end of the month.</span>
          </span>
        </label>
      </div>

      {/* ── Result ── */}
      <div className="rounded-card border border-line bg-card overflow-hidden">
        <div className="bg-brand-500 text-ink-950 p-5 sm:p-6">
          <p className="eyebrow text-ink-950/70">Cash needed on day one</p>
          <p className="display text-[2.4rem] sm:text-[3rem] tabular-nums mt-1">{inr.format(result.dayOne)}</p>
          <p className="mt-1.5 text-[14px] text-ink-950/80">
            {inr.format(result.refundable)} of that is your deposit, which you should get back.
          </p>
        </div>

        <dl className="p-5 sm:p-6 grid gap-2.5 text-[15px]">
          <Row label="First month's rent" value={inr.format(result.advanceRent)} muted={!inputs.advance} />
          <Row label={`Deposit (${inputs.deposit} ${inputs.deposit === 1 ? 'month' : 'months'})`} value={inr.format(result.depositAmt)} note="refundable" />
          <Row label={`Brokerage (${inputs.brokerage === 0 ? 'none' : inputs.brokerage === 0.5 ? 'half month' : '1 month'})`} value={inr.format(result.brokerageAmt)} note="not refundable" />
          <div className="border-t border-line my-1" />
          <Row label="Every month from month two" value={inr.format(result.monthly)} strong />
          {(inputs.maintenance > 0 || inputs.backup > 0) && (
            <p className="text-[13px] text-fg-subtle -mt-1">
              Rent {inr.format(inputs.rent)}
              {inputs.maintenance > 0 && <> + maintenance {inr.format(inputs.maintenance)}</>}
              {inputs.backup > 0 && <> + backup {inr.format(inputs.backup)}</>}
            </p>
          )}
        </dl>

        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-ink-950 text-white text-[14px] font-medium hover:bg-ink-800 transition-colors"
          >
            <Icon name="navigation" className="w-4 h-4" />
            Share on WhatsApp
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill border border-line bg-card text-fg text-[14px] font-medium hover:border-brand-500 transition-colors"
          >
            {copied ? 'Copied' : 'Copy summary'}
          </button>
        </div>
      </div>

      {/* ── Honest edges ── */}
      <div className="rounded-card bg-card-2 border border-line p-5">
        <p className="eyebrow text-fg-subtle">What this does not include</p>
        <ul className="mt-2 text-[14px] text-fg-muted space-y-1.5 list-disc pl-5">
          <li>Movers and packers, usually ₹4,000 to ₹15,000 within Gurugram depending on how much you own.</li>
          <li>Society move-in charges, which some gated communities bill separately. Ask the RWA.</li>
          <li>Stamp duty and registration on the rent agreement. Small on an 11-month agreement, but not zero.</li>
          <li>Police verification, which is free but takes a morning.</li>
          <li>GST on brokerage. Registered brokers add 18%; many do not charge it. Ask before you agree the fee.</li>
          <li>Internet and gas connection setup, and the first grocery run that always costs more than you think.</li>
        </ul>
      </div>

      {/* ── Sticky total on phones, so the number stays in view while adjusting ── */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/95 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-fg-subtle leading-none">Day one</p>
          <p className="display text-[20px] tabular-nums leading-tight">{inr.format(result.dayOne)}</p>
        </div>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-pill bg-brand-500 text-ink-950 text-[14px] font-semibold"
        >
          Share
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block font-medium text-fg">{label}</span>
      {hint && <span className="block text-[13px] text-fg-muted mt-0.5 mb-2.5">{hint}</span>}
      {!hint && <span className="block mb-2.5" />}
      {children}
    </div>
  );
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle font-medium">₹</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={500}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        className="w-full h-12 pl-9 pr-4 rounded-card border border-line bg-card text-fg text-[17px] tabular-nums focus:outline-none focus:border-brand-500 transition-colors"
      />
    </div>
  );
}

function Segmented<T extends number>({
  options,
  value,
  onChange,
  format,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={`h-11 px-4 rounded-pill border text-[14px] font-medium transition-colors ${
              active
                ? 'bg-brand-500 border-brand-500 text-ink-950'
                : 'bg-card border-line text-fg-muted hover:border-brand-500 hover:text-fg'
            }`}
          >
            {format(opt)}
          </button>
        );
      })}
    </div>
  );
}

function Row({
  label,
  value,
  note,
  strong = false,
  muted = false,
}: {
  label: string;
  value: string;
  note?: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${muted ? 'opacity-50' : ''}`}>
      <dt className={strong ? 'font-semibold text-fg' : 'text-fg-muted'}>
        {label}
        {note && <span className="ml-2 text-[12px] text-fg-subtle">{note}</span>}
      </dt>
      <dd className={`tabular-nums ${strong ? 'font-semibold text-fg' : 'text-fg'}`}>{value}</dd>
    </div>
  );
}
