import { NextResponse } from 'next/server';
import { getReminders, setReminders } from '../../../lib/store';

export async function GET() {
  try {
    const reminders = await getReminders();
    return NextResponse.json(reminders);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const reminders = await getReminders();
    
    const newReminder = {
      id: 'rem_' + Date.now(),
      title: data.title || '',
      amount: data.amount || 0,
      dueDate: data.dueDate || new Date().toISOString(),
      reminderAdvance: data.reminderAdvance || '1d', // 1h, 1d, 1w, 10d
      reminderFrequency: data.reminderFrequency || 'daily', // once, hourly, daily
      isPaid: false,
      lastRemindedAt: null,
      createdAt: new Date().toISOString()
    };
    
    reminders.push(newReminder);
    await setReminders(reminders);
    
    return NextResponse.json({ success: true, reminder: newReminder });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const reminders = await getReminders();
    
    const index = reminders.findIndex(r => r.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Hatırlatıcı bulunamadı' }, { status: 404 });
    }
    
    reminders[index] = { ...reminders[index], ...data };
    await setReminders(reminders);
    
    return NextResponse.json({ success: true, reminder: reminders[index] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const reminders = await getReminders();
    
    const newReminders = reminders.filter(r => r.id !== id);
    await setReminders(newReminders);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
