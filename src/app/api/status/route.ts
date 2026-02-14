import { NextResponse } from 'next/server';
// @ts-ignore
import { getStatus, updateStatus } from '@/lib/store';

export async function GET() {
    const data = await getStatus();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const updated = await updateStatus(body);
    return NextResponse.json(updated);
}
