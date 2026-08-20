import { redirect } from 'next/navigation';

/** /admin had no index route and returned 404. */
export default function AdminIndex() {
  redirect('/admin/dashboard');
}
