import React, { useMemo } from 'react';
import { useAgentState, InventoryItem as GameInventoryItem } from '../../hooks/useAgentState';
import { InventoryItem as StitchInventoryItem, EquipmentSlot as StitchEquipmentSlot } from '../../data/stitch/inventoryForgeData';

export interface InventoryForgeProps {
    onClose?: () => void;
}

export function InventoryForge({
    onClose
}: InventoryForgeProps) {
    const {
        inventory,
        combatants,
        equipItem,
        unequipItem,
        lastFactPacket
    } = useAgentState() as any;

    const player = useMemo(() => combatants.find((c: any) => c.isPlayer), [combatants]);

    const stats = (lastFactPacket?.stats as any) || {
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    };

    const getModifierValue = (val: number) => Math.floor((val - 10) / 2);
    const formatModifier = (val: number) => {
        const mod = getModifierValue(val);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };
    const getModifierColor = (val: number) => {
        const mod = getModifierValue(val);
        if (mod > 0) return 'text-green-500';
        if (mod < 0) return 'text-red-500';
        return 'text-slate-500';
    };

    const attributes = [
        { label: 'STR', value: stats.str, modifier: formatModifier(stats.str), modifierColor: getModifierColor(stats.str) },
        { label: 'DEX', value: stats.dex, modifier: formatModifier(stats.dex), modifierColor: getModifierColor(stats.dex) },
        { label: 'CON', value: stats.con, modifier: formatModifier(stats.con), modifierColor: getModifierColor(stats.con) },
        { label: 'INT', value: stats.int, modifier: formatModifier(stats.int), modifierColor: getModifierColor(stats.int) },
        { label: 'WIS', value: stats.wis, modifier: formatModifier(stats.wis), modifierColor: getModifierColor(stats.wis) },
        { label: 'CHA', value: stats.cha, modifier: formatModifier(stats.cha), modifierColor: getModifierColor(stats.cha) }
    ];

    const mapItem = (item: GameInventoryItem): StitchInventoryItem => ({
        id: item.instance_id,
        name: item.name,
        count: item.charges > 1 ? item.charges : undefined,
        icon: item.visual_asset_url || (item.slot_type === 'weapon' ? 'swords' : 'package'),
        type: item.visual_asset_url ? 'image' : 'symbol',
        rarity: (item.rarity?.toLowerCase() as any) || 'common'
    });

    const equipped = inventory.filter((i: any) => i.location === 'EQUIPPED');
    const backpack = inventory.filter((i: any) => i.location !== 'EQUIPPED');

    const getEquipmentSlot = (slotType: string, label: string): StitchEquipmentSlot => {
        const item = equipped.find((i: any) => i.slot_type === slotType);
        return {
            id: slotType,
            label: label,
            isEmpty: !item,
            item: item ? mapItem(item) : undefined
        };
    };

    const equipment = {
        head: getEquipmentSlot('head', 'Head'),
        chest: getEquipmentSlot('chest', 'Chest'),
        arms: getEquipmentSlot('arms', 'Arms'),
        weapon: getEquipmentSlot('weapon', 'Main Hand'),
        shield: getEquipmentSlot('shield', 'Off Hand'),
        legs: getEquipmentSlot('legs', 'Legs')
    };

    const backpackItems = useMemo(() => {
        const items = backpack.map(mapItem);
        return [...items, ...Array(Math.max(0, 25 - items.length)).fill(null)];
    }, [backpack]);

    const renderItemIcon = (item?: StitchInventoryItem) => {
        if (!item) return null;
        if (item.type === 'image') {
            return <img className="w-full h-full object-contain drop-shadow-lg" src={item.icon} alt={item.name} />;
        }
        return <span className="material-symbols-outlined text-slate-300 text-4xl drop-shadow-md">{item.icon}</span>;
    };

    return (
        <div className="relative flex h-screen w-full flex-col bg-[#181112] text-slate-100 font-display overflow-hidden select-none">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

            {/* Header */}
            <header className="flex-none flex items-center justify-between border-b-2 border-[#39282b] bg-[#1f1516]/90 px-8 py-4 shadow-lg z-20 relative">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-[#39282b] to-[#181112] border border-[#543b3f] rounded shadow-metal-rim">
                        <span className="material-symbols-outlined text-[#d41132] text-2xl">swords</span>
                    </div>
                    <div>
                        <h2 className="text-[#e2d5d7] text-2xl font-bold tracking-widest uppercase text-shadow-sm">{player?.name || 'Unnamed Adventurer'}</h2>
                        <p className="text-[#8a6a6f] text-sm font-medium tracking-wide">Level {player?.id === 'player_1' ? '1' : '?'} Character</p>
                    </div>
                </div>
                <div className="flex gap-6 items-center">
                    <div className="flex flex-col items-end">
                        <span className="text-[#cfa066] text-lg font-bold">0 GP</span>
                        <span className="text-[#8a8d91] text-xs uppercase tracking-wider">Gold</span>
                    </div>
                    <div className="h-10 w-px bg-[#39282b]"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-slate-300 text-lg font-bold">{inventory.length}</span>
                        <span className="text-[#8a8d91] text-xs uppercase tracking-wider">Items Carried</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area: 3 Columns */}
            <main className="flex-1 flex overflow-hidden relative z-10">

                {/* LEFT COLUMN: Vitals & Attributes */}
                <section className="w-1/4 min-w-[300px] flex flex-col border-r-4 border-[#120c0d] bg-[#1a1213]/80 relative shadow-2xl overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Vitals */}
                    <div className="space-y-4">
                        <h3 className="text-[#cfa066] uppercase text-sm tracking-widest font-bold border-b border-[#39282b] pb-1 w-full">Vitals</h3>
                        <div className="flex items-center gap-4 bg-[#0f0a0a] p-4 rounded border border-[#39282b] shadow-inset-deep">
                            <div className="relative size-16 flex items-center justify-center rounded-full border-4 border-[#2a1e20] bg-[#181112] shadow-metal-rim">
                                <span className="material-symbols-outlined text-[#d41132] text-3xl z-10">favorite</span>
                                <div
                                    className="absolute bottom-0 w-full bg-[#d41132]/20 rounded-b-full"
                                    style={{ height: `${((player?.hp_current || 0) / (player?.hp_max || 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-slate-400 text-xs uppercase font-bold">Health Points</span>
                                    <span className="text-white font-bold text-xl">{player?.hp_current}<span className="text-slate-500 text-sm">/{player?.hp_max}</span></span>
                                </div>
                                <div className="w-full bg-[#2a1e20] h-2 mt-2 rounded-full overflow-hidden border border-black/50">
                                    <div
                                        className="bg-[#d41132] h-full shadow-[0_0_10px_rgba(212,17,50,0.6)]"
                                        style={{ width: `${((player?.hp_current || 0) / (player?.hp_max || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attributes */}
                    <div className="space-y-4">
                        <h3 className="text-[#cfa066] uppercase text-sm tracking-widest font-bold border-b border-[#39282b] pb-1">Attributes</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {attributes.map((attr) => (
                                <div key={attr.label} className="bg-[#23181a] p-2 border border-[#39282b] flex items-center justify-between shadow-sm hover:border-[#543b3f] transition-colors cursor-help">
                                    <div className="flex flex-col">
                                        <span className="text-white text-xl font-bold leading-none">{attr.value}</span>
                                        <span className="text-[#8a6a6f] text-xs font-bold uppercase tracking-wider">{attr.label}</span>
                                    </div>
                                    <span className={`${attr.modifierColor} text-sm font-bold`}>{attr.modifier}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Defenses */}
                    <div className="bg-[#23181a] p-3 border border-[#39282b] flex justify-around items-center rounded-sm">
                        <div className="text-center">
                            <span className="block text-[#8a8d91] text-xs uppercase mb-1 font-bold">Armor Class</span>
                            <div className="relative inline-flex items-center justify-center size-12 bg-[#0f0a0a] border-2 border-[#543b3f] rounded-full shadow-metal-rim">
                                <span className="material-symbols-outlined text-[#543b3f] absolute opacity-30 text-4xl">shield</span>
                                <span className="text-white font-bold text-xl relative z-10">{player?.ac}</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-[#39282b]"></div>
                        <div className="text-center">
                            <span className="block text-[#8a8d91] text-xs uppercase mb-1 font-bold">Initiative</span>
                            <span className="text-white font-bold text-xl block">{(player?.initiative ?? 0) >= 0 ? `+${player?.initiative}` : player?.initiative}</span>
                        </div>
                        <div className="w-px h-10 bg-[#39282b]"></div>
                        <div className="text-center">
                            <span className="block text-[#8a8d91] text-xs uppercase mb-1 font-bold">Speed</span>
                            <span className="text-white font-bold text-xl block">30</span>
                        </div>
                    </div>
                </section>

                {/* MIDDLE COLUMN: Paperdoll / Character */}
                <section className="flex-1 min-w-[400px] relative flex flex-col items-center justify-center p-8 bg-[#130d0e]">
                    <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black via-[#1a0508] to-transparent opacity-60 pointer-events-none" />

                    <div className="relative w-full max-w-lg h-full flex flex-col items-center justify-center">
                        {/* Character Silhouette */}
                        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-80 pointer-events-none">
                            <div className="h-[80%] w-auto aspect-[1/2] bg-black rounded-full blur-xl absolute opacity-60 translate-y-10" />
                            <img
                                className="h-[85%] w-full object-contain object-center drop-shadow-2xl grayscale contrast-125 brightness-75"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5SKBFKrPIlOrxhtWuEXoJqBLX64jruspBTgQBCPovyqwYx1aSg-wi8iRIjCy5csmK_O495hnl5XXRe8ms5jpZvrl0n3F-YRtRPUGy_ybaq2aHxNvBZjn7zO-pJ9gywi95YDyLifh9vuLCU53PELyvacJLhWOULZbhb0qxVG_Y7wv5SjM5dcG_W9HQMCZmLMSHLl1FPRxqVNQA4c6y7e3w2PLelg13O8d35RGwFgd2hphlJxPjzwsDvRdci37F_YrB3cSDB-pdBg"
                                alt="Character Silhouette"
                                style={{ maskImage: "linear-gradient(to bottom, black 80%, transparent 100%)" }}
                            />
                        </div>

                        {/* Equipment Slots */}
                        <div className="z-10 w-full h-full relative">

                            {/* HEAD */}
                            <EquipmentSlot
                                slot={equipment.head}
                                className="top-[5%] left-1/2 -translate-x-1/2"
                                onUnequip={() => equipment.head.item && unequipItem(equipment.head.item.id)}
                            />

                            {/* CHEST */}
                            <EquipmentSlot
                                slot={equipment.chest}
                                className="top-[25%] left-[20%]"
                                showLine="right"
                                onUnequip={() => equipment.chest.item && unequipItem(equipment.chest.item.id)}
                            />

                            {/* ARMS */}
                            <EquipmentSlot
                                slot={equipment.arms}
                                className="top-[25%] right-[20%]"
                                showLine="left"
                                onUnequip={() => equipment.arms.item && unequipItem(equipment.arms.item.id)}
                            />

                            {/* MAIN HAND */}
                            <EquipmentSlot
                                slot={equipment.weapon}
                                className="top-[50%] left-[10%]"
                                size="large"
                                label="Main"
                                onUnequip={() => equipment.weapon.item && unequipItem(equipment.weapon.item.id)}
                            />

                            {/* OFF HAND */}
                            <EquipmentSlot
                                slot={equipment.shield}
                                className="top-[50%] right-[10%]"
                                size="large"
                                label="Off"
                                onUnequip={() => equipment.shield.item && unequipItem(equipment.shield.item.id)}
                            />

                            {/* LEGS */}
                            <EquipmentSlot
                                slot={equipment.legs}
                                className="bottom-[15%] left-1/2 -translate-x-1/2"
                                showLine="top"
                                onUnequip={() => equipment.legs.item && unequipItem(equipment.legs.item.id)}
                            />

                        </div>
                    </div>
                </section>

                {/* RIGHT COLUMN: Backpack */}
                <section className="w-1/3 min-w-[340px] flex flex-col border-l-4 border-[#120c0d] bg-[#1a1213]/90 relative shadow-2xl">
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-[#39282b] flex justify-between items-center bg-[#23181a]">
                            <h3 className="text-[#cfa066] uppercase text-sm tracking-widest font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">backpack</span> Backpack
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-[#39282b] rounded text-[#8a8d91] transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
                                <button className="p-1 hover:bg-[#39282b] rounded text-[#8a8d91] transition-colors"><span className="material-symbols-outlined">sort</span></button>
                            </div>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-5 gap-3 auto-rows-fr aspect-square">
                                {backpackItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (item) {
                                                // Default to weapon slot for weapons, chest for armor, etc.
                                                const slot = item.icon === 'swords' ? 'weapon' : 'chest';
                                                equipItem(item.id, slot);
                                            }
                                        }}
                                        className={`aspect-square rounded-sm relative group cursor-pointer transition-all ${item
                                            ? 'bg-[#23181a] border border-[#543b3f] hover:border-[#d41132] hover:shadow-[0_0_10px_rgba(212,17,50,0.3)]'
                                            : 'bg-[#0a0505] border border-[#2a1e20] shadow-inset-deep'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay" />
                                        {item && (
                                            <>
                                                <div className="h-full w-full flex items-center justify-center p-1">
                                                    {renderItemIcon(item)}
                                                </div>
                                                {item.count && (
                                                    <span className="absolute bottom-0.5 right-0.5 text-[10px] font-bold text-white bg-black/60 px-1 rounded-sm">x{item.count}</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#39282b] bg-[#23181a]">
                            <button
                                onClick={onClose}
                                className="w-full relative group h-14 flex items-center justify-center overflow-hidden rounded bg-[#1f1a1b] shadow-lg border-2 border-[#3d3d3d] transition-all hover:border-[#d41132] hover:shadow-[0_0_20px_rgba(212,17,50,0.4)] active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-iron-texture opacity-80 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10 text-slate-300 font-bold text-lg uppercase tracking-widest group-hover:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined">close</span> Cerrar
                                </span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Global Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-50" />
        </div>
    );
}

function EquipmentSlot({
    slot,
    className = "",
    size = "normal",
    label = "",
    showLine = null,
    onUnequip
}: {
    slot: StitchEquipmentSlot,
    className?: string,
    size?: "normal" | "large",
    label?: string,
    showLine?: "left" | "right" | "top" | null,
    onUnequip?: () => void
}) {
    const isLarge = size === "large";

    return (
        <div
            className={`absolute flex flex-col items-center gap-2 group cursor-pointer ${className}`}
            onClick={() => !slot.isEmpty && onUnequip?.()}
        >
            <div className={`${isLarge ? 'size-20' : 'size-16'} bg-[#0f0a0a] border-2 rounded-sm shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105 group-hover:border-[#d41132] ${slot.isEmpty ? 'border-[#543b3f] opacity-70' : 'border-[#cfa066]'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#cfa066]/10 to-transparent" />
                {slot.item ? (
                    <div className="h-full w-full flex items-center justify-center p-1">
                        {slot.item.type === 'image' ? (
                            <img
                                className={`${isLarge ? 'w-14 h-14' : 'w-10 h-10'} object-contain opacity-90 transition-opacity group-hover:opacity-100`}
                                src={slot.item.icon}
                                alt={slot.item.name}
                            />
                        ) : (
                            <span className="material-symbols-outlined text-slate-300 text-3xl drop-shadow-md">
                                {slot.item.icon}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="material-symbols-outlined text-[#39282b] text-3xl font-bold">
                        {slot.id === 'head' ? 'person' :
                            slot.id === 'chest' ? 'checkroom' :
                                slot.id === 'arms' ? 'pan_tool' :
                                    slot.id === 'weapon' ? 'swords' :
                                        slot.id === 'shield' ? 'shield' : 'vertical_align_bottom'}
                    </span>
                )}
                {label && <div className="absolute bottom-0 right-0 bg-[#39282b] text-white text-[10px] px-1 font-bold">{label}</div>}
            </div>
            <span className={`text-xs uppercase tracking-widest bg-black/80 px-2 py-0.5 rounded border border-[#39282b] font-bold ${slot.isEmpty ? 'text-[#8a8d91]' : 'text-[#cfa066]'}`}>
                {slot.label}
            </span>

            {showLine === 'right' && <div className="absolute top-8 left-full w-12 h-px bg-[#8a8d91] opacity-50 pointer-events-none" />}
            {showLine === 'left' && <div className="absolute top-8 right-full w-12 h-px bg-[#8a8d91] opacity-50 pointer-events-none" />}
            {showLine === 'top' && <div className="absolute bottom-full left-1/2 w-px h-12 bg-[#8a8d91] opacity-50 pointer-events-none" />}
        </div>
    );
}
