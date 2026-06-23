export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getBanners, setBanners } from '../../../lib/store';
import { validateSession } from '../../../lib/store';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function GET() {
  try {
    const banners = await getBanners();
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  
  try {
    const banner = await request.json();
    banner.id = 'banner_' + Date.now();
    const banners = await getBanners();
    banners.push(banner);
    await setBanners(banners);
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const data = await request.json();
    if (Array.isArray(data)) {
      await setBanners(data);
      return NextResponse.json({ success: true });
    }
    const updatedBanner = data;
    const banners = await getBanners();
    const index = banners.findIndex(b => b.id === updatedBanner.id);
    if (index === -1) return NextResponse.json({ error: 'Banner bulunamadÄ±' }, { status: 404 });
    banners[index] = updatedBanner;
    await setBanners(banners);
    return NextResponse.json(updatedBanner);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    let banners = await getBanners();
    banners = banners.filter(b => b.id !== id);
    await setBanners(banners);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

