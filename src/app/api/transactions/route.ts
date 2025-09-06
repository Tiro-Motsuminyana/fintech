import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verify } from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number };
    const userId = decoded.userId;

    const stmt = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC');
    const transactions = stmt.all(userId);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
      const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number };
      const userId = decoded.userId;
  
      const { id, flagged, status } = await req.json();
  
      if (typeof flagged !== 'undefined') {
        const stmt = db.prepare('UPDATE transactions SET flagged = ? WHERE id = ? AND user_id = ?');
        stmt.run(flagged ? 1 : 0, id, userId);
      }
  
      if (typeof status !== 'undefined') {
        const stmt = db.prepare('UPDATE transactions SET status = ? WHERE id = ? AND user_id = ?');
        stmt.run(status, id, userId);
      }
  
      return NextResponse.json({ message: 'Transaction updated' });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
    }
  }