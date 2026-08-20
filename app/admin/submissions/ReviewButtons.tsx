'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ReviewButtons({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const review = async (action: 'approve' | 'reject') => {
    setBusy(action);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, attach: action === 'approve' }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? `Failed (${res.status})`);
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <button
          onClick={() => review('approve')}
          disabled={busy !== null}
          className="flex-1 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50"
        >
          {busy === 'approve' ? 'Approving…' : 'Approve & use'}
        </button>
        <button
          onClick={() => review('reject')}
          disabled={busy !== null}
          className="px-4 py-2 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {busy === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
