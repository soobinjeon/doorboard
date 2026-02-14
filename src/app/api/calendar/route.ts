
import { NextResponse } from 'next/server';
import { getStatus } from '@/lib/store';
import ICAL from 'ical.js';

export async function GET() {
    console.log('[Calendar API] Request received (using ical.js)');
    try {
        const status = await getStatus();
        const calendarUrl = status.calendarUrl;
        console.log('[Calendar API] URL:', calendarUrl);

        if (!calendarUrl) {
            return NextResponse.json({ events: [] });
        }

        // Fetch the iCal data
        const res = await fetch(calendarUrl);
        if (!res.ok) {
            throw new Error(`Failed to fetch calendar: ${res.status} ${res.statusText} `);
        }
        const text = await res.text();

        // Parse iCal using ical.js
        let events: any[] = [];
        try {
            const jcalData = ICAL.parse(text);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endRange = new Date(today);
            endRange.setDate(endRange.getDate() + 30);

            vevents.forEach((vevent) => {
                const event = new ICAL.Event(vevent);

                // Handle dates properly (ICAL.Time object to JS Date)
                const startDate = event.startDate.toJSDate();
                const endDate = event.endDate.toJSDate();

                if (startDate >= today && startDate < endRange) {
                    events.push({
                        summary: event.summary || 'No Title',
                        start: startDate.toISOString(),
                        end: endDate.toISOString(),
                        location: event.location || '',
                        description: event.description || '',
                        allDay: event.startDate.isDate // ical.js flag for all-day
                    });
                }
            });

        } catch (parseError) {
            console.error('[Calendar API] Parse Error:', parseError);
            return NextResponse.json({ events: [], error: 'Failed to parse ICS file', details: String(parseError) }, { status: 500 });
        }

        // Sort by start time
        events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        return NextResponse.json({ events });

    } catch (error: any) {
        console.error('[Calendar API] Critical Error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

