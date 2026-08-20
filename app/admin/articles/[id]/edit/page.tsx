'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FieldError, FormBanner, useFormErrors } from '@/components/admin/form';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    categoryId: '',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [readOnly, setReadOnly] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const [areaIds, setAreaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { formError, setFormError, fieldErrors, reset, captureResponse, clearField, fieldProps, inputClass } =
    useFormErrors();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const [catRes, areaRes] = await Promise.all([
          fetch('/api/categories?parentOnly=false'),
          fetch('/api/areas?parentOnly=true'),
        ]);
        const catData = await catRes.json();
        const areaData = await areaRes.json();
        setCategories(catData.data || []);
        setAreas(areaData.data || []);

        // Fetch article if editing
        if (id && id !== 'create') {
          const artRes = await fetch(`/api/articles/${id}`);
          const artData = await artRes.json();
          if (artData.canEdit === false) setReadOnly(true);
          if (artData.data) {
            setFormData({
              title: artData.data.title,
              slug: artData.data.slug,
              content: artData.data.content,
              excerpt: artData.data.excerpt || '',
              status: artData.data.status,
              seoTitle: artData.data.seoTitle || '',
              seoDescription: artData.data.seoDescription || '',
              seoKeywords: artData.data.seoKeywords || '',
              categoryId: artData.data.categories[0]?.categoryId || '',
            });
            setAreaIds(
              (artData.data.areas || []).map((a: any) => a.areaId ?? a.area?.id).filter(Boolean)
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    clearField(name);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleArea = (id: string) =>
    setAreaIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    reset();

    try {
      const method = id && id !== 'create' ? 'PATCH' : 'POST';
      const endpoint = id && id !== 'create' ? `/api/articles/${id}` : '/api/articles';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, areaIds }),
      });

      if (!response.ok) {
        await captureResponse(response);
        return;
      }

      router.push('/admin/articles');
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = id && id !== 'create' ? 'Edit Article' : 'Create Article';

  if (readOnly) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{formData.title || 'Article'}</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <p className="font-semibold">This article belongs to another author.</p>
          <p className="mt-1 text-sm">
            Ask an editor if it needs changing — you can only edit your own articles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/articles')}
          className="mt-6 px-5 py-2.5 rounded border hover:bg-gray-50"
        >
          Back to articles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>

      <FormBanner message={formError} fieldErrors={fieldErrors} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClass('title')}
            {...fieldProps('title')}
          />
          <FieldError name="title" errors={fieldErrors} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className={inputClass('slug')}
            {...fieldProps('slug')}
          />
          <FieldError name="slug" errors={fieldErrors} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            required
            className={inputClass('content')}
            {...fieldProps('content')}
          />
          <FieldError name="content" errors={fieldErrors} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className={inputClass('excerpt')}
            {...fieldProps('excerpt')}
          />
          <FieldError name="excerpt" errors={fieldErrors} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={inputClass('categoryId')}
            {...fieldProps('categoryId')}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <FieldError name="categoryId" errors={fieldErrors} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClass('status')}
            {...fieldProps('status')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <FieldError name="status" errors={fieldErrors} />
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-1">Areas covered</h3>
          <p className="text-sm text-gray-500 mb-4">
            Tag every area this guide covers — it decides which area pages list it.
          </p>
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => {
              const active = areaIds.includes(area.id);
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleArea(area.id)}
                  aria-pressed={active}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400'
                  }`}
                >
                  {area.name}
                </button>
              );
            })}
          </div>
          {areaIds.length > 0 && (
            <p className="mt-3 text-xs text-gray-500">{areaIds.length} selected</p>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">SEO Settings</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">SEO Title</label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              maxLength={60}
              className={inputClass('seoTitle')}
              {...fieldProps('seoTitle')}
            />
            <FieldError name="seoTitle" errors={fieldErrors} />
            <p className="text-xs text-gray-500 mt-1">{formData.seoTitle.length}/60</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">SEO Description</label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              maxLength={160}
              rows={2}
              className={inputClass('seoDescription')}
              {...fieldProps('seoDescription')}
            />
            <FieldError name="seoDescription" errors={fieldErrors} />
            <p className="text-xs text-gray-500 mt-1">{formData.seoDescription.length}/160</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">SEO Keywords</label>
            <input
              type="text"
              name="seoKeywords"
              value={formData.seoKeywords}
              onChange={handleChange}
              className={inputClass('seoKeywords')}
              {...fieldProps('seoKeywords')}
            />
            <FieldError name="seoKeywords" errors={fieldErrors} />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Article'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
