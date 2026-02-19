'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ClockWidget.module.css';

export default function ClockWidget() {
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted) return null;

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
        <div className={styles.clockContainer}>
            <div className={styles.timeWrapper}>
                <div className={`${styles.time} ${styles.large}`}>
                    <DigitGroup value={hours} />
                    <span className={styles.colon}>:</span>
                    <DigitGroup value={minutes} />
                    {/* Optional: Seconds can be smaller or removed if we want super simple. 
                        User asked for "Simpler". Let's keep seconds but maybe smaller? 
                        The reference "Changelog" usually has seconds. 
                        I'll stick to HH:MM for big impact or HH:MM:SS depending on space.
                        Let's keep it consistent size for now.
                    */}
                    <span className={styles.colon}>:</span>
                    <DigitGroup value={seconds} />
                </div>
            </div>
            <div className={styles.date}>{dateString}</div>
        </div>
    );
}

function DigitGroup({ value }: { value: string }) {
    return (
        <div style={{ display: 'flex' }}>
            {value.split('').map((digit, i) => (
                <RollingDigit key={i} digit={digit} />
            ))}
        </div>
    );
}

function RollingDigit({ digit }: { digit: string }) {
    return (
        <div className={styles.digitColumn}>
            <AnimatePresence mode='popLayout'>
                <motion.div
                    key={digit}
                    className={styles.digit}
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                >
                    {digit}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
