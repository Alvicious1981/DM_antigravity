"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FloatingTextEvent {
    id: string;
    text: string;
    x: number;
    y: number;
    color: "red" | "green" | "white" | "yellow";
}

export default function FloatingTextLayer() {
    const [events, setEvents] = useState<FloatingTextEvent[]>([]);

    useEffect(() => {
        // Custom event listener for dispatching floating text from anywhere in the app
        const handleFloatingText = (e: CustomEvent<FloatingTextEvent>) => {
            const newEvent = { ...e.detail, id: Math.random().toString(36).substr(2, 9) };
            setEvents((prev) => [...prev, newEvent]);

            // Auto-remove after animation
            setTimeout(() => {
                setEvents((prev) => prev.filter((ev) => ev.id !== newEvent.id));
            }, 1500);
        };

        window.addEventListener("floating-text" as any, handleFloatingText as any);
        return () => {
            window.removeEventListener("floating-text" as any, handleFloatingText as any);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
            <AnimatePresence>
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: event.y, x: event.x, scale: 0.5 }}
                        animate={{ opacity: 1, y: event.y - 100, scale: 1.2 }}
                        exit={{ opacity: 0, y: event.y - 150, scale: 0.8 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`absolute font-cinzel text-2xl font-bold drop-shadow-md ${event.color === "red"
                                ? "text-red-500"
                                : event.color === "green"
                                    ? "text-green-400"
                                    : event.color === "yellow"
                                        ? "text-yellow-400"
                                        : "text-white"
                            }`}
                    >
                        {event.text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// Utility to dispatch events
export function spawnFloatingText(text: string, x: number, y: number, color: "red" | "green" | "white" | "yellow" = "white") {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent("floating-text", {
            detail: { text, x, y, color }
        });
        window.dispatchEvent(event);
    }
}
