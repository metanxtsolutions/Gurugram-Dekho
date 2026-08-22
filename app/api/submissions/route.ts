import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { badRequest } from '@/lib/validation';
import { processUpload, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from '@/lib/image-processing';
import { getStorage } from '@/lib/storage';
import { rateLimit, clientKey } from '@/lib/rate-limit';

/**
 * Public photo submission. Unauthenticated by design, a reader should not
 * need an account to send in a photo, so everything lands as `pending` and
 * nothing reaches the site until an editor approves it.
 */

/** The exact wording a submitter agrees to. Stored verbatim on the record. */
export const LICENSE_GRANT_TEXT =
  'I took this photograph, or I own the rights to it, and I grant Gurugram Dekho ' +
  'a non-exclusive, royalty-free licence to publish it on the site with credit to me. ' +
  'I understand I can ask for it to be removed at any time.';

const MetaSchema = z
  .object({
    submitterName: z.string().trim().min(2, 'Tell us your name').max(120),
    submitterEmail: z.email('We need a valid email to credit you'),
    note: z.string().trim().max(500).optional().default(''),
    licenseAgreed: z
      .literal('true', { message: 'You must confirm you own the rights to this photo' }),
    placeId: z.string().trim().min(1).optional(),
    areaId: z.string().trim().min(1).optional(),
  })
  .refine((d) => Boolean(d.placeId) !== Boolean(d.areaId), {
    message: 'A submission must be for exactly one place or area',
    path: ['placeId'],
  });

export async function POST(request: NextRequest) {
  try {
    const limit = await rateLimit(clientKey(request, 'submission'), {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        errorResponse('Too many submissions from this address. Try again later.'),
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds),
            'RateLimit-Limit': String(limit.limit),
            'RateLimit-Remaining': '0',
            'RateLimit-Reset': String(limit.retryAfterSeconds),
          },
        }
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return badRequest('Send the photo as multipart form data');
    }

    const parsed = MetaSchema.safeParse({
      submitterName: form.get('submitterName') ?? '',
      submitterEmail: form.get('submitterEmail') ?? '',
      note: form.get('note') ?? '',
      licenseAgreed: form.get('licenseAgreed') ?? '',
      placeId: form.get('placeId') || undefined,
      areaId: form.get('areaId') || undefined,
    });

    if (!parsed.success) {
      const fields: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.') || '_';
        (fields[key] ??= []).push(issue.message);
      }
      return NextResponse.json(
        { success: false, error: 'Validation failed', fields },
        { status: 400 }
      );
    }

    const meta = parsed.data;

    const file = form.get('photo');
    if (!(file instanceof File)) {
      return badRequest('Attach a photo', { photo: ['Choose an image to upload'] });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return badRequest('That image is too large', {
        photo: [`Image must be ${MAX_UPLOAD_MB} MB or smaller`],
      });
    }

    // The subject must exist before anything is written to disk.
    const subject = meta.placeId
      ? await prisma.place.findUnique({
          where: { id: meta.placeId },
          select: { id: true, name: true },
        })
      : await prisma.area.findUnique({
          where: { id: meta.areaId! },
          select: { id: true, name: true },
        });

    if (!subject) {
      return badRequest('We could not find what this photo is of', {
        placeId: ['Unknown place or area'],
      });
    }

    const processed = await processUpload(Buffer.from(await file.arrayBuffer()));
    if (!processed.ok) {
      return badRequest(processed.error, { photo: [processed.error] });
    }

    const stored = await getStorage().save(
      processed.image.buffer,
      processed.image.ext,
      'submissions'
    );

    const submission = await prisma.photoSubmission.create({
      data: {
        placeId: meta.placeId ?? null,
        areaId: meta.areaId ?? null,
        storageKey: stored.key,
        url: stored.url,
        width: processed.image.width,
        height: processed.image.height,
        bytes: processed.image.bytes,
        submitterName: meta.submitterName,
        submitterEmail: meta.submitterEmail,
        note: meta.note || null,
        licenseGrant: LICENSE_GRANT_TEXT,
        status: 'pending',
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: submission.id,
          subject: subject.name,
          message: 'Thank you. An editor will review your photo before it appears.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/submissions error:', error);
    return NextResponse.json(errorResponse('Could not accept the photo'), { status: 500 });
  }
}
