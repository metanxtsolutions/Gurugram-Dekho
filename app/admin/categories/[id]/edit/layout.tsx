import { ReactNode } from 'react';
import { requirePageRole, EDITORS } from '@/lib/page-auth';

/** Server guard for the client form in this segment. */
export default async function SegmentLayout({ children }: { children: ReactNode }) {
  await requirePageRole(EDITORS);
  return <>{children}</>;
}
