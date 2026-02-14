'use client';

import { useEffect, useState } from 'react';
import styles from './Background.module.css';

interface BackgroundProps {
    weatherCode?: number;
    override?: string | null;
}

export default function Background({ weatherCode = 0, override = null }: BackgroundProps) {
    const [particles, setParticles] = useState<number[]>([]);

    const getWeatherState = (code: number) => {
        if (override && override !== 'auto') return override;

        if (code === 0 || code === 1) return 'sunny';
        if (code >= 2 && code <= 48) return 'cloudy';
        if (code >= 51 && code <= 67) return 'rainy';
        if (code >= 71 && code <= 77) return 'snowy';
        if (code >= 80 && code <= 99) return 'rainy';
        return 'sunny';
    };

    const weatherState = getWeatherState(weatherCode);

    useEffect(() => {
        // Increase count for rain even more to create dense atmosphere
        let count = 40;
        if (weatherState === 'rainy') count = 80; // Reduced from 200
        if (weatherState === 'snowy') count = 100;
        if (weatherState === 'windy') count = 60;

        setParticles(Array.from({ length: count }, (_, i) => i));
    }, [weatherState]);

    return (
        <div className={`${styles.container} ${styles[weatherState]}`}>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>

            {/* Cloud layer */}
            {(weatherState === 'cloudy' || weatherState === 'windy' || weatherState === 'snowy' || weatherState === 'rainy') && (
                <>
                    <div className={styles.cloud} style={{ top: '10%', width: '300px', height: '100px', animationDuration: weatherState === 'windy' ? '15s' : '40s' }} />
                    <div className={styles.cloud} style={{ top: '30%', width: '200px', height: '80px', animationDelay: '-10s', animationDuration: weatherState === 'windy' ? '12s' : '35s' }} />
                    <div className={styles.cloud} style={{ top: '5%', width: '400px', height: '150px', left: '50%', animationDelay: '-5s', animationDuration: weatherState === 'windy' ? '18s' : '45s' }} />
                </>
            )}

            {particles.map((i) => {
                let type = styles.particle;

                // Randomize
                const left = Math.random() * 100;
                let animationDuration = Math.random() * 10 + 10;
                let animationDelay = -Math.random() * 10;
                let styleOverride: React.CSSProperties = {};

                if (weatherState === 'rainy') {
                    const isFront = Math.random() > 0.6; // 40% front, 60% back
                    type = `${styles.rainDrop} ${isFront ? styles.rainFront : styles.rainBack}`;
                    animationDuration = isFront ? 0.8 + Math.random() * 0.3 : 1.2 + Math.random() * 0.5; // Slower
                    // Use strict delay to stagger
                    animationDelay = -Math.random() * 2;
                } else if (weatherState === 'snowy') {
                    type = styles.snowFlake;
                    animationDuration = 3 + Math.random() * 4;
                    styleOverride.width = Math.random() * 8 + 4 + 'px';
                    styleOverride.height = styleOverride.width;
                } else if (weatherState === 'windy') {
                    type = styles.windParticle;
                    animationDuration = 1 + Math.random() * 1.5;
                    styleOverride.width = Math.random() * 150 + 50 + 'px';
                    styleOverride.top = `${Math.random() * 100}%`;
                } else if (weatherState === 'cloudy') {
                    styleOverride.top = `${Math.random() * 100}%`;
                }

                return (
                    <div
                        key={i}
                        className={type}
                        style={{
                            left: `${left}%`,
                            animationDelay: `${animationDelay}s`,
                            animationDuration: `${animationDuration}s`,
                            ...styleOverride
                        }}
                    />
                );
            })}
        </div>
    );
}
