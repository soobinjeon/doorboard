import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/store';
import { fetchCalendarEvents } from '@/lib/calendar';

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log('[Calendar API] Request received');
    try {
        const status = await getStatus();
        console.log('[Calendar API] URL:', status.calendarUrl);

        const events = await fetchCalendarEvents(status.calendarUrl || '');

        console.log(`[Calendar API] Returning ${events.length} events`);
        events.forEach(e => console.log(` - ${e.summary} (${e.start.toISOString()} ~ ${e.end.toISOString()})`));

        return NextResponse.json({ events });

    } catch (error: any) {
        console.error('[Calendar API] Critical Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

