import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { errorResponse } from '@/lib/utils';
import { requireRole, ADMINS } from '@/lib/api-auth';
import { SettingsSchema, parseBody } from '@/lib/validation';
import { getRawSettings, saveSettings } from '@/lib/settings';

export async function GET() {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    return NextResponse.json({ success: true, data: await getRawSettings() });
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(errorResponse('Failed to load settings'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireRole(ADMINS);
    if ('error' in auth) return auth.error;

    const body = await parseBody(request, SettingsSchema);
    if ('error' in body) return body.error;

    await saveSettings(body.data, auth.user.id);

    // Settings feed the root layout's metadata, so every route is affected.
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: await getRawSettings() });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json(errorResponse('Failed to save settings'), { status: 500 });
  }
}
