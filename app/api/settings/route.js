export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSettings, setSettings, validateSession } from '../../../lib/store';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar okunamadı' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const data = await request.json();
    await setSettings(data);
    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar kaydedilemedi' }, { status: 500 });
  }
}
