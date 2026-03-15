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

        const todayICAL = ICAL.Time.fromJSDate(today, false);
        const endRangeICAL = ICAL.Time.fromJSDate(endRange, false);

        const events: CalendarEvent[] = [];

        vevents.forEach((vevent: any) => {
            const event = new ICAL.Event(vevent);

            // Calculate the duration of the event to apply to each occurrence
            const duration = event.duration;

            if (event.isRecurring()) {
                // Expand recurring events within the range
                const iterator = event.iterator();
                let next: any;

                while ((next = iterator.next())) {
                    const occurrenceStart = next.toJSDate();

                    // Stop if we've gone past the end of our range
                    if (occurrenceStart > endRange) break;

                    // Calculate occurrence end by adding the original duration
                    const occurrenceEndICAL = next.clone();
                    occurrenceEndICAL.addDuration(duration);
                    const occurrenceEnd = occurrenceEndICAL.toJSDate();

                    // Skip occurrences that have already ended before today
                    if (occurrenceEnd < today) continue;

                    // Check for EXDATE (exception dates where the event was cancelled)
                    try {
                        const details = event.getOccurrenceDetails(next);
                        if (!details || !details.item) continue;
                    } catch (e) {
                        // If getOccurrenceDetails fails, still include the occurrence
                    }

                    events.push({
                        summary: event.summary || 'No Title',
                        start: occurrenceStart,
                        end: occurrenceEnd,
                        location: event.location || '',
                        description: event.description || '',
                        allDay: event.startDate.isDate
                    });
                }
            } else {
                // Non-recurring event: use original logic
                const startDate = event.startDate.toJSDate();
                const endDate = event.endDate.toJSDate();

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
