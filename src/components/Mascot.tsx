'use client';

import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './Mascot.module.css';

const MASCOTS: Record<string, string> = {
    fox: '🦊',
    cat: '🐱',
    dog: '🐶',
    robot: '🤖',
    alien: '👽',
    ghost: '👻'
};

const VARIANTS: Variants = {
    walking: {
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: "linear"
        }
    },
    peeking: {
        y: [50, 0, 0, 50],
        transition: {
            duration: 2,
            times: [0, 0.2, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 3
        }
    }
};

export default function Mascot({ type = 'fox' }: { type?: string }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        const minX = 0;
        const maxX = typeof window !== 'undefined' ? window.innerWidth - 100 : 1000;

        const move = () => {
            const newX = Math.random() * maxX;
            setDirection(newX > position.x ? 1 : -1);
            setPosition({ x: newX, y: 0 });
        };

        const interval = setInterval(move, 8000); // Slower movement updates
        move();

        return () => clearInterval(interval);
    }, []); // Remove dependency on position to strictly follow interval

    return (
        <motion.div
            className={styles.container}
            animate={{ x: position.x }}
            transition={{ duration: 6, ease: "easeInOut" }} // Smoother transition
            style={{ bottom: '5%' }}
        >
            <motion.div
                className={styles.character}
                variants={VARIANTS}
                animate="walking"
                style={{ transform: `scaleX(${direction})` }}
            >
                {MASCOTS[type] || MASCOTS['fox']}
            </motion.div>
            <div className={styles.shadow} />
        </motion.div>
    );
}
