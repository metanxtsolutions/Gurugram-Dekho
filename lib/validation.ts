import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Request-body validation for the write endpoints.
 *
 * Handlers previously passed the parsed JSON straight to Prisma, so a bad
 * payload surfaced as a 500 from the database rather than a 400 naming the
 * offending field. `parseBody` returns either typed data or a ready response:
 *
 *   const body = await parseBody(request, ArticleCreateSchema);
 *   if ('error' in body) return body.error;
 */

const slug = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only');

const id = z.string().trim().min(1);

/** Treat '' from an unfilled form input as "not provided". */
const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v));

const optionalUrl = z
  .union([z.url('Must be a valid URL'), z.literal('')])
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

const optionalEmail = z
  .union([z.email('Must be a valid email address'), z.literal('')])
  .optional()
  .nullable()
  .transform((v) => (v ? v : null));

/** Number that may arrive as a string from a form post. */
const numeric = (min: number, max: number) =>
  z.coerce.number().min(min).max(max);

const STATUSES = ['draft', 'published', 'archived'] as const;
const PRICE_RANGES = ['₹', '₹₹', '₹₹₹', '₹₹₹₹'] as const;

const seoFields = {
  seoTitle: optionalText(200),
  seoDescription: optionalText(320),
  seoKeywords: optionalText(300),
};

/* ── Article ─────────────────────────────────────────────── */

/*
 * Field shapes carry NO `.default()`. Zod's `.partial()` keeps defaults, so a
 * PATCH that omitted `status` would have had 'draft' injected and silently
 * unpublished the article. Defaults belong to the create schemas only.
 */
const articleFields = {
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  slug,
  content: optionalText(200_000),
  excerpt: optionalText(600),
  featuredImageId: id.nullable(),
  status: z.enum(STATUSES),
  featured: z.boolean(),
  readMins: z.coerce.number().int().min(1).max(120).nullable(),
  canonicalUrl: optionalUrl,
  categoryId: id.nullable(),
  areaIds: z.array(id).max(20),
  ...seoFields,
};

export const ArticleCreateSchema = z.object(articleFields).partial().extend({
  title: articleFields.title,
  slug,
  status: z.enum(STATUSES).default('draft'),
  featured: z.boolean().default(false),
});

export const ArticleUpdateSchema = z.object(articleFields).partial();

/* ── Place ───────────────────────────────────────────────── */

const placeFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(160),
  slug,
  description: optionalText(2000),
  placeType: z.string().trim().min(2).max(40),
  areaId: id,
  address: optionalText(300),
  latitude: numeric(-90, 90).nullable(),
  longitude: numeric(-180, 180).nullable(),
  phone: optionalText(40),
  website: optionalUrl,
  email: optionalEmail,
  hours: optionalText(200),
  cuisine: optionalText(120),
  specialties: optionalText(400),
  priceRange: z.enum(PRICE_RANGES),
  rating: numeric(0, 5),
  featured: z.boolean(),
  status: z.enum(STATUSES),
  imageId: id.nullable(),
  ...seoFields,
};

export const PlaceCreateSchema = z.object(placeFields).partial().extend({
  name: placeFields.name,
  slug,
  placeType: placeFields.placeType,
  areaId: id,
  priceRange: z.enum(PRICE_RANGES).default('₹₹'),
  rating: numeric(0, 5).default(0),
  featured: z.boolean().default(false),
  status: z.enum(STATUSES).default('draft'),
});

export const PlaceUpdateSchema = z.object(placeFields).partial();

/* ── Area ────────────────────────────────────────────────── */

const areaFields = {
  name: z.string().trim().min(2).max(120),
  slug,
  description: optionalText(2000),
  tagline: optionalText(160),
  type: z.string().trim().min(2).max(40),
  order: z.coerce.number().int().min(0).max(9999),
  parentId: id.nullable(),
  latitude: numeric(-90, 90).nullable(),
  longitude: numeric(-180, 180).nullable(),
  imageId: id.nullable(),
  isActive: z.boolean(),
  ...seoFields,
};

export const AreaCreateSchema = z.object(areaFields).partial().extend({
  name: areaFields.name,
  slug,
  type: z.string().trim().min(2).max(40).default('area'),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const AreaUpdateSchema = z.object(areaFields).partial();

/* ── Category ────────────────────────────────────────────── */

const categoryFields = {
  name: z.string().trim().min(2).max(120),
  slug,
  description: optionalText(1000),
  icon: optionalText(60),
  order: z.coerce.number().int().min(0).max(9999),
  parentId: id.nullable(),
  isActive: z.boolean(),
  ...seoFields,
};

export const CategoryCreateSchema = z.object(categoryFields).partial().extend({
  name: categoryFields.name,
  slug,
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const CategoryUpdateSchema = z.object(categoryFields).partial();

/* ── User (admin management) ─────────────────────────────── */

const ROLES = ['admin', 'editor', 'author', 'contributor'] as const;

const userFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.email('Must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  role: z.enum(ROLES),
  isActive: z.boolean(),
  bio: optionalText(600),
};

export const UserCreateSchema = z.object(userFields).partial().extend({
  name: userFields.name,
  email: userFields.email,
  password: userFields.password,
  role: z.enum(ROLES).default('contributor'),
  isActive: z.boolean().default(true),
});

export const UserUpdateSchema = z.object(userFields).partial();

/* ── Site settings ───────────────────────────────────────── */

export const SettingsSchema = z.object({
  siteTitle: z.string().trim().min(2, 'Site title is required').max(80),
  siteTagline: z.string().trim().max(120).optional().default(''),
  siteDescription: z.string().trim().max(500).optional().default(''),
  defaultMetaDescription: z.string().trim().max(320).optional().default(''),
  contactEmail: z
    .union([z.email('Must be a valid email address'), z.literal('')])
    .optional()
    .default(''),
  googleAnalyticsId: z
    .union([
      z.string().regex(/^(G-[A-Z0-9]{4,}|UA-\d{4,}-\d+)$/, 'Use a G-XXXXXXX or UA-XXXXX-Y ID'),
      z.literal(''),
    ])
    .optional()
    .default(''),
  searchConsoleVerification: z.string().trim().max(200).optional().default(''),
});

/* ── Signup ──────────────────────────────────────────────── */

export const SignupSchema = z.object({
  name: userFields.name,
  email: userFields.email,
  password: userFields.password,
});

/* ── Runner ──────────────────────────────────────────────── */

export type Parsed<T> = { data: T } | { error: NextResponse };

export async function parseBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<Parsed<z.infer<T>>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { error: badRequest('Request body must be valid JSON') };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const fields: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      (fields[key] ??= []).push(issue.message);
    }
    return {
      error: NextResponse.json(
        { success: false, error: 'Validation failed', fields },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}

export function badRequest(message: string, fields?: Record<string, string[]>) {
  return NextResponse.json({ success: false, error: message, ...(fields && { fields }) }, { status: 400 });
}

/**
 * Foreign keys pass schema validation but can still not exist, which Prisma
 * reports as an opaque 500. Check them up front and name the bad field.
 */
export async function assertExists(
  checks: { field: string; ids: string[]; count: (ids: string[]) => Promise<number>; label: string }[]
): Promise<NextResponse | null> {
  for (const check of checks) {
    const ids = [...new Set(check.ids.filter(Boolean))];
    if (ids.length === 0) continue;

    const found = await check.count(ids);
    if (found !== ids.length) {
      return badRequest(`Unknown ${check.label}`, {
        [check.field]: [`One or more ${check.label} values do not exist`],
      });
    }
  }
  return null;
}
