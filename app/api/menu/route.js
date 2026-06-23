import { NextResponse } from 'next/server';
import { getCategories, setCategories, validateSession } from '../../../lib/store';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

// Update entire categories array (for reordering, bulk updates)
export async function PUT(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const data = await request.json();
    if (Array.isArray(data)) {
      await setCategories(data);
      return NextResponse.json({ success: true });
    }

    
    // If updating a single category's items
    if (data.categoryId && data.items !== undefined) {
      const categories = await getCategories();
      const catIndex = categories.findIndex(c => c.id === data.categoryId);
      if (catIndex === -1) return NextResponse.json({ error: 'Kategori bulunamadÄ±' }, { status: 404 });
      categories[catIndex].items = data.items;
      await setCategories(categories);
      return NextResponse.json(categories[catIndex]);
    }
    
    // If updating a single item within a category
    if (data.categoryId && data.item) {
      const categories = await getCategories();
      const catIndex = categories.findIndex(c => c.id === data.categoryId);
      if (catIndex === -1) return NextResponse.json({ error: 'Kategori bulunamadÄ±' }, { status: 404 });
      
      const itemIndex = categories[catIndex].items.findIndex(i => i.id === data.item.id);
      if (itemIndex === -1) {
        // Add new item
        categories[catIndex].items.push(data.item);
      } else {
        // Update existing item
        categories[catIndex].items[itemIndex] = data.item;
      }
      await setCategories(categories);
      return NextResponse.json(categories[catIndex]);
    }
    
    return NextResponse.json({ error: 'GeÃ§ersiz istek' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const data = await request.json();
    const categories = await getCategories();
    
    // Add item to category
    if (data.categoryId && data.item) {
      const catIndex = categories.findIndex(c => c.id === data.categoryId);
      if (catIndex === -1) return NextResponse.json({ error: 'Kategori bulunamadÄ±' }, { status: 404 });
      data.item.id = data.item.id || (data.categoryId + '_' + Date.now());
      categories[catIndex].items.push(data.item);
      await setCategories(categories);
      return NextResponse.json(data.item);
    }
    
    return NextResponse.json({ error: 'GeÃ§ersiz istek' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const { categoryId, itemId } = await request.json();
    const categories = await getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) return NextResponse.json({ error: 'Kategori bulunamadÄ±' }, { status: 404 });
    
    categories[catIndex].items = categories[catIndex].items.filter(i => i.id !== itemId);
    await setCategories(categories);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

