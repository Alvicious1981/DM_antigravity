"use client";

import { useState, useEffect } from "react";
import { useAgentState } from "@/hooks/useAgentState";
import StoryLog from "@/components/StoryLog";
import VitalsPanel from "@/components/VitalsPanel";
import InitiativeTracker from "@/components/InitiativeTracker";
import { motion, AnimatePresence } from "framer-motion";

// ──────────────────────────────────────────────────────────
// Game Page — The Triptych (§7)
// Left: StoryLog | Center: Vitals + Actions | Right: Context
// ──────────────────────────────────────────────────────────

export default function GamePage() {
    const {
        connected,
        narrative,
        currentNarrative,
        isStreaming,
        targets,
        lastFactPacket,
        lastDiceResult,
        combatants,
        currentRound,
        inventory,
        connect,
        sendAction,
        disconnect,
    } = useAgentState();

    // Demo player state
    const [playerHp, setPlayerHp] = useState(28);
    const [playerMaxHp] = useState(28);
    const [playerAc] = useState(16);

    // Enemy state (from WebSocket STATE_PATCH)
    const [enemyName, setEnemyName] = useState("Goblin");
    const [enemyHp, setEnemyHp] = useState(12);
    const [enemyMaxHp] = useState(12);
    const [enemyAc] = useState(15);

    // Sync enemy HP from WebSocket patches
    useEffect(() => {
        const goblin = targets["goblin_1"];
        if (goblin) {
            setEnemyHp(Math.max(0, goblin.hp));
        }
    }, [targets]);

    // Auto-connect on mount
    useEffect(() => {
        connect("session-001");
        // We can't immediately sendAction if ws not open.
        // But useAgentState handles queueing? No.
        // We should trigger it when connected changes to true.
        return () => disconnect();
    }, []);

    useEffect(() => {
        if (connected) {
            sendAction({ action: "get_inventory", character_id: "player_1" });
        }
    }, [connected]);

    const equippedWeapon = inventory.find(i => i.location === "main_hand");

    // Derived state for UI
    const weaponName = equippedWeapon ? equippedWeapon.name : "Unarmed Strike";
    const weaponIdToSend = equippedWeapon ? equippedWeapon.template_id : "equipment_unarmed_strike"; // SRD ID for unarmed? usually not in items.
    // "equipment_longsword" was the hardcoded default. Let's fallback to it for continuity if user hasn't equipped anything yet?
    // Or better: Unarmed. "mechanic_unarmed_strike" is not a thing usually.
    // Let's fallback to "equipment_longsword" for the "Demo Player" feel if nothing is equipped, 
    // OR better: make it explicit.

    const handleAttack = () => {
        sendAction({
            action: "attack",
            attacker_id: "player_1",
            target_id: "goblin_1",
            weapon_id: weaponIdToSend,
            attack_bonus: 5, // Should come from stats eventually
            target_ac: enemyAc,
            target_current_hp: enemyHp,
        });
    };

    const handleEquip = (itemId: string) => {
        sendAction({
            action: "equip_item",
            character_id: "player_1",
            item_id: itemId,
            slot: "main_hand"
        });
    };

    const handleUnequip = (itemId: string) => {
        sendAction({
            action: "unequip_item",
            character_id: "player_1",
            item_id: itemId
        });
    };

    const handleRoll = () => {
        sendAction({
            action: "roll",
            sides: 20,
            count: 1,
            modifier: 0,
        });
    };

    return (
        <div className="flex flex-col h-screen bg-[#0d0d0f] text-[#e0e0e4]">
            {/* Top Bar */}
            <header
                className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a2d]"
                style={{ backgroundColor: "#111113" }}
            >
                <h1
                    className="text-xl font-bold tracking-wider"
                    style={{ fontFamily: "var(--font-cinzel)", color: "#c5a059" }}
                >
                    ⚔ Dungeon Cortex
                </h1>
                <div className="flex items-center gap-3">
                    <div
                        className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                            }`}
                    />
                    <span className="text-xs text-[#6b6b75]">
                        {connected ? "Engine Conectado" : "Desconectado"}
                    </span>
                </div>
            </header>

            {/* Triptych Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT PANEL — Story Log (The Chronicle) */}
                <div className="w-[45%] border-r border-[#2a2a2d] bg-[#111113] flex flex-col">
                    <StoryLog
                        entries={narrative}
                        currentText={currentNarrative}
                        isStreaming={isStreaming}
                    />
                </div>

                {/* CENTER PANEL — Vitals + Actions */}
                <div className="w-[30%] flex flex-col bg-[#0d0d0f] p-4 space-y-4 overflow-y-auto">
                    {/* Player Vitals */}
                    <VitalsPanel
                        name="Aventurero"
                        hp={playerHp}
                        maxHp={playerMaxHp}
                        ac={playerAc}
                        conditions={[]}
                        lastRoll={
                            lastDiceResult
                                ? {
                                    notation: lastDiceResult.notation,
                                    total: lastDiceResult.total,
                                }
                                : null
                        }
                    />

                    {/* Enemy Vitals */}
                    <VitalsPanel
                        name={enemyName}
                        hp={enemyHp}
                        maxHp={enemyMaxHp}
                        ac={enemyAc}
                        conditions={enemyHp <= 0 ? ["muerto"] : []}
                    />

                    {/* Action Buttons */}
                    <div className="space-y-2 mt-auto">
                        <button
                            onClick={handleAttack}
                            disabled={!connected || isStreaming || enemyHp <= 0}
                            className="w-full py-3 px-4 rounded-lg font-bold text-sm tracking-wider uppercase transition-all duration-200
                       bg-gradient-to-r from-[#8b2500] to-[#c0392b]
                       hover:from-[#a52d00] hover:to-[#e74c3c]
                       disabled:opacity-40 disabled:cursor-not-allowed
                       border border-[#c0392b]/30
                       shadow-[0_0_20px_rgba(192,57,43,0.2)]"
                        >
                            ⚔ Atacar con {weaponName}
                        </button>

                        <button
                            onClick={handleRoll}
                            disabled={!connected || isStreaming}
                            className="w-full py-2.5 px-4 rounded-lg font-medium text-sm tracking-wider transition-all duration-200
                       bg-[#1a1a1d] hover:bg-[#2a2a2d]
                       border border-[#c5a059]/30
                       text-[#c5a059]
                       disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            🎲 Tirar d20
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2a2a2d]">
                            <button
                                onClick={() => sendAction({
                                    action: "cast_spell",
                                    spell_id: "spell_fireball",
                                    attacker_id: "Aventurero",
                                    target_id: "goblin_1",
                                    save_dc: 15, // Caster-dependent
                                    target_save_bonus: 2 // Target-dependent
                                })}
                                disabled={!connected || isStreaming}
                                className="py-2 px-2 rounded font-bold text-xs uppercase tracking-wide bg-[#e74c3c]/10 text-[#e74c3c] border border-[#e74c3c]/30 hover:bg-[#e74c3c]/20"
                            >
                                🔥 Fireball
                            </button>
                            <button
                                onClick={() => sendAction({
                                    action: "roll_initiative",
                                    combatant_id: "player_1",
                                    name: "Aventurero",
                                    dex_modifier: 2,
                                    is_player: true
                                })}
                                disabled={!connected || isStreaming}
                                className="py-2 px-2 rounded font-bold text-xs uppercase tracking-wide bg-[#3498db]/10 text-[#3498db] border border-[#3498db]/30 hover:bg-[#3498db]/20"
                            >
                                ⚡ Iniciativa
                            </button>
                            <button
                                onClick={() => sendAction({ action: "start_combat" })}
                                disabled={!connected || isStreaming}
                                className="py-2 px-2 rounded font-bold text-xs uppercase tracking-wide bg-[#f1c40f]/10 text-[#f1c40f] border border-[#f1c40f]/30 hover:bg-[#f1c40f]/20"
                            >
                                ⚔ Start
                            </button>
                            <button
                                onClick={() => sendAction({ action: "generate_loot", cr: 2, character_id: "player_1" })}
                                disabled={!connected || isStreaming}
                                className="py-2 px-2 rounded font-bold text-xs uppercase tracking-wide bg-[#9b59b6]/10 text-[#9b59b6] border border-[#9b59b6]/30 hover:bg-[#9b59b6]/20"
                            >
                                🎁 Loot
                            </button>
                        </div>

                        {!connected && (
                            <button
                                onClick={() => connect("session-001")}
                                className="w-full py-2.5 px-4 rounded-lg font-medium text-sm tracking-wider transition-all duration-200
                         bg-[#1a1a1d] hover:bg-[#2a2a2d]
                         border border-green-500/30
                         text-green-500"
                            >
                                🔌 Reconectar
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL — Context (Grimorio) */}
                <div className="w-[25%] border-l border-[#2a2a2d] bg-[#111113] p-4 space-y-4 overflow-y-auto">
                    <h2
                        className="text-sm font-semibold tracking-widest uppercase"
                        style={{ color: "#c5a059" }}
                    >
                        Grimorio
                    </h2>

                    {/* Initiative Tracker */}
                    <InitiativeTracker
                        combatants={combatants}
                        currentRound={currentRound}
                    />

                    {/* Last Fact Packet Display */}
                    {lastFactPacket && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border border-[#2a2a2d] bg-[#1a1a1d] p-3 space-y-2"
                        >
                            <p className="text-[10px] font-bold tracking-widest uppercase text-[#6b6b75]">
                                Último Resultado
                            </p>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[#6b6b75]">Tirada Natural</span>
                                    <span className="text-[#c5a059] font-bold">
                                        {String(lastFactPacket.roll_natural)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6b6b75]">Total</span>
                                    <span className="text-[#b0b0b8] font-bold">
                                        {String(lastFactPacket.roll_total)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6b6b75]">Impacto</span>
                                    <span
                                        className="font-bold"
                                        style={{
                                            color: lastFactPacket.hit ? "#22c55e" : "#ef4444",
                                        }}
                                    >
                                        {lastFactPacket.hit ? "✓ SÍ" : "✗ NO"}
                                    </span>
                                </div>
                                {lastFactPacket.hit && (
                                    <div className="flex justify-between">
                                        <span className="text-[#6b6b75]">Daño</span>
                                        <span className="text-[#e74c3c] font-bold">
                                            {String(lastFactPacket.damage_total)}{" "}
                                            {String(lastFactPacket.damage_type)}
                                        </span>
                                    </div>
                                )}
                                {lastFactPacket.critical && (
                                    <div className="text-center mt-2">
                                        <span className="px-2 py-1 rounded bg-[#c5a059]/20 text-[#c5a059] text-[10px] font-bold uppercase tracking-widest">
                                            ★ Golpe Crítico ★
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Engine Status */}
                    <div className="rounded-lg border border-[#2a2a2d] bg-[#1a1a1d] p-3 space-y-2">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#6b6b75]">
                            Estado de la Sesión
                        </p>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[#6b6b75]">Motor</span>
                                <span className={connected ? "text-green-500" : "text-red-500"}>
                                    {connected ? "Activo" : "Inactivo"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#6b6b75]">Eventos</span>
                                <span className="text-[#b0b0b8]">{narrative.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* SRD Reference Placeholder */}
                    {/* Inventory */}
                    <div className="rounded-lg border border-[#2a2a2d] bg-[#1a1a1d] p-3 space-y-2 max-h-60 overflow-y-auto">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#6b6b75]">
                            Inventario ({inventory.length})
                        </p>
                        <div className="space-y-1 text-xs">
                            {inventory.length === 0 ? (
                                <span className="text-[#6b6b75] italic">Vacío...</span>
                            ) : (
                                inventory.map((item) => (
                                    <div key={item.instance_id} className="flex justify-between items-center group p-1 hover:bg-[#2a2a2d] rounded cursor-default">
                                        <div className="flex flex-col">
                                            <span className={`transition-colors ${item.location === 'main_hand' ? 'text-green-500 font-bold' : 'text-[#b0b0b8] group-hover:text-white'}`}>
                                                {item.name}
                                                {item.location === 'main_hand' && " (E)"}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.location === 'main_hand' ? (
                                                <button
                                                    onClick={() => handleUnequip(item.instance_id)}
                                                    className="text-[10px] uppercase text-red-400 hover:text-red-300 border border-red-500/30 px-1 rounded"
                                                >
                                                    Unequip
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEquip(item.instance_id)}
                                                    className="text-[10px] uppercase text-green-400 hover:text-green-300 border border-green-500/30 px-1 rounded"
                                                >
                                                    Equip
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
