"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ──────────────────────────────────────────────────────────
// StoryLog — The Narrative Feed (§7.1, AG-UI §6)
// Typewriter streaming of NARRATIVE_CHUNK events.
// ──────────────────────────────────────────────────────────

interface StoryLogProps {
    entries: string[];
    currentText: string;
    isStreaming: boolean;
}

export default function StoryLog({
    entries,
    currentText,
    isStreaming,
}: StoryLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new content
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries, currentText]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2d]">
                <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                <h2
                    className="text-sm font-semibold tracking-widest uppercase"
                    style={{ color: "#c5a059" }}
                >
                    Crónica
                </h2>
                {isStreaming && (
                    <span className="ml-auto text-xs text-[#6b6b75] animate-pulse">
                        narrando...
                    </span>
                )}
            </div>

            {/* Narrative Feed */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#c5a059 #1a1a1d",
                }}
            >
                <AnimatePresence mode="popLayout">
                    {entries.map((entry, index) => (
                        <motion.div
                            key={`entry-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="text-sm leading-relaxed text-[#b0b0b8]"
                        >
                            {/* Detect combat results with emoji prefixes */}
                            {entry.startsWith("⚔️") ? (
                                <p className="text-[#e74c3c] font-medium">{entry}</p>
                            ) : entry.startsWith("🛡️") ? (
                                <p className="text-[#6b6b75] italic">{entry}</p>
                            ) : entry.startsWith("🎲") ? (
                                <p className="text-[#c5a059]">{entry}</p>
                            ) : (
                                <p>{entry}</p>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Live streaming text (typewriter effect) */}
                {currentText && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm leading-relaxed text-[#e0e0e4]"
                    >
                        <p>
                            {currentText}
                            {isStreaming && (
                                <span className="inline-block w-2 h-4 ml-0.5 bg-[#c5a059] animate-pulse" />
                            )}
                        </p>
                    </motion.div>
                )}

                {/* Empty state */}
                {entries.length === 0 && !currentText && (
                    <div className="flex items-center justify-center h-full text-[#6b6b75] text-sm italic">
                        La aventura aguarda...
                    </div>
                )}
            </div>
        </div>
    );
}
