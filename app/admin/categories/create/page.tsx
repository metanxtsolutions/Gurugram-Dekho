import { redirect } from 'next/navigation';

export default function CreateCategoriesPage() {
  redirect('/admin/categories/create/edit');
}
