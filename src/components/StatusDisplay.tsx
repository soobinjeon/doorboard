'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, School, Home, Briefcase, MapPin, Users } from 'lucide-react';
import styles from './StatusDisplay.module.css';

const statusConfig: Record<string, { icon: any, styleClass: string, textClass: string, text: string }> = {
    'In Office': { icon: User, styleClass: styles.inOffice, textClass: styles.textInOffice, text: '재실 (In Office)' },
    'In Class': { icon: BookOpen, styleClass: styles.inClass, textClass: styles.textInClass, text: '수업 중 (In Class)' },
    'On Campus': { icon: School, styleClass: styles.onCampus, textClass: styles.textOnCampus, text: '교내 (On Campus)' },
    'Off Campus': { icon: MapPin, styleClass: styles.offCampus, textClass: styles.textOffCampus, text: '교외 (Off Campus)' },
    'Left for Day': { icon: Home, styleClass: styles.leftForDay, textClass: styles.textLeftForDay, text: '퇴근 (Left for Day)' },
    'Business Trip': { icon: Briefcase, styleClass: styles.businessTrip, textClass: styles.textBusinessTrip, text: '출장 (Business Trip)' },
    'Meeting': { icon: Users, styleClass: styles.meeting, textClass: styles.textMeeting, text: '회의 중 (Meeting)' },
};

export default function StatusDisplay({ status, onDoubleClick }: { status: string, onDoubleClick?: () => void }) {
    const config = statusConfig[status] || statusConfig['In Office'];
    const Icon = config.icon;
    const [lastClick, setLastClick] = useState(0);

    const handleInteraction = () => {
        const now = Date.now();
        if (now - lastClick < 400) { // 400ms threshold
            console.log('[StatusDisplay] Manual double click detected!');
            onDoubleClick?.();
            setLastClick(0);
        } else {
            console.log('[StatusDisplay] Single click captured.');
            setLastClick(now);
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${styles.container} ${config.styleClass}`}
            onClick={handleInteraction}
            style={{ cursor: onDoubleClick ? 'pointer' : 'default' }}
            whileHover={onDoubleClick ? { scale: 1.02 } : {}}
            title="Double click to change status"
        >
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={styles.iconWrapper}
            >
                <Icon size={120} strokeWidth={1.5} className={config.textClass} />
            </motion.div>

            <motion.h1 className={`${styles.statusText} ${config.textClass}`}>
                {config.text}
            </motion.h1>

            <motion.div
                className={styles.decorativeCircle}
                animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
                style={{ top: '10%', left: '10%', backgroundColor: 'currentColor' }}
            />
            <motion.div
                className={styles.decorativeCircle}
                animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
                transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                style={{ bottom: '10%', right: '10%', backgroundColor: 'currentColor' }}
            />
        </motion.div>
    );
}
