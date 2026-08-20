'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FieldError, FormBanner, useFormErrors } from '@/components/admin/form';

export default function EditAreaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id) && id !== 'create';

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'sector',
    latitude: '',
    longitude: '',
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
        const res = await fetch(`/api/areas/${id}`);
        const json = await res.json();
        if (!res.ok || !json.data) return;
        const r = json.data;
        setFormData((prev) => ({
          ...prev,
          name: r.name ?? '',
          slug: r.slug ?? '',
          description: r.description ?? '',
          type: r.type ?? 'sector',
          latitude: r.latitude != null ? String(r.latitude) : '',
          longitude: r.longitude != null ? String(r.longitude) : '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    clearField(name);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setLoading(true);

    try {
      const response = await fetch(isEdit ? `/api/areas/${id}` : '/api/areas', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      if (!response.ok) {
        await captureResponse(response);
        return;
      }

      router.push('/admin/areas');
      router.refresh();
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create/Edit Area</h1>

      <FormBanner message={formError} fieldErrors={fieldErrors} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Area Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Area Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Sector 29"
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
                  placeholder="sector-29"
                  required
                  {...fieldProps('slug')}
                />
                <FieldError name="slug" errors={fieldErrors} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                {...fieldProps('type')}
              >
                <option value="sector">Sector</option>
                <option value="area">Area</option>
                <option value="neighborhood">Neighborhood</option>
                <option value="zone">Zone</option>
              </select>
              <FieldError name="type" errors={fieldErrors} />
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
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Location (Optional)</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.0001"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="28.4595"
                {...fieldProps('latitude')}
              />
              <FieldError name="latitude" errors={fieldErrors} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.0001"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="77.0580"
                {...fieldProps('longitude')}
              />
              <FieldError name="longitude" errors={fieldErrors} />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Settings</h2>

          <div className="space-y-4">
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
              <p className="text-sm text-gray-600 mt-1">{formData.seoTitle.length}/60</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Meta Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                maxLength={160}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                {...fieldProps('seoDescription')}
              />
              <FieldError name="seoDescription" errors={fieldErrors} />
              <p className="text-sm text-gray-600 mt-1">{formData.seoDescription.length}/160</p>
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

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Saving...' : 'Save Area'}
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
