import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verify } from 'jsonwebtoken';
import Papa from 'papaparse';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: number };
    const userId = decoded.userId;

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const fileContent = await file.text();

    const insert = db.prepare('INSERT INTO transactions (user_id, date, description, amount) VALUES (?, ?, ?, ?)');

    const insertMany = db.transaction((transactions) => {
        for (const t of transactions) {
            insert.run(userId, t.date, t.description, t.amount);
        }
    });

    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const transactionsToInsert = results.data.map((row: any) => ({
            date: row.Date,
            description: row.Description,
            amount: parseFloat(row.Amount)
        }));
        insertMany(transactionsToInsert);
      },
      error: (error: any) => {
        console.error('CSV parsing error:', error);
        // This part of the code runs asynchronously, so we can't return a response from here.
        // Error handling for parsing should be improved if this were a production app.
      }
    });

    return NextResponse.json({ message: 'File upload processing started.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}