"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConditionOverlayProps {
    conditions: string[];
}

export default function ConditionOverlay({ conditions }: ConditionOverlayProps) {
    // Normalize conditions to lowercase for easier matching
    const activeConditions = conditions.map((c) => c.toLowerCase());

    return (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
            <AnimatePresence>
                {activeConditions.includes("poisoned") && (
                    <motion.div
                        key="poisoned"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-green-900 mix-blend-overlay"
                        style={{
                            backdropFilter: "blur(1px) hue-rotate(45deg)",
                        }}
                    >
                        <div className="absolute inset-0 bg-[url('/assets/bubbles.png')] opacity-20 animate-pulse" />
                    </motion.div>
                )}

                {activeConditions.includes("blinded") && (
                    <motion.div
                        key="blinded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.95 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-black"
                        style={{
                            maskImage: "radial-gradient(circle at center, transparent 10%, black 80%)",
                            WebkitMaskImage: "radial-gradient(circle at center, transparent 10%, black 80%)",
                        }}
                    />
                )}

                {activeConditions.includes("stunned") && (
                    <motion.div
                        key="stunned"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-gray-500 mix-blend-saturation"
                        style={{ filter: "blur(4px)" }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
