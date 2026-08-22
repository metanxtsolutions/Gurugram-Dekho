import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { errorResponse } from '@/lib/utils';
import { badRequest, parseBody } from '@/lib/validation';
import { requireRole, EDITORS } from '@/lib/api-auth';
import { removeStoredFile } from '@/lib/storage';
import { revalidatePlace, revalidateArea } from '@/lib/revalidate';

type Context = { params: Promise<{ id: string }> };

const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  /** Approving may attach the photo to the subject straight away. */
  attach: z.boolean().optional().default(true),
  rejectionReason: z.string().trim().max(300).optional(),
});

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireRole(EDITORS);
    if ('error' in auth) return auth.error;

    const { id } = await context.params;

    const body = await parseBody(request, ReviewSchema);
    if ('error' in body) return body.error;
    const { action, attach, rejectionReason } = body.data;

    const submission = await prisma.photoSubmission.findUnique({
      where: { id },
      include: {
        place: { select: { id: true, slug: true, name: true, area: { select: { slug: true } } } },
        area: { select: { id: true, slug: true, name: true } },
      },
    });

    if (!submission) {
      return NextResponse.json(errorResponse('Submission not found'), { status: 404 });
    }
    if (submission.status !== 'pending') {
      return badRequest(`This submission was already ${submission.status}`);
    }

    if (action === 'reject') {
      // The file is of no further use, remove it rather than keeping a
      // stranger's photo on disk indefinitely.
      await removeStoredFile(submission.storageKey);

      await prisma.photoSubmission.update({
        where: { id },
        data: {
          status: 'rejected',
          reviewedAt: new Date(),
          reviewedById: auth.user.id,
          rejectionReason: rejectionReason ?? null,
        },
      });

      return NextResponse.json({ success: true, data: { status: 'rejected' } });
    }

    const subjectName = submission.place?.name ?? submission.area?.name ?? 'Gurugram';

    // A reader photo of a specific place genuinely depicts it, that is the
    // whole point of collecting them.
    const image = await prisma.image.create({
      data: {
        url: submission.url,
        alt: `${subjectName}, Gurugram`,
        width: submission.width,
        height: submission.height,
        source: 'community',
        license: 'permission',
        credit: submission.submitterName,
        permissionNote: `Reader submission ${submission.id}. Granted ${submission.grantedAt.toISOString()} by ${submission.submitterEmail}. Terms: ${submission.licenseGrant}`,
        depicts: 'exact',
        status: 'approved',
        verifiedAt: new Date(),
        verifiedById: auth.user.id,
      },
    });

    await prisma.photoSubmission.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedById: auth.user.id,
        imageId: image.id,
      },
    });

    if (attach) {
      if (submission.place) {
        await prisma.place.update({
          where: { id: submission.place.id },
          data: { imageId: image.id },
        });
        revalidatePlace(submission.place.slug, submission.place.area?.slug);
      } else if (submission.area) {
        await prisma.area.update({
          where: { id: submission.area.id },
          data: { imageId: image.id },
        });
        revalidateArea(submission.area.slug);
      }
    }

    return NextResponse.json({
      success: true,
      data: { status: 'approved', imageId: image.id, attached: attach },
    });
  } catch (error) {
    console.error('PATCH /api/submissions/[id] error:', error);
    return NextResponse.json(errorResponse('Could not review the submission'), { status: 500 });
  }
}
