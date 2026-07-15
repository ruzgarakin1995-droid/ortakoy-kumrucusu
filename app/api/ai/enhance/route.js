export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSettings, validateSession } from '../../../../lib/store';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function POST(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  
  try {
    const settings = await getSettings();
    const apiKey = (settings?.ai?.geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Lütfen Vercel üzerinden GEMINI_API_KEY ortam değişkenini ekleyin veya İşletme Ayarlarından API Anahtarınızı girin. (Eğer ayarlarınız kaydedilmiyorsa, Vercel KV veritabanı projenize bağlı değildir).' }, { status: 400 });
    }

    const { text, ingredients } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Açıklama boş olamaz' }, { status: 400 });
    }

    const prompt = `Sen profesyonel bir metin yazarısın. Bir restoranın menüsündeki bir ürün için aşağıda verilen içeriği satış odaklı, iştah kabartan bir ürün açıklamasına dönüştür.

Kurallar:
1. Çok uzun yazma, en fazla 2-3 cümlelik kısa ve öz bir metin olsun.
2. Yazılan malzemelerin HİÇBİRİNİ çıkarma, hepsini tek tek açıkça belirt.
3. Sadece yazacağın yeni açıklamayı döndür. Başka hiçbir şey (not, başlık vb.) ekleme.

Orijinal İçerik: "${text}${ingredients && ingredients.length > 0 ? ', ' + ingredients.join(', ') : ''}"
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-pro'
    ];
    
    let resultText = null;
    let lastError = null;
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        if (response && response.text) {
          resultText = response.text();
          break; // Model success
        }
      } catch (err) {
        lastError = err;
        console.error(`Model ${modelName} failed:`, err.message);
      }
    }
    
    if (!resultText) {
       return NextResponse.json({ error: lastError ? lastError.message : 'Yapay zeka geçerli bir yanıt üretemedi (Tüm modeller denendi ve reddedildi).' }, { status: 500 });
    }

    return NextResponse.json({ result: resultText.trim() });
    
  } catch (error) {
    return NextResponse.json({ error: 'İşlem başarısız oldu: ' + error.message }, { status: 500 });
  }
}
