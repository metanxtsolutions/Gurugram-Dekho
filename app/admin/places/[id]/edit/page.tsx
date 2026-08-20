'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FieldError, FormBanner, useFormErrors } from '@/components/admin/form';

export default function EditPlacePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEdit = Boolean(id) && id !== 'create';

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    placeType: 'restaurant',
    areaId: '',
    address: '',
    phone: '',
    website: '',
    email: '',
    cuisine: '',
    priceRange: '',
    rating: 0,
    status: 'published',
  });

  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { formError, setFormError, fieldErrors, reset, captureResponse, clearField, fieldProps, inputClass } =
    useFormErrors();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/areas?parentOnly=true');
        const data = await res.json();
        setAreas(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/places/${id}`);
        const json = await res.json();
        if (!res.ok || !json.data) return;
        const r = json.data;
        setFormData((prev) => ({
          ...prev,
          name: r.name ?? '',
          slug: r.slug ?? '',
          description: r.description ?? '',
          placeType: r.placeType ?? 'restaurant',
          areaId: r.areaId ?? '',
          address: r.address ?? '',
          phone: r.phone ?? '',
          website: r.website ?? '',
          email: r.email ?? '',
          cuisine: r.cuisine ?? '',
          priceRange: r.priceRange ?? '',
          rating: r.rating ?? 0,
          status: r.status ?? 'published',
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
      const response = await fetch(isEdit ? `/api/places/${id}` : '/api/places', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        await captureResponse(response);
        return;
      }

      router.push('/admin/places');
      router.refresh();
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create/Edit Place</h1>

      <FormBanner message={formError} fieldErrors={fieldErrors} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Place Name
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Type
                </label>
                <select
                  name="placeType"
                  value={formData.placeType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  {...fieldProps('placeType')}
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="shop">Shop</option>
                  <option value="gym">Gym</option>
                  <option value="hotel">Hotel</option>
                  <option value="office">Office Space</option>
                </select>
                <FieldError name="placeType" errors={fieldErrors} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Area
                </label>
                <select
                  name="areaId"
                  value={formData.areaId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  {...fieldProps('areaId')}
                >
                  <option value="">Select an area</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
                <FieldError name="areaId" errors={fieldErrors} />
              </div>
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

        {/* Contact & Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact & Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
                {...fieldProps('address')}
              />
              <FieldError name="address" errors={fieldErrors} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  {...fieldProps('phone')}
                />
                <FieldError name="phone" errors={fieldErrors} />
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
                  {...fieldProps('email')}
                />
                <FieldError name="email" errors={fieldErrors} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  {...fieldProps('website')}
                />
                <FieldError name="website" errors={fieldErrors} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cuisine (Restaurants)
                </label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Italian, Indian"
                  {...fieldProps('cuisine')}
                />
                <FieldError name="cuisine" errors={fieldErrors} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Price Range
                </label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  {...fieldProps('priceRange')}
                >
                  <option value="">Select</option>
                  <option value="₹">₹</option>
                  <option value="₹₹">₹₹</option>
                  <option value="₹₹₹">₹₹₹</option>
                  <option value="₹₹₹₹">₹₹₹₹</option>
                </select>
                <FieldError name="priceRange" errors={fieldErrors} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2 border rounded-lg"
                  {...fieldProps('rating')}
                />
                <FieldError name="rating" errors={fieldErrors} />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Publication</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              {...fieldProps('status')}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
            </select>
            <FieldError name="status" errors={fieldErrors} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Saving...' : 'Save Place'}
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
