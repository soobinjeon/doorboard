'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StatusDisplay from '@/components/StatusDisplay';
import MessageBoard from '@/components/MessageBoard';
import Mascot from '@/components/Mascot';
import ClockWidget from '@/components/ClockWidget';
import WeatherWidget from '@/components/WeatherWidget';
import ScheduleWidget from '@/components/ScheduleWidget';
import Background from '@/components/Background';
import { QRCodeSVG } from 'qrcode.react';
import styles from './page.module.css';

// Hayang-eup coordinates
const LAT = 35.9133;
const LON = 128.8189;

import { STATUS_VALUES } from '@/lib/constants';

export default function Home() {
  const [data, setData] = useState<{
    currentStatus: string;
    professorMessage: string;
    returnTime: string | null;
    mascot: string;
    weatherOverride?: string | null;
    emailSettings?: { baseUrl: string };
  }>({
    currentStatus: 'Loading...',
    professorMessage: '',
    returnTime: null,
    mascot: 'fox',
    weatherOverride: null
  });
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const handleStatusDoubleClick = async () => {
    console.log('Double click detected. Current status:', data.currentStatus);
    const currentIdx = STATUS_VALUES.indexOf(data.currentStatus as any);
    const nextIdx = (currentIdx + 1) % STATUS_VALUES.length;
    const nextStatus = STATUS_VALUES[nextIdx];
    console.log('Next status:', nextStatus);

    try {
      // Optimistic update
      setData(prev => ({ ...prev, currentStatus: nextStatus }));

      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, currentStatus: nextStatus }),
      });

      if (!res.ok) {
        // Revert if failed (optional, but good practice)
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Status update error', error);
    }
  };

  // Sync status with calendar every 10 minutes
  useEffect(() => {
    const syncStatus = async () => {
      try {
        await fetch('/api/status/sync', { method: 'POST' });
      } catch (e) {
        console.error('Sync failed', e);
      }
    };

    // Run immediately on mount
    syncStatus();

    const interval = setInterval(syncStatus, 600000);
    return () => clearInterval(interval);
  }, []);

  const GOOGLE_FORM_URL = 'https://forms.gle/oC7zXDpYVcJL4mVy7';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial data
    fetchData();

    // Poll data
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`);
        const data = await res.json();
        setWeather({
          temp: data.current_weather.temperature,
          code: data.current_weather.weathercode
        });
      } catch (e) {
        console.error("Failed to fetch weather", e);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <Background weatherCode={weather?.code || 0} override={data.weatherOverride} />

      <ClockWidget />
      <WeatherWidget weather={weather} />

      <div className={styles.contentWrapper}>
        <StatusDisplay status={data.currentStatus} onDoubleClick={handleStatusDoubleClick} />
        <ScheduleWidget />
      </div>

      <div className={styles.noticeRow}>
        <MessageBoard message={data.professorMessage} />
        <motion.div
          className={styles.qrSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.qrBox}>
            <QRCodeSVG value={GOOGLE_FORM_URL} size={140} level="H" includeMargin={true} bgColor="transparent" fgColor="#1f2937" />
          </div>
          <p className={styles.qrLabel}>교수님께 메시지 남기기</p>
        </motion.div>
      </div>

      <Mascot type={data.mascot} />
    </main>
  );
}
