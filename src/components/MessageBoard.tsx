'use client';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import styles from './MessageBoard.module.css';

export default function MessageBoard({ message }: { message: string }) {
    if (!message) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
        >
            <div className={styles.iconWrapper}>
                <Bell size={24} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>
                    공지사항 (Notice)
                </h3>
                <p className={styles.message}>{message}</p>
            </div>
        </motion.div>
    );
}
