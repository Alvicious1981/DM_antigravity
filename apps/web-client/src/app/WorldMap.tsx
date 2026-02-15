import React, { useEffect } from 'react';
import { useAgentState, MapNode } from '../hooks/useAgentState';

export default function WorldMap() {
    const { mapState, requestMapData, sendAction, connected, combatants } = useAgentState();
    const { nodes, currentNodeId } = mapState;

    useEffect(() => {
        if (connected) {
            requestMapData();
        }
    }, [connected, requestMapData]);

    const handleTravel = (nodeId: string) => {
        const playerId = combatants.find(c => c.isPlayer)?.id || "player_1";
        sendAction({
            action: "map_interaction",
            character_id: playerId,
            interaction_type: "travel",
            target_node_id: nodeId
        });
    };

    // Helper to scale coordinates (assuming 0-100 range from backend) to percentages
    const getPosition = (x: number, y: number) => ({
        left: `${x}%`,
        top: `${y}%`
    });

    return (
        <div className="relative w-full h-full bg-stone-950 overflow-hidden flex shadow-[inset_0_20px_40px_rgba(0,0,0,0.8)] rounded-lg">
            {/* Map Texture Area */}
            <div className="absolute inset-0 parchment-texture map-inset-shadow p-2 md:p-4">
                <div className="relative w-full h-full border border-stone-800/10 overflow-hidden">
                    {/* Placeholder for Map Image - Using a CSS pattern or generic image if available */}
                    <div className="absolute inset-0 bg-stone-300/30 mix-blend-multiply flex items-center justify-center">
                        <span className="text-stone-500/50 text-6xl font-serif tracking-[1em] rotate-12 select-none">UNKNOWN LANDS</span>
                    </div>

                    {/* Dynamic Map Nodes */}
                    {nodes.map((node) => {
                        const isCurrent = node.id === currentNodeId;
                        const isConnected = nodes.find(n => n.id === currentNodeId)?.connections.includes(node.id);

                        // Icon based on type
                        let icon = "📍";
                        if (node.type === "city") icon = "🏰";
                        if (node.type === "dungeon") icon = "💀";
                        if (node.type === "forest") icon = "🌲";
                        if (node.type === "mountain") icon = "⛰️";

                        return (
                            <div
                                key={node.id}
                                className={`absolute flex flex-col items-center transition-transform duration-300
                                    ${isCurrent ? 'scale-125 z-20 cursor-default' : ''}
                                    ${isConnected ? 'cursor-pointer hover:scale-110 hover:text-red-700 z-10' : 'opacity-60 grayscale z-0'}
                                `}
                                style={getPosition(node.coordinates.x, node.coordinates.y)}
                                onClick={() => isConnected && handleTravel(node.id)}
                            >
                                <span className={`text-3xl drop-shadow-md ${isCurrent ? 'text-blue-700' : 'text-stone-800'}`}>{icon}</span>
                                <span className={`text-[10px] font-bold uppercase mt-1 px-1 rounded shadow-sm whitespace-nowrap
                                    ${isCurrent ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-500' : 'bg-parchment/90 text-stone-900'}
                                `}>
                                    {node.name}
                                </span>
                                {isCurrent && (
                                    <span className="absolute -top-6 text-xs font-bold text-blue-600 bg-white/80 px-2 py-0.5 rounded-full animate-bounce">
                                        YOU ARE HERE
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Map UI Overlays - Zoom Controls */}
            <div className="absolute bottom-8 right-6 flex flex-col gap-2 z-30">
                <button className="w-10 h-10 rounded-lg bg-stone-900/80 border border-primary/20 flex items-center justify-center shadow-lg hover:bg-stone-800 transition-colors text-stone-200">
                    +
                </button>
                <button className="w-10 h-10 rounded-lg bg-stone-900/80 border border-primary/20 flex items-center justify-center shadow-lg hover:bg-stone-800 transition-colors text-stone-200">
                    -
                </button>
                <button className="w-10 h-10 rounded-lg bg-stone-900/80 border border-primary/20 flex items-center justify-center shadow-lg hover:bg-stone-800 transition-colors text-stone-200">
                    ◎
                </button>
            </div>

            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-30">
                <div className="parchment-texture px-4 py-2 rounded shadow-lg border border-stone-800/20 transform rotate-1">
                    <h2 className="text-xs uppercase tracking-widest text-stone-600 font-bold">Region</h2>
                    <h1 className="text-stone-900 font-bold text-lg leading-none">The Dreadlands</h1>
                </div>
            </div>
        </div>
    );
}
