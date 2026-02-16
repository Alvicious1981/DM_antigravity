"use client";

import React, { useEffect, useState } from 'react';
import { useAgentState, MapNode } from '../hooks/useAgentState';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, Navigation, Skull, Castle, Trees, Mountain, User } from 'lucide-react';
import NodePanel from '../components/NodePanel';

export default function WorldMap() {
    const { mapState, requestMapData, sendAction, connected, combatants, triggerMapCapture } = useAgentState();
    const { nodes, currentNodeId } = mapState;
    const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
    const [travelingTo, setTravelingTo] = useState<string | null>(null);

    useEffect(() => {
        if (connected) {
            requestMapData();
        }
    }, [connected, requestMapData]);

    useEffect(() => {
        if (currentNodeId) {
            handleCapture(currentNodeId);
            setTravelingTo(null); // Reset travel state when we arrive
        }
    }, [currentNodeId]);

    const handleCapture = async (nodeId: string) => {
        setIsCapturing(true);
        const url = await triggerMapCapture(nodeId);
        if (url) {
            setMapImageUrl(`http://localhost:8081${url}`);
        }
        setIsCapturing(false);
    };

    const handleTravel = (nodeId: string) => {
        setTravelingTo(nodeId);
        const playerId = combatants.find(c => c.isPlayer)?.id || "player_1";
        sendAction({
            action: "map_interaction",
            character_id: playerId,
            interaction_type: "travel",
            target_node_id: nodeId
        });
    };

    const getPosition = (x: number, y: number) => ({
        left: `${x}%`,
        top: `${y}%`
    });

    return (
        <div className="relative w-full h-full bg-[#0a0a0c] overflow-hidden flex flex-col shadow-[inset_0_20px_40px_rgba(0,0,0,0.8)] rounded-lg border border-[#2a2a2d]">
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="parchment-texture px-6 py-3 rounded shadow-2xl border border-stone-800/40 transform -rotate-1"
                >
                    <h2 className="text-[10px] uppercase tracking-widest text-[#8a6e3e] font-bold">Region Authorities</h2>
                    <h1 className="text-stone-950 font-cinzel font-bold text-xl leading-none">The Dreadlands</h1>
                </motion.div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative parchment-texture map-inset-shadow overflow-hidden">
                {/* Map Image Background */}
                <AnimatePresence mode="wait">
                    {mapImageUrl ? (
                        <motion.img
                            key={mapImageUrl}
                            src={mapImageUrl}
                            alt="World Map"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isCapturing ? 0.4 : 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-stone-300/20 mix-blend-multiply flex items-center justify-center">
                            <span className="text-stone-500/30 text-4xl font-cinzel tracking-[0.5em] rotate-12 select-none">
                                {isCapturing ? "ILLUMINATING..." : "UNKNOWN TERRITORY"}
                            </span>
                        </div>
                    )}
                </AnimatePresence>

                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Dynamic Map Nodes */}
                {nodes.map((node) => {
                    const isCurrent = node.id === currentNodeId;
                    const isConnected = nodes.find(n => n.id === currentNodeId)?.connections.includes(node.id);
                    const isHovered = hoveredNode?.id === node.id;

                    let Icon = MapPin;
                    if (node.type === "city") Icon = Castle;
                    if (node.type === "dungeon") Icon = Skull;
                    if (node.type === "forest") Icon = Trees;
                    if (node.type === "mountain") Icon = Mountain;

                    return (
                        <div
                            key={node.id}
                            className={`absolute flex flex-col items-center group transition-all duration-500
                                ${isCurrent ? 'z-30' : 'z-10'}
                                ${(isConnected || isCurrent) && !travelingTo ? 'cursor-pointer' : 'pointer-events-none'}
                            `}
                            style={getPosition(node.coordinates.x, node.coordinates.y)}
                            onClick={() => {
                                if (isConnected && !travelingTo && node.id !== currentNodeId) {
                                    handleTravel(node.id);
                                }
                                if ((isConnected || isCurrent) && !travelingTo) {
                                    setSelectedNode(node);
                                }
                            }}
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                        >
                            {/* Connection Pulse */}
                            {isConnected && !travelingTo && (
                                <div className="absolute inset-0 w-12 h-12 -m-2 rounded-full bg-red-500/10 animate-ping pointer-events-none" />
                            )}

                            {/* Node Icon */}
                            <motion.div
                                animate={{
                                    scale: isCurrent ? 1.4 : isHovered ? 1.2 : 1,
                                    y: isCurrent ? -5 : 0
                                }}
                                className={`p-1.5 rounded-full border shadow-xl transition-colors
                                    ${isCurrent
                                        ? 'bg-[#c5a059] border-[#8a6e3e] text-stone-900 shadow-[#c5a059]/40'
                                        : isConnected
                                            ? 'bg-stone-100 border-stone-800 text-stone-800 group-hover:bg-red-50 group-hover:text-red-900 group-hover:border-red-900'
                                            : 'bg-stone-300/40 border-stone-800/20 text-stone-800/40'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.div>

                            {/* Label */}
                            <span className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap border transition-all
                                ${isCurrent
                                    ? 'bg-[#c5a059] text-stone-900 border-[#8a6e3e]'
                                    : 'bg-stone-900/40 text-stone-200 border-white/5 backdrop-blur-sm group-hover:bg-red-900/60 group-hover:text-white'
                                }
                            `}>
                                {node.name}
                            </span>
                        </div>
                    );
                })}

                {/* Hover Tooltip Overlay */}
                <AnimatePresence>
                    {hoveredNode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-64 parchment-texture border border-stone-800/30 p-4 shadow-2xl rounded-lg overflow-hidden pointer-events-none"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#c5a059]/30" />
                            <h3 className="font-cinzel text-stone-900 font-bold border-b border-stone-800/10 pb-1 mb-2">
                                {hoveredNode.name}
                            </h3>
                            <p className="text-[11px] text-stone-700 leading-relaxed italic">
                                {hoveredNode.description || "An unexplored region shrouded in mystery and ancient whispers."}
                            </p>
                            <div className="mt-3 flex gap-4 text-[9px] uppercase font-bold tracking-tighter text-stone-500">
                                <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> DISTANCE: 4 LEAGUES</span>
                                <span className="flex items-center gap-1"><Info className="w-3 h-3" /> RISK: HIGH</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Travel Progress Overlay */}
                <AnimatePresence>
                    {travelingTo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-[#0f0f12]/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="max-w-md w-full">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="mb-8 mx-auto"
                                >
                                    <Navigation className="w-12 h-12 text-[#c5a059]" />
                                </motion.div>
                                <h2 className="text-2xl font-cinzel text-[#c5a059] mb-2 tracking-widest">TRAVERSING THE VOID</h2>
                                <p className="text-stone-400 text-sm mb-8 italic">"The path forward is paved with the bones of those who hesitated."</p>

                                <div className="h-2 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 4, ease: "easeInOut" }}
                                        className="h-full bg-gradient-to-r from-[#8a6e3e] to-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                                    />
                                </div>
                                <div className="mt-2 text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                                    Arriving at {nodes.find(n => n.id === travelingTo)?.name || "Destination"}...
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Zoom Controls Area */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
                <ZoomButton icon="+" />
                <ZoomButton icon="-" />
                <ZoomButton icon="◎" active />
            </div>

            {/* Node Info Panel (Cast) */}
            <AnimatePresence>
                {selectedNode && (
                    <NodePanel
                        nodeId={selectedNode.id}
                        nodeName={selectedNode.name}
                        onClose={() => setSelectedNode(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ZoomButton({ icon, active }: { icon: string; active?: boolean }) {
    return (
        <button className={`w-10 h-10 rounded bg-[#141416]/80 border ${active ? 'border-[#c5a059] text-[#c5a059]' : 'border-[#2a2a2d] text-stone-400'} flex items-center justify-center shadow-lg hover:bg-stone-800 transition-colors`}>
            {icon}
        </button>
    );
}
