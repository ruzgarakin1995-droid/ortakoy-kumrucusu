import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getVapidKeys, setVapidKeys } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let keys = await getVapidKeys();
    
    // If we don't have keys generated yet, generate and save them
    if (!keys || !keys.publicKey || !keys.privateKey) {
      const generatedKeys = webpush.generateVAPIDKeys();
      keys = {
        publicKey: generatedKeys.publicKey,
        privateKey: generatedKeys.privateKey,
        subject: 'mailto:contact@ortakoykumrucusu.com'
      };
      await setVapidKeys(keys);
    }
    
    // Only return the public key to the client
    return NextResponse.json({ publicKey: keys.publicKey });
  } catch (error) {
    console.error('Error fetching VAPID keys:', error);
    return NextResponse.json({ error: 'Anahtarlar alınamadı' }, { status: 500 });
  }
}
