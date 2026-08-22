'use client';

import { useCallback, useState } from 'react';

/**
 * Wiring for server-side validation errors in the admin forms.
 *
 * The write endpoints reject a bad payload with:
 *   { error: "Validation failed", fields: { slug: ["..."] } }
 *
 * The forms previously threw that body away and showed a generic message, so
 * an editor had no idea which input was wrong.
 */

export type FieldErrors = Record<string, string[]>;

export function useFormErrors() {
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const reset = useCallback(() => {
    setFormError('');
    setFieldErrors({});
  }, []);

  /** Read a failed response and surface both the summary and per-field errors. */
  const captureResponse = useCallback(async (response: Response) => {
    let payload: { error?: string; fields?: FieldErrors } | null = null;
    try {
      payload = await response.json();
    } catch {
      // Non-JSON body (a proxy error page, say), fall through to status text.
    }

    const fields = payload?.fields ?? {};
    setFieldErrors(fields);
    setFormError(
      payload?.error ??
        (response.status === 401
          ? 'Your session has expired. Sign in again.'
          : response.status === 403
            ? 'You do not have permission to do that.'
            : `Request failed (${response.status})`)
    );

    // Move focus to the first input the server rejected.
    const firstField = Object.keys(fields)[0];
    if (firstField && typeof document !== 'undefined') {
      const el = document.querySelector<HTMLElement>(`[name="${firstField}"]`);
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    return fields;
  }, []);

  /** Drop a field's error as soon as the editor edits it. */
  const clearField = useCallback((name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const fieldProps = useCallback(
    (name: string) =>
      fieldErrors[name]
        ? ({ 'aria-invalid': true, 'aria-describedby': `${name}-error` } as const)
        : {},
    [fieldErrors]
  );

  /** Base input classes plus a red ring when the field is rejected. */
  const inputClass = useCallback(
    (name: string, base = 'w-full px-4 py-2 border rounded focus:outline-none focus:ring-2') =>
      `${base} ${
        fieldErrors[name]
          ? 'border-red-500 focus:ring-red-500 bg-red-50'
          : 'border-gray-300 focus:ring-orange-500'
      }`,
    [fieldErrors]
  );

  return {
    formError,
    setFormError,
    fieldErrors,
    reset,
    captureResponse,
    clearField,
    fieldProps,
    inputClass,
  };
}

export function FieldError({ name, errors }: { name: string; errors: FieldErrors }) {
  const messages = errors[name];
  if (!messages?.length) return null;

  return (
    <p id={`${name}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
      {messages.join('. ')}
    </p>
  );
}

export function FormBanner({
  message,
  fieldErrors,
}: {
  message: string;
  fieldErrors: FieldErrors;
}) {
  if (!message) return null;
  const count = Object.keys(fieldErrors).length;

  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
    >
      <p className="font-semibold">{message}</p>
      {count > 0 && (
        <p className="mt-1 text-sm text-red-700">
          {count === 1 ? '1 field needs attention' : `${count} fields need attention`}, see the
          highlighted inputs below.
        </p>
      )}
    </div>
  );
}
