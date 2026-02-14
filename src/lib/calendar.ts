import ICAL from 'ical.js';

export interface CalendarEvent {
    summary: string;
    start: Date;
    end: Date;
    location: string;
    description: string;
    allDay: boolean;
}

export async function fetchCalendarEvents(calendarUrl: string): Promise<CalendarEvent[]> {
    if (!calendarUrl) return [];

    try {
        const res = await fetch(calendarUrl);
        if (!res.ok) {
            console.error(`[Calendar Lib] Failed to fetch: ${res.status}`);
            return [];
        }
        const text = await res.text();

        const jcalData = ICAL.parse(text);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endRange = new Date(today);
        endRange.setDate(endRange.getDate() + 30); // Look ahead 30 days

        const events: CalendarEvent[] = [];

        vevents.forEach((vevent) => {
            const event = new ICAL.Event(vevent);
            const startDate = event.startDate.toJSDate();
            const endDate = event.endDate.toJSDate();

            // Simple filtering for active/upcoming
            // We include events that are active NOW, even if started before today
            // But for performance loop, checking today-ish is fine.
            // Actually for "Current Status", we need to catch events that started yesterday but are still going (rare for class, maybe trip)

            // Let's broaden start range slightly or just check if it overlaps 'now' if we were doing strict checking
            // But for general list, the existing logic is okay.

            if (endDate >= today && startDate < endRange) {
                events.push({
                    summary: event.summary || 'No Title',
                    start: startDate,
                    end: endDate,
                    location: event.location || '',
                    description: event.description || '',
                    allDay: event.startDate.isDate
                });
            }
        });

        events.sort((a, b) => a.start.getTime() - b.start.getTime());
        return events;

    } catch (error) {
        console.error('[Calendar Lib] Error:', error);
        return [];
    }
}

export function getCurrentActiveEvent(events: CalendarEvent[]): CalendarEvent | null {
    const now = new Date();
    // UTC handled by Date objects if created correctly from ICAL

    return events.find(event => now >= event.start && now < event.end) || null;
}
