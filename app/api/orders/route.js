import { NextResponse } from 'next/server';
import { getOrders, setOrders, getCoupons, setCoupons, validateSession } from '../../../lib/store';

export const dynamic = 'force-dynamic';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get('track');
  
  if (trackingId) {
    // Public: track order status
    const orders = await getOrders();
    const order = orders.find(o => o.id === trackingId);
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    return NextResponse.json({
      id: order.id,
      status: order.status,
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      items: order.items,
      total: order.total
    });
  }
  
  // Admin: get all orders
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request) {
  // Public: create new order
  try {
    const orderData = await request.json();
    const order = {
      id: 'ORD-' + Date.now().toString(36).toUpperCase(),
      ...orderData,
      status: 'received',
      statusHistory: [
        { status: 'received', timestamp: new Date().toISOString(), note: 'Sipariş alındı' }
      ],
      createdAt: new Date().toISOString(),
      isNew: true
    };
    
    // If coupon was used, increment usage
    if (orderData.couponCode) {
      const coupons = await getCoupons();
      const couponIndex = coupons.findIndex(c => c.code.toLowerCase() === orderData.couponCode.toLowerCase());
      if (couponIndex !== -1) {
        coupons[couponIndex].currentUses = (coupons[couponIndex].currentUses || 0) + 1;
        await setCoupons(coupons);
      }
    }
    
    const orders = await getOrders();
    orders.unshift(order); // Add to beginning
    await setOrders(orders);
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Sipariş oluşturulamadı' }, { status: 500 });
  }
}

export async function PUT(request) {
  // Admin: update order status
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const { orderId, status, note } = await request.json();
    const orders = await getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    
    orders[index].status = status;
    orders[index].isNew = false;
    orders[index].statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || getStatusNote(status)
    });
    
    await setOrders(orders);
    return NextResponse.json(orders[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}

function getStatusNote(status) {
  const notes = {
    received: 'Sipariş alındı',
    preparing: 'Sipariş hazırlanıyor',
    courier: 'Kuryeye teslim edildi',
    onway: 'Sipariş yola çıktı',
    delivered: 'Sipariş teslim edildi'
  };
  return notes[status] || '';
}

export async function DELETE(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const { orderId } = await request.json();
    let orders = await getOrders();
    orders = orders.filter(o => o.id !== orderId);
    await setOrders(orders);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Hata' }, { status: 500 });
  }
}
