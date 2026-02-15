"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DamageOverlayProps {
    currentHp: number;
    maxHp: number;
}

export default function DamageOverlay({ currentHp, maxHp }: DamageOverlayProps) {
    const [takeDamage, setTakeDamage] = useState(false);
    const prevHp = useRef(currentHp);

    const isLowHp = currentHp > 0 && currentHp / maxHp < 0.3;

    useEffect(() => {
        if (currentHp < prevHp.current) {
            // Trigger damage effect
            setTakeDamage(true);
            const timer = setTimeout(() => setTakeDamage(false), 500);
            return () => clearTimeout(timer);
        }
        prevHp.current = currentHp;
    }, [currentHp]);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {/* Flash Red on Damage */}
            <AnimatePresence>
                {takeDamage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-0 bg-red-600 mix-blend-overlay"
                    />
                )}
            </AnimatePresence>

            {/* Persistent Low HP Vignette */}
            <AnimatePresence>
                {isLowHp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(180,0,0,0.6)_100%)]"
                    />
                )}
            </AnimatePresence>

            {/* Screen Shake Logic would conceptually be applied to the 'main' container, 
          but we can simulate a jarring overlay shift here if needed, 
          or just rely on the red flash for now. */}
        </div>
    );
}
