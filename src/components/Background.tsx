'use client';

import dynamic from 'next/dynamic';

const WeatherGravityScene = dynamic(() => import('./WeatherGravityScene'), { ssr: false });

interface BackgroundProps {
    weatherCode?: number;
    override?: string | null;
}

export default function Background({ weatherCode = 0, override = null }: BackgroundProps) {
    // Determine effective code based on override if needed
    // The visual logic is handled inside WeatherGravityScene

    // We can map override strings back to codes if necessary, or just pass the code
    // For now, let's assume override handles mostly status text logic, 
    // but if it affects weather we might need a map.
    // The original code handled 'sunny', 'cloudy' etc strings. 
    // WeatherGravityScene takes a number. 

    // Simple mapping for override if it's a string like 'rainy'
    let effectiveCode = weatherCode;
    if (override) {
        if (override === 'rainy') effectiveCode = 63;
        if (override === 'snowy') effectiveCode = 73;
        if (override === 'cloudy') effectiveCode = 3;
        if (override === 'sunny') effectiveCode = 0;
        if (override === 'windy') effectiveCode = 1000;
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
            <WeatherGravityScene weatherCode={effectiveCode} />
        </div>
    );
}
