import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { validateSession } from '../../../lib/store';

import { put } from '@vercel/blob';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!(await validateSession(token))) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file = data.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    const filename = Date.now() + '-' + file.name.replace(/\s/g, '_');
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, { access: 'public' });

    // Return the URL provided by Vercel Blob
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Yükleme sırasında hata oluştu' }, { status: 500 });
  }
}
