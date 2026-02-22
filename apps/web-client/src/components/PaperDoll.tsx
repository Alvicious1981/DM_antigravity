"use client";

import React from "react";
import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { InventoryItem } from "../hooks/useAgentState";

interface PaperDollProps {
    inventory: InventoryItem[];
    onEquip: (itemId: string, slot: string) => void;
    onUnequip: (itemId: string) => void;
    onMoveInBackpack?: (itemId: string, newIndex: number) => void;
}

const EQUIPMENT_SLOTS = [
    { id: "head", label: "Head", icon: "🪖" },
    { id: "neck", label: "Neck", icon: "📿" },
    { id: "torso", label: "Torso", icon: "🛡️" },
    { id: "main_hand", label: "Main Hand", icon: "⚔️" },
    { id: "off_hand", label: "Off Hand", icon: "🛡️" },
    { id: "waist", label: "Waist", icon: " belt" },
    { id: "feet", label: "Feet", icon: "👢" },
    { id: "ring_1", label: "Ring I", icon: "💍" },
    { id: "ring_2", label: "Ring II", icon: "💍" },
];

function DraggableItem({ item }: { item: InventoryItem }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.instance_id,
        data: item,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    const getRarityColor = (rarity: string = "Common") => {
        switch (rarity.toLowerCase()) {
            case "uncommon": return "text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
            case "rare": return "text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]";
            case "very rare": return "text-purple-400 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]";
            case "legendary": return "text-orange-400 border-orange-500/50 shadow-[0_0_8px_rgba(249,115,22,0.3)]";
            default: return "text-stone-300 border-stone-600/50";
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded border bg-[#1a1a1e] cursor-grab active:cursor-grabbing transition-all hover:scale-105 ${getRarityColor(item.rarity)} ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            {item.visual_asset_url ? (
                <img src={item.visual_asset_url} alt={item.name} className="w-full h-full object-contain p-0.5 rounded-sm drop-shadow-md" />
            ) : (
                <span className="text-xl md:text-2xl drop-shadow-md">
                    {(item.stats as any)?.visual_emoji || "📦"}
                </span>
            )}
            {item.attunement && (
                <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            )}
        </div>
    );
}

function Slot({ id, label, icon, item }: { id: string, label: string, icon: string, item?: InventoryItem }) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'slot', slot_type: id }
    });

    return (
        <div
            ref={setNodeRef}
            className={`relative group flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-300 ${isOver ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(197,160,89,0.3)]' : 'bg-black/40 border-stone-800'}`}
        >
            <div className="text-[10px] uppercase tracking-tighter text-stone-500 font-bold">{label}</div>
            <div className={`w-12 h-12 flex items-center justify-center rounded border border-dashed border-stone-700/50 text-stone-700`}>
                {item ? <DraggableItem item={item} /> : <span className="opacity-30 grayscale">{icon}</span>}
            </div>
        </div>
    );
}

function BackpackSlot({ index, item }: { index: number, item?: InventoryItem }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `backpack-${index}`,
        data: { type: 'backpack', index }
    });

    return (
        <div
            ref={setNodeRef}
            className={`w-12 h-12 flex items-center justify-center rounded border transition-all ${isOver ? 'bg-gold/10 border-gold' : 'bg-black/30 border-stone-800/40 hover:border-stone-700'}`}
        >
            {item ? <DraggableItem item={item} /> : <span className="text-[8px] text-stone-800">{index + 1}</span>}
        </div>
    );
}

export default function PaperDoll({ inventory, onEquip, onUnequip }: PaperDollProps) {
    const equipped = inventory.filter(i => i.location === 'EQUIPPED');
    const backpack = inventory.filter(i => i.location === 'BACKPACK');

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const item = active.data.current as InventoryItem;
        const overData = over.data.current as any;

        if (overData?.type === 'slot') {
            onEquip(item.instance_id, overData.slot_type);
        } else if (overData?.type === 'backpack') {
            onUnequip(item.instance_id);
            // Ideally we also send grid_index update here if unequipped
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row gap-8 py-4">
                {/* Silhouette / Equipment */}
                <div className="flex-1 flex flex-col gap-4">
                    <h3 className="text-gold font-cinzel text-xs uppercase tracking-widest border-b border-gold/20 pb-2">Loadout</h3>

                    <div className="grid grid-cols-3 gap-2 justify-items-center">
                        <div className="col-start-2">
                            <Slot id="head" label="Head" icon="🪖" item={equipped.find(i => i.slot_type === 'head')} />
                        </div>

                        <div className="col-start-1 row-start-2">
                            <Slot id="neck" label="Neck" icon="📿" item={equipped.find(i => i.slot_type === 'neck')} />
                        </div>
                        <div className="col-start-2 row-start-2">
                            <Slot id="torso" label="Torso" icon="🛡️" item={equipped.find(i => i.slot_type === 'torso')} />
                        </div>
                        <div className="col-start-3 row-start-2">
                            <Slot id="waist" label="Waist" icon=" belt" item={equipped.find(i => i.slot_type === 'waist')} />
                        </div>

                        <div className="col-start-1 row-start-3">
                            <Slot id="main_hand" label="Main Hand" icon="⚔️" item={equipped.find(i => i.slot_type === 'main_hand')} />
                        </div>
                        <div className="col-start-3 row-start-3">
                            <Slot id="off_hand" label="Off Hand" icon="🛡️" item={equipped.find(i => i.slot_type === 'off_hand')} />
                        </div>

                        <div className="row-start-4 flex gap-2 col-span-3 justify-center">
                            <Slot id="ring_1" label="Ring I" icon="💍" item={equipped.find(i => i.slot_type === 'ring_1')} />
                            <Slot id="feet" label="Feet" icon="👢" item={equipped.find(i => i.slot_type === 'feet')} />
                            <Slot id="ring_2" label="Ring II" icon="💍" item={equipped.find(i => i.slot_type === 'ring_2')} />
                        </div>
                    </div>
                </div>

                {/* Backpack Grid */}
                <div className="w-full md:w-64 flex flex-col gap-4">
                    <h3 className="text-gold font-cinzel text-xs uppercase tracking-widest border-b border-gold/20 pb-2">Backpack</h3>
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-2 p-3 bg-black/20 rounded-lg border border-stone-800">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <BackpackSlot key={i} index={i} item={backpack.find(item => item.grid_index === i) || backpack[i]} />
                        ))}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
