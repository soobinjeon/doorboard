'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import styles from './ScheduleWidget.module.css';

interface Event {
    summary: string;
    start: string;
    end: string;
    location?: string;
    allDay?: boolean;
}

export default function ScheduleWidget() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/calendar', { cache: 'no-store' });
            const data = await res.json();
            setEvents(data.events || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 60000 * 5); // Refresh every 5 mins
        return () => clearInterval(interval);
    }, []);

    const isToday = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className={styles.header}>
                <Calendar size={24} className={styles.icon} />
                <h2 className={styles.title}>예정된 일정 (Upcoming)</h2>
            </div>

            <div className={styles.eventList}>
                {loading ? (
                    <div className={styles.loading}>Loading schedule...</div>
                ) : events.length === 0 ? (
                    <div className={styles.empty}>
                        <p>예정된 일정이 없습니다.</p>
                        <span className={styles.emptySub}>No upcoming events</span>
                    </div>
                ) : (
                    <AnimatePresence>
                        {events.map((event, idx) => (
                            <motion.div
                                key={idx}
                                className={styles.eventItem}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className={styles.timeBox}>
                                    {event.allDay ? (
                                        <span className={styles.allDay}>All Day</span>
                                    ) : (
                                        <>
                                            {!isToday(event.start) && (
                                                <span className={styles.date}>{new Date(event.start).getMonth() + 1}/{new Date(event.start).getDate()}</span>
                                            )}
                                            <span className={styles.startTime}>{formatTime(event.start)}</span>
                                            <span className={styles.endTime}>{formatTime(event.end)}</span>
                                        </>
                                    )}
                                </div>
                                <div className={styles.details}>
                                    <div className={styles.summary}>{event.summary}</div>
                                    {event.location && <div className={styles.location}>{event.location}</div>}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
