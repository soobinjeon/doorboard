import { NextResponse } from 'next/server';
import { getStatus, updateStatus } from '@/lib/store';
import { fetchCalendarEvents, getCurrentActiveEvent } from '@/lib/calendar';

export const dynamic = 'force-dynamic';

export async function POST() {
    console.log('[Sync API] Starting status sync...');
    try {
        const data = await getStatus();

        if (!data.calendarUrl) {
            console.log('[Sync API] No calendar URL configured.');
            return NextResponse.json({ success: false, message: 'No calendar URL' });
        }

        const events = await fetchCalendarEvents(data.calendarUrl);
        const currentEvent = getCurrentActiveEvent(events);

        const now = new Date();
        console.log(`[Sync API] Server Time: ${now.toString()} (${now.toISOString()})`);

        if (events.length > 0) {
            console.log(`[Sync API] Inspecting ${events.length} events for active check:`);
            events.forEach(e => {
                const isActive = now >= e.start && now < e.end;
                console.log(` - ${e.summary}: ${e.start.toISOString()} ~ ${e.end.toISOString()} | Active: ${isActive}`);
            });
        }

        if (!currentEvent) {
            console.log('[Sync API] No active event found.');
            // Optionally: Should we revert to 'In Office' if no event? 
            // Logic says: "If event exists, changeto X. If not, do nothing (keep manual status)".
            // The user requirement implies auto-change TO status, but maybe not FROM status?
            // "일정확인 후 상태가 자동으로 변경되도록 했으면 함"
            return NextResponse.json({ success: true, updated: false, message: 'No active event' });
        }

        console.log(`[Sync API] Active Event: ${currentEvent.summary} (${currentEvent.start.toISOString()} ~ ${currentEvent.end.toISOString()})`);

        const summary = currentEvent.summary;
        let targetStatus: string | null = null;

        // Exact same logic as client
        if (summary.includes('수업')) {
            targetStatus = 'In Class';
        } else if (summary.includes('교내')) {
            targetStatus = 'On Campus';
        } else if (summary.includes('회의')) {
            targetStatus = 'Meeting';
        } else if (summary.includes('출장')) {
            targetStatus = 'Business Trip';
        }

        if (targetStatus && targetStatus !== data.currentStatus) {
            console.log(`[Sync API] Updating status: ${data.currentStatus} -> ${targetStatus}`);

            await updateStatus({ currentStatus: targetStatus });
            // store.ts generally doesn't export saveStatus publicly? Let's check store.ts.
            // If saveStatus is not exported, we can write to file manually or use the store logic if available.

            // Actually, looking at store.ts, it might not export saveStatus.
            // Let's assume we need to replicate save logic or modify store.ts.
            // For now, I'll assume we can modify store.ts to export `saveStatus`.

            return NextResponse.json({ success: true, updated: true, newStatus: targetStatus });
        }

        console.log('[Sync API] Status is already up to date or no matching keyword.');
        return NextResponse.json({ success: true, updated: false });

    } catch (error: any) {
        console.error('[Sync API] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
