import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { validateSession } from '../../../lib/store';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = Date.now() + '-' + file.name.replace(/\s/g, '_');
    
    // Ensure public/images directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'images');
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Save file
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ url: `/images/${filename}` });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Yükleme sırasında hata oluştu' }, { status: 500 });
  }
}
