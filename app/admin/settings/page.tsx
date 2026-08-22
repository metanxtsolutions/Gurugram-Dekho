'use client';

import { useEffect, useState } from 'react';
import { FieldError, FormBanner, useFormErrors } from '@/components/admin/form';

type Settings = {
  siteTitle: string;
  siteTagline: string;
  siteDescription: string;
  defaultMetaDescription: string;
  contactEmail: string;
  googleAnalyticsId: string;
  searchConsoleVerification: string;
};

const EMPTY: Settings = {
  siteTitle: '',
  siteTagline: '',
  siteDescription: '',
  defaultMetaDescription: '',
  contactEmail: '',
  googleAnalyticsId: '',
  searchConsoleVerification: '',
};

export default function SettingsPage() {
  const [values, setValues] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    formError,
    setFormError,
    fieldErrors,
    reset,
    captureResponse,
    clearField,
    fieldProps,
    inputClass,
  } = useFormErrors();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (res.ok && json.data) setValues({ ...EMPTY, ...json.data });
      } catch {
        setFormError('Could not load settings.');
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [setFormError]);

  const change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    clearField(name);
    setSaved(false);
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setSaved(false);
    setLoading(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        await captureResponse(res);
        return;
      }

      const json = await res.json();
      if (json.data) setValues({ ...EMPTY, ...json.data });
      setSaved(true);
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return <p className="text-gray-500">Loading settings…</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">
        These values are used across the public site. Changes take effect immediately.
      </p>

      <FormBanner message={formError} fieldErrors={fieldErrors} />

      {saved && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800"
        >
          Settings saved.
        </div>
      )}

      <form onSubmit={submit} className="space-y-8">
        <Section
          title="Site identity"
          hint="Shown in the browser tab, search results and social shares."
        >
          <Field label="Site title" name="siteTitle" required>
            <input
              type="text"
              name="siteTitle"
              value={values.siteTitle}
              onChange={change}
              required
              className={inputClass('siteTitle')}
              {...fieldProps('siteTitle')}
            />
          </Field>
          <FieldError name="siteTitle" errors={fieldErrors} />

          <Field label="Tagline" name="siteTagline" hint="Appears under the logo.">
            <input
              type="text"
              name="siteTagline"
              value={values.siteTagline}
              onChange={change}
              className={inputClass('siteTagline')}
              {...fieldProps('siteTagline')}
            />
          </Field>
          <FieldError name="siteTagline" errors={fieldErrors} />

          <Field label="Site description" name="siteDescription">
            <textarea
              name="siteDescription"
              value={values.siteDescription}
              onChange={change}
              rows={3}
              className={inputClass('siteDescription')}
              {...fieldProps('siteDescription')}
            />
          </Field>
          <FieldError name="siteDescription" errors={fieldErrors} />

          <Field
            label="Contact email"
            name="contactEmail"
            hint="Optional. Shown on the contact page."
          >
            <input
              type="email"
              name="contactEmail"
              value={values.contactEmail}
              onChange={change}
              placeholder="hello@gurugramdekho.com"
              className={inputClass('contactEmail')}
              {...fieldProps('contactEmail')}
            />
          </Field>
          <FieldError name="contactEmail" errors={fieldErrors} />
        </Section>

        <Section
          title="SEO"
          hint="Used when a page has no description of its own."
        >
          <Field label="Default meta description" name="defaultMetaDescription">
            <textarea
              name="defaultMetaDescription"
              value={values.defaultMetaDescription}
              onChange={change}
              rows={3}
              maxLength={320}
              className={inputClass('defaultMetaDescription')}
              {...fieldProps('defaultMetaDescription')}
            />
          </Field>
          <p className="-mt-2 text-xs text-gray-500">
            {values.defaultMetaDescription.length}/320. Around 155 shows in search results.
          </p>
          <FieldError name="defaultMetaDescription" errors={fieldErrors} />

          <Field
            label="Search Console verification"
            name="searchConsoleVerification"
            hint="The content value from Google's HTML tag method."
          >
            <input
              type="text"
              name="searchConsoleVerification"
              value={values.searchConsoleVerification}
              onChange={change}
              className={inputClass('searchConsoleVerification')}
              {...fieldProps('searchConsoleVerification')}
            />
          </Field>
          <FieldError name="searchConsoleVerification" errors={fieldErrors} />
        </Section>

        <Section
          title="Analytics"
          hint="Leave blank to load no analytics script at all."
        >
          <Field label="Google Analytics ID" name="googleAnalyticsId">
            <input
              type="text"
              name="googleAnalyticsId"
              value={values.googleAnalyticsId}
              onChange={change}
              placeholder="G-XXXXXXXXXX"
              className={inputClass('googleAnalyticsId')}
              {...fieldProps('googleAnalyticsId')}
            />
          </Field>
          <FieldError name="googleAnalyticsId" errors={fieldErrors} />
        </Section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {hint && <p className="mt-1 mb-5 text-sm text-gray-500">{hint}</p>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
        {required && <span className="ml-1 text-orange-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
