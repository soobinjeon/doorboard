'use client';

import { useState } from 'react';
import { Send, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BookingModal.module.css';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentName: name, content }),
            });

            if (res.ok) {
                setSubmitted(true);
                setName('');
                setContent('');
                setTimeout(() => {
                    setSubmitted(false);
                    onClose();
                }, 2000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className={styles.closeButton}>
                            <X size={24} />
                        </button>

                        <h2 className={styles.title}>
                            <Send size={24} color="#3b82f6" />
                            메시지 남기기
                        </h2>

                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={styles.successMessage}
                            >
                                <CheckCircle size={64} style={{ margin: '0 auto 1rem' }} />
                                <p>전송되었습니다!</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.field}>
                                    <label htmlFor="name" className={styles.label}>이름 (Name)</label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={styles.input}
                                        placeholder="홍길동"
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="content" className={styles.label}>내용 (Content)</label>
                                    <textarea
                                        id="content"
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={4}
                                        className={styles.textarea}
                                        placeholder="상담 요청합니다..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={styles.submitButton}
                                >
                                    {isSubmitting ? '전송 중...' : '전송하기 (Send)'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
