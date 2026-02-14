'use client';

import { useState, useEffect } from 'react';
import { User, BookOpen, School, Home, Briefcase, Coffee, MapPin, Save, RefreshCw, Smile, CloudSun } from 'lucide-react';
import styles from './AdminControls.module.css';
import Background from './Background'; // Import Background for preview

const statusOptions = [
    { value: 'In Office', label: '재실 (In Office)', icon: User, textClass: styles.textGreen, bgClass: styles.bgGreen },
    { value: 'In Class', label: '수업 중 (In Class)', icon: BookOpen, textClass: styles.textBlue, bgClass: styles.bgBlue },
    { value: 'On Campus', label: '교내 (On Campus)', icon: School, textClass: styles.textYellow, bgClass: styles.bgYellow },
    { value: 'Off Campus', label: '교외 (Off Campus)', icon: MapPin, textClass: styles.textOrange, bgClass: styles.bgOrange },
    { value: 'Left for Day', label: '퇴근 (Left for Day)', icon: Home, textClass: styles.textGray, bgClass: styles.bgGray },
    { value: 'Business Trip', label: '출장 (Business Trip)', icon: Briefcase, textClass: styles.textPurple, bgClass: styles.bgPurple },
];

const mascotOptions = [
    { value: 'fox', label: '여우 (Fox)', icon: '🦊' },
    { value: 'cat', label: '고양이 (Cat)', icon: '🐱' },
    { value: 'dog', label: '강아지 (Dog)', icon: '🐶' },
    { value: 'robot', label: '로봇 (Robot)', icon: '🤖' },
    { value: 'alien', label: '외계인 (Alien)', icon: '👽' },
    { value: 'ghost', label: '유령 (Ghost)', icon: '👻' },
];

const weatherOptions = [
    { value: 'auto', label: '자동 (Auto)', icon: '🤖' },
    { value: 'sunny', label: '맑음 (Sunny)', icon: '☀️' },
    { value: 'cloudy', label: '흐림 (Cloudy)', icon: '☁️' },
    { value: 'rainy', label: '비 (Rainy)', icon: '🌧️' },
    { value: 'snowy', label: '눈 (Snowy)', icon: '❄️' },
    { value: 'windy', label: '바람 (Windy)', icon: '💨' },
];

