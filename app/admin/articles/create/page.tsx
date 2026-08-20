import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

export default function CreateArticlePage() {
  // This redirects to the dynamic edit page with 'create' as the id
  redirect('/admin/articles/create/edit');
}
