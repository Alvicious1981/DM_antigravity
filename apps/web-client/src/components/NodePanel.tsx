"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Heart, Fingerprint, Target, MessageSquare } from 'lucide-react';

export interface NPC {
    id: string;
    name: string;
    type: string;
    location_node_id: string;
    hp_max: number;
    hp_current: number;
    ac: number;
    cr: number;
    profile: {
        core_trait: string;
        motivation: string;
        visual_features: string[];
        background: string;
    } | null;
}

interface NodePanelProps {
    nodeId: string;
    nodeName: string;
    onClose: () => void;
}

export default function NodePanel({ nodeId, nodeName, onClose }: NodePanelProps) {
    const [npcs, setNpcs] = useState<NPC[]>([]);
    const [loading, setLoading] = useState(true);
    const [spawning, setSpawning] = useState(false);

    const fetchNpcs = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/world/map/nodes/${nodeId}/actors`);
            if (response.ok) {
                const data = await response.json();
                setNpcs(data);
            }
        } catch (error) {
            console.error("Failed to fetch NPCs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSpawn = async () => {
        setSpawning(true);
        try {
            const response = await fetch(`http://localhost:8081/api/world/map/nodes/${nodeId}/spawn-npc?cr=0.25`, {
                method: "POST"
            });
            if (response.ok) {
                await fetchNpcs();
            }
        } catch (error) {
            console.error("Failed to spawn NPC:", error);
        } finally {
            setSpawning(false);
        }
    };

    useEffect(() => {
        fetchNpcs();
    }, [nodeId]);

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-[#0f0f12]/95 backdrop-blur-md border-l border-stone-800/40 z-50 flex flex-col shadow-2xl"
        >
            {/* Header */}
            <div className="p-6 border-b border-stone-800/40 bg-gradient-to-b from-[#1a1a1f] to-transparent">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-cinzel font-bold text-[#c5a059] tracking-tight">{nodeName}</h2>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-300">✕</button>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Local Cast & Residents</p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-32 text-stone-600 animate-pulse font-cinzel">Consulting Records...</div>
                ) : npcs.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-stone-800 mx-auto mb-4 opacity-20" />
                        <p className="text-stone-600 text-sm italic">"The streets are empty, save for the howling wind."</p>
                    </div>
                ) : (
                    npcs.map((npc) => (
                        <NPCCard key={npc.id} npc={npc} />
                    ))
                )}
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-stone-800/40 bg-[#141418]">
                <button
                    onClick={handleSpawn}
                    disabled={spawning}
                    className="w-full py-3 bg-stone-900 border border-stone-700 text-stone-300 hover:bg-[#c5a059] hover:text-stone-950 transition-all duration-300 rounded flex items-center justify-center gap-3 group"
                >
                    <UserPlus className={`w-4 h-4 ${spawning ? 'animate-spin' : 'group-hover:scale-110'}`} />
                    <span className="uppercase tracking-widest text-xs font-bold">
                        {spawning ? "MANIFESTING..." : "FORGE NEW INHABITANT"}
                    </span>
                </button>
            </div>
        </motion.div>
    );
}

function NPCCard({ npc }: { npc: NPC }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="parchment-texture border border-stone-800/20 rounded-lg p-4 shadow-lg group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                <Fingerprint className="w-8 h-8 text-stone-900" />
            </div>

            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center border border-[#c5a059]/30 text-[#c5a059] font-cinzel font-bold">
                    {npc.name[0]}
                </div>
                <div>
                    <h4 className="text-stone-950 font-bold leading-none">{npc.name}</h4>
                    <span className="text-[9px] uppercase tracking-widest text-[#8a6e3e] font-bold">{npc.profile?.background || "Wanderer"}</span>
                </div>
            </div>

            {npc.profile && (
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <Target className="w-3 h-3 text-stone-800 mt-0.5" />
                        <div>
                            <p className="text-[9px] text-stone-500 uppercase font-black">Core Trait</p>
                            <p className="text-xs text-stone-900 font-medium">{npc.profile.core_trait}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 text-stone-800 mt-0.5" />
                        <div>
                            <p className="text-[9px] text-stone-500 uppercase font-black">Motivation</p>
                            <p className="text-xs text-stone-800 italic">{npc.profile.motivation}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                        {npc.profile.visual_features.map((feature, i) => (
                            <span key={i} className="px-2 py-0.5 bg-stone-900/10 text-[9px] text-stone-700 rounded-full border border-stone-900/5">
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-stone-950/5 pt-3">
                <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-red-900" />
                    <span className="text-[10px] font-bold text-stone-900">{npc.hp_current}/{npc.hp_max}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-blue-900" />
                    <span className="text-[10px] font-bold text-stone-900">AC {npc.ac}</span>
                </div>
            </div>
        </motion.div>
    );
}