export default function AdminControls() {
    const [status, setStatus] = useState('In Office');
    const [professorMessage, setProfessorMessage] = useState('');
    const [studentMessages, setStudentMessages] = useState<any[]>([]);
    const [mascot, setMascot] = useState('fox');
    const [weatherOverride, setWeatherOverride] = useState<string>('auto');
    const [calendarUrl, setCalendarUrl] = useState('');
    const [emailSettings, setEmailSettings] = useState({
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        receiverEmail: '',
        baseUrl: 'http://localhost:3000',
        secure: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/status');
            if (res.ok) {
                const data = await res.json();
                setStatus(data.currentStatus);
                setProfessorMessage(data.professorMessage);
                setMascot(data.mascot || 'fox');
                setWeatherOverride(data.weatherOverride || 'auto');
                setCalendarUrl(data.calendarUrl || '');
                setEmailSettings(data.emailSettings || {
                    smtpHost: '',
                    smtpPort: 587,
                    smtpUser: '',
                    smtpPass: '',
                    receiverEmail: '',
                    baseUrl: 'http://localhost:3000',
                    secure: false
                });
                setStudentMessages(data.messages || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setSaving(true);
            const payload = {
                currentStatus: status,
                professorMessage,
                mascot,
                weatherOverride: weatherOverride === 'auto' ? null : weatherOverride,
                calendarUrl,
                emailSettings
            };

            const res = await fetch('/api/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                await fetchData();
                alert('상태가 업데이트되었습니다. (Status Updated)');
            }
        } catch (e) {
            console.error(e);
            alert('업데이트 실패 (Update Failed)');
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        try {
            setTestingEmail(true);
            const res = await fetch('/api/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailSettings),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert('테스트 이메일 전송 성공!\n(Test email sent successfully!)');
            } else {
                alert(`전송 실패:\n${data.error}`);
            }
        } catch (e: any) {
            alert(`오류 발생: ${e.message}`);
        } finally {
            setTestingEmail(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <>
            <Background override={weatherOverride === 'auto' ? null : weatherOverride} />
            <div className={styles.container}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <User className={styles.textBlue} />
                        상태 변경 (Change Status)
                    </h2>
                    <div className={styles.grid}>
                        {statusOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatus(opt.value)}
                                className={`${styles.statusButton} ${status === opt.value ? `${styles.statusButtonActive} ${opt.bgClass}` : ''}`}
                            >
                                <opt.icon size={32} className={opt.textClass} />
                                <span className={styles.statusLabel}>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <CloudSun className={styles.textBlue} />
                        날씨 설정 (Weather Setting)
                    </h2>
                    <div className={styles.grid}>
                        {weatherOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setWeatherOverride(opt.value)}
                                className={`${styles.statusButton} ${weatherOverride === opt.value ? styles.statusButtonActive : ''}`}
                            >
                                <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                                <span className={styles.statusLabel}>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Smile className={styles.textOrange} />
                        마스코트 변경 (Change Mascot)
                    </h2>
                    <div className={styles.grid}>
                        {mascotOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setMascot(opt.value)}
                                className={`${styles.statusButton} ${mascot === opt.value ? styles.statusButtonActive : ''}`}
                            >
                                <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                                <span className={styles.statusLabel}>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span style={{ fontSize: '1.5rem' }}>📅</span>
                        구글 캘린더 연동 (Google Calendar)
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                        구글 캘린더 설정 {'>'} 해당 캘린더 선택 {'>'} 캘린더 통합 {'>'}
                        <strong>iCal 형식의 비공개 주소</strong>를 복사해서 붙여넣으세요.
                    </p>
                    <input
                        type="text"
                        value={calendarUrl}
                        onChange={(e) => setCalendarUrl(e.target.value)}
                        className={styles.textarea}
                        placeholder="https://calendar.google.com/calendar/ical/..."
                        style={{ height: 'auto', minHeight: '40px' }}
                    />
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <RefreshCw className={styles.textGreen} />
                        공지 사항 (Notice Message)
                    </h2>
                    <textarea
                        value={professorMessage}
                        onChange={(e) => setProfessorMessage(e.target.value)}
                        className={styles.textarea}
                        rows={3}
                        placeholder="학생들에게 보여줄 메시지를 입력하세요..."
                    />
                    <div className={styles.saveButtonWrapper}>
                        <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className={styles.saveButton}
                        >
                            <Save size={18} />
                            {saving ? '저장 중...' : '저장하기 (Save)'}
                        </button>
                    </div>
                </section>



                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span style={{ fontSize: '1.5rem' }}>📧</span>
                        이메일 설정 (Email Settings)
                    </h2>
                    <div className={styles.grid} style={{ gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={emailSettings.smtpHost}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                            className={styles.textarea}
                            placeholder="SMTP Host (e.g., smtp.gmail.com)"
                            style={{ height: 'auto', minHeight: '40px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input
                                type="number"
                                value={emailSettings.smtpPort}
                                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                                className={styles.textarea}
                                placeholder="Port (587)"
                                style={{ height: 'auto', minHeight: '40px' }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={emailSettings.secure}
                                    onChange={(e) => setEmailSettings({ ...emailSettings, secure: e.target.checked })}
                                />
                                Secure (SSL/TLS)
                            </label>
                        </div>
                        <input
                            type="text"
                            value={emailSettings.smtpUser}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                            className={styles.textarea}
                            placeholder="SMTP User (Email)"
                            style={{ height: 'auto', minHeight: '40px' }}
                        />
                        <input
                            type="password"
                            value={emailSettings.smtpPass}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpPass: e.target.value })}
                            className={styles.textarea}
                            placeholder="SMTP Password"
                            style={{ height: 'auto', minHeight: '40px' }}
                        />
                        <input
                            type="email"
                            value={emailSettings.receiverEmail}
                            onChange={(e) => setEmailSettings({ ...emailSettings, receiverEmail: e.target.value })}
                            className={styles.textarea}
                            placeholder="Receiver Email (To receive messages)"
                            style={{ height: 'auto', minHeight: '40px' }}
                        />
                        <input
                            type="text"
                            value={emailSettings.baseUrl}
                            onChange={(e) => setEmailSettings({ ...emailSettings, baseUrl: e.target.value })}
                            className={styles.textarea}
                            placeholder="Base URL (e.g., http://192.168.0.5:3000)"
                            style={{ height: 'auto', minHeight: '40px' }}
                        />
                        <button
                            onClick={handleTestEmail}
                            disabled={testingEmail}
                            className={styles.saveButton}
                            style={{ background: '#48bb78', marginTop: '0.5rem' }}
                        >
                            {testingEmail ? '테스트 중...' : 'SMTP 연결 테스트 (Test Connection)'}
                        </button>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <BookOpen className={styles.textPurple} />
                        학생 메시지 (Student Messages)
                    </h2>
                    <div className={styles.messageList}>
                        {studentMessages.length === 0 ? (
                            <p className={styles.emptyMessage}>메시지가 없습니다.</p>
                        ) : (
                            studentMessages.slice().reverse().map((msg, idx) => (
                                <div key={idx} className={styles.messageItem}>
                                    <div className={styles.messageHeader}>
                                        <span className={styles.messageSender}>{msg.studentName}</span>
                                        <span className={styles.messageTime}>{new Date(msg.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className={styles.messageContent}>{msg.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div >
        </>
    );
}
