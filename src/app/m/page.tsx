'use client';

import { useState } from 'react';
import { Send, User, Phone, MessageSquare } from 'lucide-react';
import styles from './page.module.css';

export default function MobileMessagePage() {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [statusMsg, setStatusMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatus('sending');
        try {
            const res = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact, message }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setStatus('success');
                setName('');
                setContact('');
                setMessage('');
            } else {
                setStatus('error');
                setStatusMsg(data.error || 'Failed to send message.');
            }
        } catch (err) {
            setStatus('error');
            setStatusMsg('Network error. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <div className={styles.iconWrapper}>✅</div>
                    <h1 className={styles.title}>메시지 전송 완료!</h1>
                    <p className={styles.desc}>교수님께 메시지가 성공적으로 전달되었습니다.</p>
                    <button onClick={() => setStatus('idle')} className={styles.button}>
                        다른 메시지 보내기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>교수님께 메시지 남기기</h1>
                <p className={styles.desc}>Doorboard Mobile Messenger</p>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>
                        <User size={18} /> 이름 (Name)
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력하세요"
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>
                        <Phone size={18} /> 연락처 (Contact / Optional)
                    </label>
                    <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="이메일 또는 전화번호"
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>
                        <MessageSquare size={18} /> 메시지 (Message) <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="전달할 내용을 입력하세요..."
                        className={styles.textarea}
                        required
                        rows={5}
                    />
                </div>

                {status === 'error' && <p className={styles.errorMsg}>{statusMsg}</p>}

                <button type="submit" disabled={status === 'sending'} className={styles.button}>
                    {status === 'sending' ? '전송 중...' : (
                        <>
                            <Send size={18} /> 메시지 보내기
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
