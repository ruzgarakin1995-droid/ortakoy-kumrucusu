import { NextResponse } from 'next/server';
import { getWaiterRequests, setWaiterRequests, validateSession } from '../../../lib/store';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const isAuthed = await validateSession(token);

    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await getWaiterRequests();
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tableNo, reason } = body;
    
    if (!tableNo) {
      return NextResponse.json({ error: 'Masa numarası gerekli' }, { status: 400 });
    }

    const newRequest = {
      id: 'wr_' + Date.now(),
      tableNo: tableNo.toString(),
      reason: reason || 'Diğer',
      status: 'pending', // pending, completed, cancelled
      createdAt: new Date().toISOString()
    };

    const requests = await getWaiterRequests();
    requests.push(newRequest);
    await setWaiterRequests(requests);

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    const isAuthed = await validateSession(token);

    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    const requests = await getWaiterRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
    }

    requests[index].status = status;
    requests[index].completedAt = new Date().toISOString();
    await setWaiterRequests(requests);

    return NextResponse.json({ success: true, request: requests[index] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
