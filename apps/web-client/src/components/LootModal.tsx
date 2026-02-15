"use client";

import { motion, AnimatePresence } from "framer-motion";
import { InventoryItem } from "../hooks/useAgentState";

interface LootModalProps {
    isOpen: boolean;
    items: InventoryItem[];
    onClaim: () => void;
}

export default function LootModal({ isOpen, items, onClaim }: LootModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-lg rounded-xl border border-[#c5a059] bg-[#1a1a1d] p-6 shadow-[0_0_30px_rgba(197,160,89,0.2)]"
                    >
                        <h2
                            className="text-2xl font-bold text-center mb-6 tracking-widest text-[#c5a059]"
                            style={{ fontFamily: "var(--font-cinzel)" }}
                        >
                            TESORO ENCONTRADO
                        </h2>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {items.map((item) => (
                                <div
                                    key={item.instance_id}
                                    className="flex flex-col items-center gap-2 p-3 rounded-lg border border-[#2a2a2d] bg-[#141416]"
                                >
                                    {/* Visual Vault Asset (Placeholder/Real) */}
                                    <div className="w-16 h-16 rounded bg-[#0a0a0a] border border-[#2a2a2d] flex items-center justify-center overflow-hidden">
                                        {(item.stats as any).visual_asset_url ? (
                                            <img
                                                src={(item.stats as any).visual_asset_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl">🎁</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-[#e0e0e4] text-center">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={onClaim}
                                className="px-8 py-3 rounded bg-[#c5a059] text-black font-bold uppercase tracking-widest hover:bg-[#d4af37] transition-colors"
                            >
                                Reclamar Todo
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
