'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ClockWidget.module.css';

export default function ClockWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Update every second
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');

    const dateString = time.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });

    return (
        <motion.div
            className={styles.clockContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            <div className={styles.timeWrapper}>
                <div className={styles.time}>
                    <AnimatedDigits value={hours} />
                    <span className={styles.colon}>:</span>
                    <AnimatedDigits value={minutes} />
                </div>
                <div className={styles.seconds}>
                    <AnimatedDigits value={seconds} />
                </div>
            </div>
            <div className={styles.date}>{dateString}</div>
        </motion.div>
    );
}

function AnimatedDigits({ value }: { value: string }) {
    // Split into individual characters to animate separately if needed, 
    // but animating the whole block is smoother for now
    return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
            <AnimatePresence mode='popLayout'>
                <motion.span
                    key={value}
                    initial={{ y: 20, opacity: 0, filter: 'blur(5px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -20, opacity: 0, filter: 'blur(5px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}
