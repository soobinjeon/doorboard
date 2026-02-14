'use client';

import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudDrizzle } from 'lucide-react';
import styles from './WeatherWidget.module.css';

// WMO Weather interpretation codes (WW)
const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return { icon: Sun, label: '맑음', color: '#f59e0b' };
    if (code === 2 || code === 3) return { icon: Cloud, label: '흐림', color: '#6b7280' };
    if (code >= 45 && code <= 48) return { icon: Cloud, label: '안개', color: '#9ca3af' };
    if (code >= 51 && code <= 67) return { icon: CloudDrizzle, label: '이슬비', color: '#60a5fa' };
    if (code >= 71 && code <= 77) return { icon: CloudSnow, label: '눈', color: '#bfdbfe' };
    if (code >= 80 && code <= 82) return { icon: CloudRain, label: '소나기', color: '#3b82f6' };
    if (code >= 95 && code <= 99) return { icon: CloudLightning, label: '뇌우', color: '#7c3aed' };
    return { icon: CloudRain, label: '비', color: '#3b82f6' }; // Default to rain/cloudy for others
};

interface WeatherWidgetProps {
    weather: { temp: number, code: number } | null;
}

export default function WeatherWidget({ weather }: WeatherWidgetProps) {
    if (!weather) return null;

    const { icon: Icon, label, color } = getWeatherIcon(weather.code);

    return (
        <motion.div
            className={styles.weatherContainer}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
        >
            <Icon size={48} color={color} className={styles.icon} />
            <div className={styles.info}>
                <span className={styles.temp}>{Math.round(weather.temp)}°</span>
                <span className={styles.desc}>{label}</span>
            </div>
        </motion.div>
    );
}
