import { NextResponse } from 'next/server';
import { getExpenses, setExpenses, validateSession } from '../../../lib/store';

export const dynamic = 'force-dynamic';

async function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return await validateSession(token);
}

export async function GET(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const expenses = await getExpenses();
  return NextResponse.json(expenses);
}

export async function POST(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const expense = await request.json();
    const newExpense = {
      id: 'exp_' + Date.now().toString(36),
      ...expense,
      date: new Date().toISOString()
    };
    const expenses = await getExpenses();
    expenses.push(newExpense);
    await setExpenses(expenses);
    return NextResponse.json(newExpense);
  } catch (error) {
    return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
  }
}

export async function PUT(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const expense = await request.json();
    const expenses = await getExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index === -1) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });
    expenses[index] = { ...expenses[index], ...expense };
    await setExpenses(expenses);
    return NextResponse.json(expenses[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth(request))) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  try {
    const { id } = await request.json();
    let expenses = await getExpenses();
    expenses = expenses.filter(e => e.id !== id);
    await setExpenses(expenses);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
  }
}
