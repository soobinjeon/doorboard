'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, User, MessageSquare } from 'lucide-react';
import StatusDisplay from '@/components/StatusDisplay';
import BookingModal from '@/components/BookingModal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mobileUrl, setMobileUrl] = useState('');

  const handleStatusDoubleClick = async () => {
    const currentIdx = STATUS_VALUES.indexOf(data.currentStatus as any);
    const nextIdx = (currentIdx + 1) % STATUS_VALUES.length;
    const nextStatus = STATUS_VALUES[nextIdx];

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

  useEffect(() => {
    // Set mobile URL based on settings or default
    const fullUrl = data.emailSettings?.baseUrl
      ? `${data.emailSettings.baseUrl}/m`
      : typeof window !== 'undefined' ? `${window.location.origin}/m` : '';
    setMobileUrl(fullUrl);
  }, [data.emailSettings]);

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

      <MessageBoard message={data.professorMessage} />

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQR(false)}
          >
            <motion.div
              className={styles.qrCard}
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={styles.qrTitle}>Mobile Messenger</h2>
              <p className={styles.qrDesc}>Scan to send a message to the professor</p>

              <div className={styles.qrWrapper}>
                <QRCodeSVG value={mobileUrl} size={200} level="H" includeMargin={true} />
              </div>

              <p className={styles.qrUrl}>{mobileUrl}</p>

              <button className={styles.closeButton} onClick={() => setShowQR(false)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.bookingArea}>
        <motion.button
          className={styles.messageButton}
          onClick={() => setShowQR(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={24} />
          <span>교수님과 약속하기 / 메시지 남기기</span>
          <div className={styles.shine} />
        </motion.button>
      </div>
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <Mascot type={data.mascot} />
    </main>
  );
}
