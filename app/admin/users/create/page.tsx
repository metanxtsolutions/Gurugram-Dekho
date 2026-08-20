import { redirect } from 'next/navigation';

export default function CreateUsersPage() {
  redirect('/admin/users/create/edit');
}
