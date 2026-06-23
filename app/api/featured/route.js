import { NextResponse } from 'next/server';
import { getFeatured, setFeatured, validateSession } from '../../../lib/store';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function GET() {
  try {
    const featured = await getFeatured();
    return NextResponse.json(featured);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const item = await request.json();
    item.id = 'featured_' + Date.now();
    const featured = await getFeatured();
    featured.push(item);
    await setFeatured(featured);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const data = await request.json();
    if (Array.isArray(data)) {
      await setFeatured(data);
      return NextResponse.json({ success: true });
    }
    const updated = data;
    const featured = await getFeatured();
    const index = featured.findIndex(f => f.id === updated.id);
    if (index === -1) return NextResponse.json({ error: 'BulunamadÄ±' }, { status: 404 });
    featured[index] = updated;
    await setFeatured(featured);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const { id } = await request.json();
    let featured = await getFeatured();
    featured = featured.filter(f => f.id !== id);
    await setFeatured(featured);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

