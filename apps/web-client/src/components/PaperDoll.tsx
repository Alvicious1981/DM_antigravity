"use client";

import React from "react";
import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { InventoryItem, Combatant } from "../hooks/useAgentState";

interface PaperDollProps {
    inventory: InventoryItem[];
    character?: Combatant;
    lastFactPacket?: Record<string, unknown> | null;
    onEquip: (itemId: string, slot: string) => void;
    onUnequip: (itemId: string) => void;
    onMoveInBackpack?: (itemId: string, newIndex: number) => void;
}

const EQUIPMENT_SLOTS = [
    { id: "head", label: "Head", position: "col-start-2 row-start-1 justify-self-center" },
    { id: "torso", label: "Chest", position: "col-start-2 row-start-2 justify-self-center" },
    { id: "neck", label: "Neck", position: "col-start-1 row-start-2 justify-self-end" },
    { id: "waist", label: "Waist", position: "col-start-3 row-start-2 justify-self-start" },
    { id: "main_hand", label: "Main", position: "col-start-1 row-start-3 justify-self-end" },
    { id: "off_hand", label: "Off", position: "col-start-3 row-start-3 justify-self-start" },
    { id: "ring_1", label: "Ring I", position: "col-start-1 row-start-4 justify-self-end" },
    { id: "feet", label: "Legs", position: "col-start-2 row-start-4 justify-self-center" },
    { id: "ring_2", label: "Ring II", position: "col-start-3 row-start-4 justify-self-start" },
] as const;

// ─── Rarity border colour ─────────────────────────────────────────────────────
function getRarityBorder(rarity = "Common") {
    switch (rarity.toLowerCase()) {
        case "uncommon": return "border-emerald-700";
        case "rare": return "border-cyan-700";
        case "very rare": return "border-purple-700";
        case "legendary": return "border-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.3)]";
        default: return "border-[#543b3f]";
    }
}

// ─── DraggableItem ────────────────────────────────────────────────────────────
function DraggableItem({ item }: { item: InventoryItem }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.instance_id,
        data: item,
    });

    const style = transform
        ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, zIndex: 100 }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            title={item.name}
            className={`
                relative w-full h-full flex items-center justify-center
                bg-[#0f0a0a] border cursor-grab active:cursor-grabbing
                transition-all duration-150
                hover:border-[#d41132] hover:shadow-[0_0_10px_rgba(212,17,50,0.25)]
                ${getRarityBorder(item.rarity)}
                ${isDragging ? "opacity-40 scale-95" : "opacity-100"}
            `}
        >
            {item.visual_asset_url ? (
                <img
                    src={item.visual_asset_url}
                    alt={item.name}
                    className="w-full h-full object-contain p-0.5 drop-shadow-md"
                />
            ) : (
                <span className="text-xl drop-shadow-md select-none">
                    {((item.stats as Record<string, unknown>)?.visual_emoji as string) || "📦"}
                </span>
            )}
            {item.attunement && (
                <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-cyan-400" />
            )}
        </div>
    );
}

// ─── Equipment Slot ───────────────────────────────────────────────────────────
function Slot({ id, label, item }: { id: string; label: string; item?: InventoryItem }) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: "slot", slot_type: id },
    });

    return (
        <div ref={setNodeRef} className="flex flex-col items-center gap-0.5">
            <div
                className={`
                    w-14 h-14 border-2 relative transition-all duration-200 rounded-sm
                    ${isOver
                        ? "border-[#cfa066] bg-[#cfa066]/10 shadow-[0_0_12px_rgba(207,160,102,0.3)]"
                        : item
                            ? "border-[#cfa066] bg-[#23181a]"
                            : "border-[#39282b] bg-[#0f0a0a] hover:border-[#543b3f]"
                    }
                `}
            >
                {item
                    ? <DraggableItem item={item} />
                    : <span className="absolute inset-0 flex items-center justify-center text-[#39282b] text-xs select-none">·</span>
                }
            </div>
            <span className="text-[9px] uppercase tracking-widest text-[#8a6a6f] font-mono">{label}</span>
        </div>
    );
}

