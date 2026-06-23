import { NextResponse } from 'next/server';
import { getCoupons, setCoupons, validateSession } from '../../../lib/store';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function GET(request) {
  // Public: validate a coupon code
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const cartTotal = parseFloat(searchParams.get('total') || '0');
  
  if (code) {
    const coupons = await getCoupons();
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.isActive);
    
    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'GeÃ§ersiz kupon kodu' });
    }
    
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Kupon kodunun sÃ¼resi dolmuÅŸ' });
    }
    
    if (coupon.maxUses > 0 && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Kupon kullanÄ±m limiti dolmuÅŸ' });
    }
    
    if (coupon.minCartAmount > 0 && cartTotal < coupon.minCartAmount) {
      return NextResponse.json({ valid: false, error: `Minimum sepet tutarÄ±: ${coupon.minCartAmount} â‚º` });
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(cartTotal * coupon.discountValue / 100);
    } else {
      discount = coupon.discountValue;
    }
    
    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount
      }
    });
  }
  
  // Admin: get all coupons
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  
  const coupons = await getCoupons();
  return NextResponse.json(coupons);
}

export async function POST(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const coupon = await request.json();
    coupon.id = 'coupon_' + Date.now();
    coupon.currentUses = 0;
    coupon.createdAt = new Date().toISOString();
    const coupons = await getCoupons();
    coupons.push(coupon);
    await setCoupons(coupons);
    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const data = await request.json();
    if (Array.isArray(data)) {
      await setCoupons(data);
      return NextResponse.json({ success: true });
    }
    const updated = data;
    const coupons = await getCoupons();
    const index = coupons.findIndex(c => c.id === updated.id);
    if (index === -1) return NextResponse.json({ error: 'BulunamadÄ±' }, { status: 404 });
    coupons[index] = { ...coupons[index], ...updated };
    await setCoupons(coupons);
    return NextResponse.json(coupons[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const { id } = await request.json();
    let coupons = await getCoupons();
    coupons = coupons.filter(c => c.id !== id);
    await setCoupons(coupons);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

