export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSettings } from '../../../lib/store';

export async function GET() {
  const envKeys = Object.keys(process.env).filter(k => k.includes('KV') || k.includes('UPSTASH') || k.includes('REDIS') || k.includes('STORAGE'));
  
  let kvStatus = 'unknown';
  let kvError = null;
  
  try {
    const { createClient } = await import('@vercel/kv');
    
    function getKVUrl() { return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.STORAGE_REST_API_URL || process.env.STORAGE_REDIS_REST_URL || Object.entries(process.env).find(([k]) => k.endsWith('_REST_URL') || k.endsWith('_REST_API_URL'))?.[1]; }
    function getKVToken() { return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.STORAGE_REST_API_TOKEN || process.env.STORAGE_REDIS_REST_TOKEN || Object.entries(process.env).find(([k]) => k.endsWith('_REST_TOKEN') || k.endsWith('_REST_API_TOKEN'))?.[1]; }
    
    const url = getKVUrl();
    const token = getKVToken();
    
    if (!url || !token) {
      kvStatus = 'missing_env';
    } else {
      const kv = createClient({ url, token });
      await kv.set('test_ping', 'pong');
      const ping = await kv.get('test_ping');
      kvStatus = ping === 'pong' ? 'connected' : 'failed_ping';
    }
  } catch (e) {
    kvStatus = 'error';
    kvError = e.message;
  }
  
  return NextResponse.json({
    envKeys,
    kvStatus,
    kvError
  });
}
