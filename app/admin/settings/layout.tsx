import { ReactNode } from 'react';
import { requirePageRole, ADMINS } from '@/lib/page-auth';

/** Server guard for the client form in this segment. */
export default async function SegmentLayout({ children }: { children: ReactNode }) {
  await requirePageRole(ADMINS);
  return <>{children}</>;
}
