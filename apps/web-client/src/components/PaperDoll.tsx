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

interface EquipSlot {
    id: string;
    label: string;
    itemName?: string;
}

interface BackpackItem {
    id: string;
    name: string;
    icon?: string;
    gridIndex: number;
}

interface PaperDollProps {
    slots?: EquipSlot[];
    backpack?: BackpackItem[];
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
                <p className="mb-2 text-xs text-ash">Mochila</p>
                <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 20 }).map((_, i) => {
                        const item = backpack.find((b) => b.gridIndex === i);
                        return (
                            <div
                                key={i}
                                className="flex aspect-square items-center justify-center rounded border border-iron/30 bg-abyss text-xs text-ash/50 transition-colors hover:border-gold/20"
                                title={item?.name}
                            >
                                {item ? "■" : "·"}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
