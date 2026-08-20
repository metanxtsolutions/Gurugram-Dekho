import { redirect } from 'next/navigation';

export default function CreatePlacesPage() {
  redirect('/admin/places/create/edit');
}