// ─── Backpack Cell ────────────────────────────────────────────────────────────
function BackpackSlot({ index, item }: { index: number; item?: InventoryItem }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `backpack-${index}`,
        data: { type: "backpack", index },
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                aspect-square relative border rounded-sm cursor-pointer
                transition-all duration-150
                ${isOver
                    ? "border-[#cfa066] bg-[#cfa066]/10"
                    : item
                        ? "border-[#543b3f] bg-[#23181a] hover:border-[#d41132]"
                        : "border-[#2a1e20] bg-[#0a0505]"
                }
            `}
        >
            {item
                ? <DraggableItem item={item} />
                : <span className="absolute inset-0 flex items-center justify-center text-[9px] text-[#2a1e20] select-none font-mono">{index + 1}</span>
            }
        </div>
    );
}

// ─── Vitals Panel ─────────────────────────────────────────────────────────────
function VitalsPanel({ character, lastFactPacket }: { character?: Combatant; lastFactPacket?: Record<string, unknown> | null }) {
    const hpCurrent = character?.hp_current ?? 0;
    const hpMax = character?.hp_max ?? 0;
    const ac = character?.ac;
    const hpPct = hpMax > 0 ? Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100)) : 0;
    const initSign = (character?.initiative ?? 0) >= 0 ? "+" : "";

    // Ability scores from lastFactPacket.stats (same pattern as InventoryForge)
    const rawStats = (lastFactPacket?.stats as Record<string, number> | undefined) ?? {};
    const ATTRS = [
        { label: "STR", key: "str" },
        { label: "DEX", key: "dex" },
        { label: "CON", key: "con" },
        { label: "INT", key: "int" },
        { label: "WIS", key: "wis" },
        { label: "CHA", key: "cha" },
    ] as const;
    const getMod = (v: number | undefined) => v != null ? Math.floor((v - 10) / 2) : null;
    const fmtMod = (v: number | undefined) => { const m = getMod(v); return m == null ? "—" : m >= 0 ? `+${m}` : `${m}`; };
    const modColor = (v: number | undefined) => { const m = getMod(v); if (m == null) return "text-slate-600"; return m > 0 ? "text-green-500" : m < 0 ? "text-red-500" : "text-slate-500"; };

    return (
        <div className="w-44 flex-none flex flex-col gap-4 border-r border-[#39282b] pr-4">
            {/* Section label */}
            <p className="text-[9px] uppercase tracking-widest text-[#cfa066] font-mono border-b border-[#39282b] pb-1">
                Vitals
            </p>

            {/* HP */}
            <div className="bg-[#0f0a0a] p-3 border border-[#39282b] rounded-sm flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Health</span>
                    <span className="font-mono text-white text-sm font-bold">
                        {hpCurrent}<span className="text-slate-600">/{hpMax}</span>
                    </span>
                </div>
                <div className="h-1.5 bg-[#2a1e20] w-full overflow-hidden border border-black/50">
                    <div
                        className="h-full bg-[#d41132] shadow-[0_0_8px_rgba(212,17,50,0.5)] transition-all duration-500"
                        style={{ width: `${hpPct}%` }}
                    />
                </div>
            </div>

            {/* AC / Initiative */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#23181a] border border-[#39282b] p-2 flex flex-col items-center rounded-sm">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">AC</span>
                    <span className="text-lg font-bold text-[#cfa066] leading-none font-mono">{ac ?? "—"}</span>
                </div>
                <div className="bg-[#23181a] border border-[#39282b] p-2 flex flex-col items-center rounded-sm">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Init</span>
                    <span className="text-lg font-bold text-[#cfa066] leading-none font-mono">
                        {character ? `${initSign}${character.initiative}` : "—"}
                    </span>
                </div>
            </div>

            {/* Attributes — live from lastFactPacket.stats */}
            <div className="flex flex-col gap-1">
                <p className="text-[9px] uppercase tracking-widest text-[#cfa066] font-mono border-b border-[#39282b] pb-1">
                    Attributes
                </p>
                {ATTRS.map(({ label, key }) => {
                    const score = rawStats[key];
                    return (
                        <div key={label} className="flex justify-between items-center bg-[#23181a] border border-[#39282b] px-2 py-0.5 rounded-sm hover:border-[#543b3f] transition-colors">
                            <div className="flex flex-col leading-none">
                                <span className="text-white text-sm font-bold font-mono">{score ?? "—"}</span>
                                <span className="text-[9px] text-[#8a6a6f] font-mono">{label}</span>
                            </div>
                            <span className={`text-[10px] font-bold font-mono ${modColor(score)}`}>{fmtMod(score)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── PaperDoll (root export) ──────────────────────────────────────────────────
export default function PaperDoll({ inventory, character, lastFactPacket, onEquip, onUnequip }: PaperDollProps) {
    const equipped = inventory.filter((i) => i.location === "EQUIPPED");
    const backpack = inventory.filter((i) => i.location === "BACKPACK");

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const item = active.data.current as InventoryItem;
        const overData = over.data.current as { type: string; slot_type?: string };

        if (overData?.type === "slot") {
            onEquip(item.instance_id, overData.slot_type!);
        } else if (overData?.type === "backpack") {
            onUnequip(item.instance_id);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-0 py-2 text-slate-400 min-h-0 bg-[#181112] h-full">

                {/* ── LEFT: Vitals ── */}
                <VitalsPanel character={character} lastFactPacket={lastFactPacket} />

                {/* ── CENTER: Equipment Slots ── */}
                <div className="flex-1 flex flex-col gap-2 px-6 min-w-0">
                    <p className="text-[9px] uppercase tracking-widest text-[#cfa066] font-mono border-b border-[#39282b] pb-1">
                        Loadout
                    </p>

                    {/* 3-col, 4-row paper-doll grid */}
                    <div className="relative flex-1 grid grid-cols-3 grid-rows-4 gap-2 items-center">
                        {/* Silhouette background */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5SKBFKrPIlOrxhtWuEXoJqBLX64jruspBTgQBCPovyqwYx1aSg-wi8iRIjCy5csmK_O495hnl5XXRe8ms5jpZvrl0n3F-YRtRPUGy_ybaq2aHxNvBZjn7zO-pJ9gywi95YDyLifh9vuLCU53PELyvacJLhWOULZbhb0qxVG_Y7wv5SjM5dcG_W9HQMCZmLMSHLl1FPRxqVNQA4c6y7e3w2PLelg13O8d35RGwFgd2hphlJxPjzwsDvRdci37F_YrB3cSDB-pdBg"
                                alt=""
                                className="h-[90%] w-full object-contain grayscale opacity-10 contrast-125"
                                style={{ maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)" }}
                            />
                        </div>

                        {EQUIPMENT_SLOTS.map(({ id, label, position }) => (
                            <div key={id} className={`z-10 ${position}`}>
                                <Slot id={id} label={label} item={equipped.find((i) => i.slot_type === id)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: Backpack ── */}
                <div className="w-52 flex-none flex flex-col gap-2 border-l border-[#39282b] pl-4">
                    <div className="flex justify-between items-center border-b border-[#39282b] pb-1">
                        <p className="text-[9px] uppercase tracking-widest text-[#cfa066] font-mono">Backpack</p>
                        <span className="text-[9px] text-slate-600 font-mono">{backpack.length}/25</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <BackpackSlot
                                key={i}
                                index={i}
                                item={backpack.find((item) => item.grid_index === i) ?? backpack[i]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
