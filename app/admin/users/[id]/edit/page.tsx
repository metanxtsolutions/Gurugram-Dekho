'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FieldError, FormBanner, useFormErrors } from '@/components/admin/form';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id) && id !== 'create';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'contributor',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const { formError, setFormError, fieldErrors, reset, captureResponse, clearField, fieldProps, inputClass } =
    useFormErrors();

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        const json = await res.json();
        if (!res.ok || !json.data) return;
        setFormData({
          name: json.data.name ?? '',
          email: json.data.email ?? '',
          role: json.data.role ?? 'contributor',
          isActive: json.data.isActive ?? true,
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    clearField(name);
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);

    try {
      const response = await fetch(isEdit ? `/api/users/${id}` : '/api/users', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        await captureResponse(response);
        return;
      }

      router.push('/admin/users');
      router.refresh();
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create/Edit User</h1>

      <FormBanner message={formError} fieldErrors={fieldErrors} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
                {...fieldProps('name')}
              />
              <FieldError name="name" errors={fieldErrors} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
                {...fieldProps('email')}
              />
              <FieldError name="email" errors={fieldErrors} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                {...fieldProps('role')}
              >
                <option value="contributor">Contributor</option>
                <option value="author">Author</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <FieldError name="role" errors={fieldErrors} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded"
                {...fieldProps('isActive')}
              />
              <FieldError name="isActive" errors={fieldErrors} />
              <label className="text-sm font-semibold text-gray-900">
                Active User
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Saving...' : 'Save User'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
