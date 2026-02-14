'use client';

import AdminControls from '@/components/AdminControls';
import styles from './page.module.css';

export default function AdminPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>교수님 도어보드 관리자 (Professor Admin Panel)</h1>
            </header>
            <AdminControls />
        </div>
    );
}
