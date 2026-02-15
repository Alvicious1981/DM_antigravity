"use client";

/**
 * PaperDoll — Positional Inventory System (Manifesto §7.3.C)
 *
 * Displays character silhouette with equipment slots + backpack grid.
 * All interaction is Drag-and-Drop via @dnd-kit.
 * Emits events to backend for validation (Optimistic UI pattern §6.2).
 *
 * TODO Phase 4: Implement full dnd-kit drag/drop with slot validation
 * TODO Phase 4: Connect to AG-UI STATE_PATCH for confirmed/reverted states
 * TODO Phase 4: Visual Vault generated item icons
 */

import { InventoryItem } from "../hooks/useAgentState";

interface EquipSlot {
    id: string;
    label: string;
    itemName?: string;
}

interface PaperDollProps {
    slots?: EquipSlot[];
    backpack?: InventoryItem[];
}

const DEFAULT_SLOTS: EquipSlot[] = [
    { id: "head", label: "Cabeza" },
    { id: "torso", label: "Torso" },
    { id: "main_hand", label: "Mano Principal" },
    { id: "off_hand", label: "Mano Secundaria" },
    { id: "feet", label: "Pies" },
    { id: "ring_1", label: "Anillo I" },
    { id: "ring_2", label: "Anillo II" },
    { id: "amulet", label: "Amuleto" },
];

export default function PaperDoll({
    slots = DEFAULT_SLOTS,
    backpack = [],
}: PaperDollProps) {
    const getRarityStyle = (rarity: string = "Common") => {
        switch (rarity.toLowerCase()) {
            case "uncommon": return "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 hover:border-emerald-500";
            case "rare": return "border-cyan-500/50 bg-cyan-500/10 text-cyan-500 hover:border-cyan-500";
            case "very rare": return "border-purple-500/50 bg-purple-500/10 text-purple-500 hover:border-purple-500";
            case "legendary": return "border-orange-500/50 bg-orange-500/10 text-orange-500 hover:border-orange-500";
            case "artifact": return "border-red-500/50 bg-red-500/10 text-red-500 hover:border-red-500";
            default: return "border-iron/30 bg-abyss text-ash/20 hover:border-iron/50";
        }
    };

    return (
        <div
            id="paper-doll"
            className="flex flex-col gap-4 rounded-lg border border-iron bg-obsidian/60 p-4 backdrop-blur-sm"
        >
            <h2
                className="text-sm font-bold uppercase tracking-widest text-gold/60"
                style={{ fontFamily: "var(--font-cinzel)" }}
            >
                Equipamiento
            </h2>

            {/* Equipment Slots */}
            <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                    <div
                        key={slot.id}
                        className="flex items-center gap-2 rounded border border-iron/50 bg-abyss px-3 py-2 text-xs transition-colors hover:border-gold/30"
                    >
                        <span className="text-ash">{slot.label}:</span>
                        <span className="text-bone">
                            {slot.itemName || "—"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Backpack Grid (20 slots) */}
            <div>
                <p className="mb-2 text-xs text-ash">Mochila ({backpack.length}/20)</p>
                <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 20 }).map((_, i) => {
                        const item = backpack[i]; // Simple sequential filling for now
                        return (
                            <div
                                key={i}
                                className={`relative flex aspect-square items-center justify-center rounded border text-xs transition-colors ${item
                                    ? getRarityStyle(item.rarity)
                                    : "border-iron/30 bg-abyss text-ash/20"
                                    }`}
                                title={item?.name}
                            >
                                {item?.attunement && (
                                    <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_cyan]" title="Requires Attunement" />
                                )}
                                {item ? (
                                    (item.stats as any)?.visual_asset_url ? (
                                        <img src={(item.stats as any).visual_asset_url} alt={item.name} className="w-full h-full object-cover rounded" />
                                    ) : "📦"
                                ) : "·"}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
