'use client';

import { useRef, useState } from 'react';
import { Icon } from './Icons';
import { downscaleImage } from '@/lib/downscale-client';

const GRANT_TEXT =
  'I took this photograph, or I own the rights to it, and I grant Gurugram Dekho a ' +
  'non-exclusive, royalty-free licence to publish it on the site with credit to me. ' +
  'I understand I can ask for it to be removed at any time.';

type Props = { subjectName: string; placeId?: string; areaId?: string };

export function PhotoSubmitForm({ subjectName, placeId, areaId }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFields({});

    try {
      const data = new FormData(e.currentTarget);
      if (placeId) data.set('placeId', placeId);
      if (areaId) data.set('areaId', areaId);

      // Shrink before upload so a large phone photo is not rejected at the
      // platform edge, where the error would be unreadable.
      const chosen = data.get('photo');
      if (chosen instanceof File && chosen.size > 0) {
        data.set('photo', await downscaleImage(chosen));
      }

      const res = await fetch('/api/submissions', { method: 'POST', body: data });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setFields(json?.fields ?? {});
        setError(json?.error ?? `Upload failed (${res.status})`);
        return;
      }

      setDone(true);
      formRef.current?.reset();
      setPreview(null);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="font-bold text-emerald-900">Thank you</h3>
        <p className="mt-1.5 text-sm text-emerald-800">
          An editor will review your photo before it appears on the site.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-dashed border-ink-200 text-sm font-semibold text-ink-600 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/40 transition-colors"
      >
        <Icon name="pin" className="w-4 h-4" />
        Have a photo of {subjectName}? Send it in
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="rounded-2xl border border-ink-100 bg-white p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-ink-950">Add a photo of {subjectName}</h3>
          <p className="mt-1 text-sm text-ink-500">
            Only photos you took yourself. We credit every published photo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="shrink-0 grid place-items-center w-8 h-8 rounded-lg text-ink-400 hover:bg-ink-50"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Field label="Photo" name="photo" errors={fields}>
        <input
          type="file"
          name="photo"
          required
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
          className="w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-ink-100 file:text-ink-700 file:font-medium hover:file:bg-ink-200"
        />
      </Field>

      {preview && (
        // Local object URL, so a plain img is correct here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="w-full max-h-52 object-cover rounded-xl" />
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Your name" name="submitterName" errors={fields}>
          <input
            type="text"
            name="submitterName"
            required
            placeholder="How you want to be credited"
            className="w-full px-4 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:border-brand-500"
          />
        </Field>
        <Field label="Email" name="submitterEmail" errors={fields}>
          <input
            type="email"
            name="submitterEmail"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:border-brand-500"
          />
        </Field>
      </div>

      <Field label="Anything we should know?" name="note" errors={fields} optional>
        <textarea
          name="note"
          rows={2}
          maxLength={500}
          placeholder="When you took it, what it shows…"
          className="w-full px-4 py-2.5 rounded-xl border border-ink-200 text-sm focus:outline-none focus:border-brand-500"
        />
      </Field>

      <label className="flex gap-3 items-start rounded-xl bg-ink-50 p-4">
        <input
          type="checkbox"
          name="licenseAgreed"
          value="true"
          required
          className="mt-0.5 shrink-0"
        />
        <span className="text-xs leading-relaxed text-ink-600">{GRANT_TEXT}</span>
      </label>
      {fields.licenseAgreed && (
        <p role="alert" className="-mt-2 text-sm text-red-600">
          {fields.licenseAgreed.join('. ')}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors disabled:opacity-50"
      >
        {busy ? 'Uploading…' : 'Send photo'}
      </button>
      <p className="text-xs text-ink-400">
        Your email is used only to credit you and is never published.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  errors,
  optional,
  children,
}: {
  label: string;
  name: string;
  errors: Record<string, string[]>;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-800 mb-1.5">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-400">optional</span>}
      </label>
      {children}
      {errors[name] && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">
          {errors[name].join('. ')}
        </p>
      )}
    </div>
  );
}
