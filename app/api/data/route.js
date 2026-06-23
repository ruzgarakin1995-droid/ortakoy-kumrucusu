import { NextResponse } from 'next/server';
import { getBanners, getFeatured, getCategories, getSettings } from '../../../lib/store';

export async function GET() {
  try {
    const [banners, featured, categories, settings] = await Promise.all([
      getBanners(),
      getFeatured(),
      getCategories(),
      getSettings()
    ]);
    
    return NextResponse.json({ banners, featured, categories, settings });
  } catch (error) {
    return NextResponse.json({ error: 'Veri yüklenemedi' }, { status: 500 });
  }
}
