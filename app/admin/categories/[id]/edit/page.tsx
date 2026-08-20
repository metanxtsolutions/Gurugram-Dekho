'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FieldError, FormBanner, useFormErrors } from '@/components/admin/form';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id) && id !== 'create';

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const [loading, setLoading] = useState(false);
  const { formError, setFormError, fieldErrors, reset, captureResponse, clearField, fieldProps, inputClass } =
    useFormErrors();


  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`);
        const json = await res.json();
        if (!res.ok || !json.data) return;
        const r = json.data;
        setFormData((prev) => ({
          ...prev,
          name: r.name ?? '',
          slug: r.slug ?? '',
          description: r.description ?? '',
          seoTitle: r.seoTitle ?? '',
          seoDescription: r.seoDescription ?? '',
          seoKeywords: r.seoKeywords ?? '',
        }));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    clearField(name);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);

    try {
      const response = await fetch(isEdit ? `/api/categories/${id}` : '/api/categories', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        await captureResponse(response);
        return;
      }

      router.push('/admin/categories');
      router.refresh();
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create/Edit Category</h1>

      <FormBanner message={formError} fieldErrors={fieldErrors} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category Name
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
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
                {...fieldProps('slug')}
              />
              <FieldError name="slug" errors={fieldErrors} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
                {...fieldProps('description')}
              />
              <FieldError name="description" errors={fieldErrors} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                maxLength={60}
                className="w-full px-4 py-2 border rounded-lg"
                {...fieldProps('seoTitle')}
              />
              <FieldError name="seoTitle" errors={fieldErrors} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Meta Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                {...fieldProps('seoDescription')}
              />
              <FieldError name="seoDescription" errors={fieldErrors} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Keywords
              </label>
              <input
                type="text"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                {...fieldProps('seoKeywords')}
              />
              <FieldError name="seoKeywords" errors={fieldErrors} />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Saving...' : 'Save Category'}
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
