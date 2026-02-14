import { NextResponse } from 'next/server';
// @ts-ignore
import { addMessage } from '@/lib/store';

export async function POST(request: Request) {
    const body = await request.json();
    const { studentName, content } = body;

    if (!studentName || !content) {
        return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const newMessage = await addMessage({ studentName, content });
    return NextResponse.json(newMessage);
}
