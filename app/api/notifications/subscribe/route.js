import { NextResponse } from 'next/server';
import { getOrders, setOrders } from '../../../../lib/store';

export async function POST(request) {
  try {
    const { subscription, orderId } = await request.json();
    
    if (!subscription || !orderId) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }
    
    // Siparişi bul ve aboneliği ona bağla
    const orders = await getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }
    
    orders[index].pushSubscription = subscription;
    await setOrders(orders);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Abonelik kaydedilemedi' }, { status: 500 });
  }
}
