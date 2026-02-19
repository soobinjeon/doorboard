'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface WeatherGravitySceneProps {
    weatherCode: number;
}

export default function WeatherGravityScene({ weatherCode }: WeatherGravitySceneProps) {
    const weatherState = getWeatherState(weatherCode);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', background: getBackgroundColor(weatherState) }}>
            <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
                <UnifiedParticleSystem weatherState={weatherState} />
            </Canvas>
        </div>
    );
}

function getWeatherState(code: number) {
    if (code === 1000) return 'windy'; // Custom code
    if (code === 0 || code === 1) return 'sunny';
    if (code >= 2 && code <= 48) return 'cloudy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 77) return 'snowy';
    if (code >= 80 && code <= 99) return 'rainy';
    return 'sunny';
}

function getBackgroundColor(weather: string) {
    switch (weather) {
        case 'sunny': return 'linear-gradient(to bottom, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        case 'cloudy': return 'linear-gradient(to bottom, #304352 0%, #d7d2cc 100%)';
        case 'rainy': return 'linear-gradient(to bottom, #000000 0%, #434343 100%)';
        case 'snowy': return 'linear-gradient(to bottom, #83a4d4 0%, #b6fbff 100%)';
        case 'windy': return 'linear-gradient(to bottom, #485563 0%, #29323c 100%)'; // Grey/Blue-ish
        default: return '#000';
    }
}

function UnifiedParticleSystem({ weatherState }: { weatherState: string }) {
    const count = 6000; // Increased for cloud density
    const ref = useRef<THREE.Points>(null!);

    // Initialize standard positions (random field)
    const initialPositions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const target = new Float32Array(count * 3); // Pre-allocate target buffer
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
        return pos;
    }, []);

    const colors = useMemo(() => {
        const col = new Float32Array(count * 3);
        const color = new THREE.Color();
        for (let i = 0; i < count; i++) {
            color.setHex(0xffffff);
            col[i * 3] = color.r; col[i * 3 + 1] = color.g; col[i * 3 + 2] = color.b;
        }
        return col;
    }, []);

    useEffect(() => {
        if (!ref.current) return;
        const col = ref.current.geometry.attributes.color.array as Float32Array;
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            if (weatherState === 'rainy') {
                if (Math.random() > 0.8) { color.setHex(0xffffff); }
                else { color.setHex(0xa4d4ff); }
            } else if (weatherState === 'snowy') {
                color.setHex(0xffffff);
            } else if (weatherState === 'cloudy') {
                const val = 0.6 + Math.random() * 0.4;
                color.setRGB(val, val, val);
            } else if (weatherState === 'windy') {
                // Windy colors - debris/dust or just white lines
                const val = 0.8 + Math.random() * 0.2;
                color.setRGB(val, val, val);
            } else { // Sunny
                const r = Math.random();
                if (r > 0.6) color.setHex(0xffd700);
                else if (r > 0.3) color.setHex(0xff8c00);
                else color.setHex(0xffff00);
            }
            col[idx] = color.r; col[idx + 1] = color.g; col[idx + 2] = color.b;
        }
        ref.current.geometry.attributes.color.needsUpdate = true;
    }, [weatherState]);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const pos = ref.current.geometry.attributes.position.array as Float32Array;
        const time = state.clock.getElapsedTime();

        // Denser Clouds: More centers
        const cloudCenters = [
            { x: -20, y: 12, z: -5 },
            { x: 0, y: 15, z: 0 },
            { x: 20, y: 10, z: -5 },
            { x: -10, y: 5, z: 5 },
            { x: 10, y: 0, z: 5 },
            { x: -25, y: -5, z: -10 },
            { x: 25, y: -8, z: 0 },
        ];

        for (let i = 0; i < count; i++) {
            const idx = i * 3;

            if (weatherState === 'rainy') {
                const ySpeed = -30; // 1.5x what it was in previous iteration to feel natural but not too fast
                // Wait, user asked for 1/2 speed of original. Original was -35/-40. 
                // Previous iteration I set -20. User said "Rain falls in clumps".
                // I'll set -25 and improve spread.
                const xSpeed = -5;

                pos[idx] += xSpeed * delta;
                pos[idx + 1] += -25 * delta;

                // Optimized Loop Logic
                if (pos[idx + 1] < -50) {
                    pos[idx + 1] = 50 + Math.random() * 40; // Respawn WAY above to vary arrival
                    pos[idx] = (Math.random() - 0.5) * 100; // New X
                    // Also vary speed slightly? No, uniform gravity is better for rain.
                }
                // Reset X if it blows off screen too far
                if (pos[idx] < -60) pos[idx] = 60 + Math.random() * 10;

                // Z-reset occasionally
                if (pos[idx + 2] > 20 || pos[idx + 2] < -20) pos[idx + 2] = (Math.random() - 0.5) * 40;

            } else if (weatherState === 'snowy') {
                const ySpeed = -2;
                pos[idx] += Math.sin(time * 2 + i * 0.1) * 0.05; // Flutter
                pos[idx + 1] += ySpeed * delta;

                if (pos[idx + 1] < -50) {
                    pos[idx + 1] = 50 + Math.random() * 30;
                    pos[idx] = (Math.random() - 0.5) * 100;
                }

            } else if (weatherState === 'windy') {
                // Windy: Horizontal Stream
                const xSpeed = -40 - Math.random() * 20; // Very fast

                pos[idx] += xSpeed * delta;

                // Wrap X
                if (pos[idx] < -60) {
                    pos[idx] = 60 + Math.random() * 10;
                    pos[idx + 1] = (Math.random() - 0.5) * 80; // Random Y
                }

                // Slight Y drift
                pos[idx + 1] += (Math.random() - 0.5) * 0.1;

            } else if (weatherState === 'cloudy') {
                const center = cloudCenters[i % cloudCenters.length];
                const animX = center.x + Math.sin(time * 0.2 + i % 3) * 3;

                const r = 5 + (i % 6); // Varied radius for puffiness
                const theta = (i * 0.123);
                const phi = (i * 0.234);

                const tx = animX + r * Math.sin(phi) * Math.cos(theta);
                const ty = center.y + r * Math.sin(phi) * Math.sin(theta);
                const tz = center.z + r * Math.cos(phi);

                // Lerp
                pos[idx] += (tx - pos[idx]) * 0.02;
                pos[idx + 1] += (ty - pos[idx + 1]) * 0.02;
                pos[idx + 2] += (tz - pos[idx + 2]) * 0.02;

            } else { // Sunny
                // Sun Sphere with Explosion
                const radius = 12;

                // Explosion / Pulse effect
                // Complex pulse: Heartbeat + Occasional Big Expand
                const bigPulse = Math.sin(time * 0.5); // Slow breath
                let explosion = 0;
                if (bigPulse > 0.8) {
                    explosion = (bigPulse - 0.8) * 20; // Rapid expansion at peak
                }

                const goldenAngle = Math.PI * (3 - Math.sqrt(5));
                const thetaGA = goldenAngle * i;
                const y = 1 - (i / (count - 1)) * 2;
                const radiusAtY = Math.sqrt(1 - y * y);

                let currentRadius = radius + explosion;
                // Add noise
                currentRadius += Math.sin(time * 5 + i) * 0.5;

                const tx = 0 + currentRadius * radiusAtY * Math.cos(thetaGA);
                const ty = 5 + currentRadius * y; // Lifted
                const tz = 0 + currentRadius * radiusAtY * Math.sin(thetaGA);

                // Lerp
                pos[idx] += (tx - pos[idx]) * 0.05;
                pos[idx + 1] += (ty - pos[idx + 1]) * 0.05;
                pos[idx + 2] += (tz - pos[idx + 2]) * 0.05;
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={initialPositions} itemSize={3} args={[initialPositions, 3]} />
                <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={weatherState === 'rainy' ? 0.1 : 0.15}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
