import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as number;
    const { apiKey, apiSecret } = await req.json();

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ message: 'API Key and Secret are required' }, { status: 400 });
    }

    const encryptedApiKey = encrypt(apiKey);
    const encryptedApiSecret = encrypt(apiSecret);

    db.prepare('UPDATE users SET coinbase_api_key = ?, coinbase_api_secret = ? WHERE id = ?')
      .run(encryptedApiKey, encryptedApiSecret, userId);

    return NextResponse.json({ message: 'Coinbase API keys saved successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}