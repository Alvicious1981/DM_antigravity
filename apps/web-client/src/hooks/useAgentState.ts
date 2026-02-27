"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SpellId, CombatantId, SessionId, CharacterId, asSessionId } from "../domain/types";
import { dispatchMessage } from "./socketHandlers";

// ──────────────────────────────────────────────────────────
// AG-UI Protocol Types (§6)
// ──────────────────────────────────────────────────────────

export interface AgUiEvent {
    type: string;
    [key: string]: unknown;
}

export interface LogEvent {
    type: "LOG";
    message: string;
    level: "info" | "warning" | "error";
}

export interface NarrativeChunk {
    type: "NARRATIVE_CHUNK";
    content: string;
    index: number;
    done: boolean;
}

export interface NarrativeEvent {
    type: "NARRATIVE_EVENT";
    content: string;
    event_type: "travel" | "discovery" | "encounter";
    metadata?: Record<string, unknown>;
}

export interface StatePatch {
    type: "STATE_PATCH";
    patches: Array<{ op: string; path: string; value: unknown }>;
    fact_packet?: Record<string, unknown>;
}

export interface DiceResult {
    type: "DICE_RESULT";
    notation: string;
    rolls: number[];
    total: number;
}

export interface ActiveCondition {
    condition_id: string;
    source_id?: string;
    duration_rounds: number;
    save_ends_dc?: number;
    save_stat?: string;
}

export interface Combatant {
    id: CombatantId;
    name: string;
    initiative: number;
    active: boolean;
    current?: boolean;
    isPlayer?: boolean;
    hp_max?: number;
    hp_current?: number;
    ac?: number;
    actions?: Array<{
        name: string;
        desc: string;
        attack_bonus: number;
        damage_dice_count?: number;
        damage_dice_sides?: number;
        damage_modifier?: number;
        damage_type?: string;
    }>;
    // Support both string IDs (legacy/simple) and full ActiveCondition objects
    conditions?: Array<string | ActiveCondition>;
    position?: number;
}

export interface Spell {
    id: SpellId;
    name: string;
    level: number;
    school: string;
    casting_time: string;
    range: string;
    components: string;
    duration: string;
    description: string;
    is_attack: boolean;
    is_save: boolean;
    save_stat?: string;
    damage_dice_sides: number;
    damage_dice_count: number;
    damage_type: string;
    aoe_radius: number;
    // Localization
    name_es?: string;
    description_es?: string;
}

export interface InitiativeUpdate {
    type: "INITIATIVE_UPDATE";
    combatants: Combatant[];
    round?: number;
}

export interface InventoryItem {
    instance_id: string;
    template_id: string;
    name: string;
    location: string;
    slot_type: string | null;
    grid_index: number | null;
    charges: number;
    stats: Record<string, unknown>;
    rarity?: string;
    attunement?: boolean;
    visual_asset_url?: string;
}

export interface InventoryUpdate {
    type: "INVENTORY_UPDATE";
    character_id: CharacterId;
    items: InventoryItem[];
}

export interface SpellBookUpdate {
    type: "SPELL_BOOK_UPDATE";
    character_id: CharacterId;
    spells: Spell[];
}

export interface MonsterSearchResult {
    id: string;
    name: string;
    cr: number;
    type: string;
    hp: number;
    ac: number;
}

export interface MonsterSearchEvent {
    type: "MONSTER_SEARCH_RESULTS";
    results: MonsterSearchResult[];
}

export interface ShowWidget {
    type: "SHOW_WIDGET";
    widget_type: "LOOT_MODAL" | "CHARACTER_CARD" | "COMBAT_FEEDBACK";
    data: Record<string, unknown>;
}

export interface MapNode {
    id: string;
    name: string;
    type: string;
    coordinates: { x: number; y: number };
    description: string;
    connections: string[];
    risk_level: number;
}

export interface MapDataEvent {
    type: "MAP_DATA";
    nodes: MapNode[];
    current_node_id: string;
}

export interface GoldUpdate {
    type: "GOLD_UPDATE";
    character_id: CharacterId;
    gold: number;
    delta: number;
}

export interface ShopItem {
    rarity: string;
    buy_price: number;
}

export interface ShopInventory {
    node_id: string;
    node_type: string;
    has_shop: boolean;
    items: ShopItem[];
}

export interface SaveInfo {
    save_id: string;
    created_at: string;
    character_name: string;
    character_class: string;
    level: number;
    location: string;
}

export interface GameState {
    connected: boolean;
    sessionId: SessionId | null;
    /** CharacterId provisioned by the server on CONNECTION_ESTABLISHED. Never hardcode "player_1". */
    myCharacterId: CharacterId | null;
    role: "dm" | "player";
    narrative: string[];
    currentNarrative: string;
    isStreaming: boolean;
    targets: Record<string, { hp: number; status: string; ac?: number; conditions?: string[] }>;

    lastFactPacket: Record<string, unknown> | null;
    lastDiceResult: DiceResult | null;
    combatants: Combatant[];
    currentRound: number;
    inventory: InventoryItem[];
    spells: Spell[];
    monsterSearchResults: MonsterSearchResult[];
    activeWidgets: ShowWidget[];
    mapState: {
        selectedCell: number | null;
        lastInteraction: { cell: number; type: string; character: string } | null;
        nodes: MapNode[];
        currentNodeId: string | null;
    };
    saveList: SaveInfo[];
    toasts: LogEvent[];
    visitedNodeIds: string[];
    screenShake: boolean;
    selectedTargetId: string | null;
    gold: number;
    shopInventory: ShopInventory | null;
}

// SaveInfo is now defined above to match the rich backend schema

export function useAgentState(wsUrl?: string) {
    const [gameState, setGameState] = useState<GameState>({
        connected: false,
        sessionId: null,
        myCharacterId: null,
        role: "player",
        narrative: [],
        currentNarrative: "",
        isStreaming: false,
        targets: {},
        lastFactPacket: null,
        lastDiceResult: null,
        combatants: [],
        currentRound: 0,
        inventory: [],
        spells: [],
        monsterSearchResults: [],
        activeWidgets: [],
        mapState: {
            selectedCell: null,
            lastInteraction: null,
            nodes: [],
            currentNodeId: null
        },
        saveList: [],
        toasts: [],
        visitedNodeIds: [],
        screenShake: false,
        selectedTargetId: null,
        gold: 0,
        shopInventory: null,
    });

    /**
     * Resolve the authoritative CharacterId for the current player.
     * Priority: server-provisioned myCharacterId > first isPlayer combatant > session-scoped fallback.
     * NEVER hardcode "player_1".
     */
    const getMyCharacterId = useCallback((): string => {
        if (gameState.myCharacterId) return gameState.myCharacterId;
        const playerCombatant = gameState.combatants.find(c => c.isPlayer);
        if (playerCombatant) return playerCombatant.id;
        // Last-resort: derive from session so at least distinct per session
        return sessionIdRef.current ? `player_${sessionIdRef.current}` : "player_unknown";
    }, [gameState.myCharacterId, gameState.combatants]);

    const wsRef = useRef<WebSocket | null>(null);
    const narrativeBufferRef = useRef<string>("");
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);
    const sessionIdRef = useRef<string>("default");
    const roleRef = useRef<string>("player");

    const onConnectionEstablished = useCallback((event: AgUiEvent) => {
        reconnectAttemptsRef.current = 0;
        // Server provisions character_id on CONNECTION_ESTABLISHED — store it as source of truth
        const serverCharacterId = event.character_id as string | undefined;
        setGameState(prev => ({
            ...prev,
            connected: true,
            sessionId: asSessionId(event.session_id as string),
            role: (event.role as "dm" | "player") || "player",
            myCharacterId: serverCharacterId ? (serverCharacterId as CharacterId) : prev.myCharacterId,
        }));
    }, []);

    const connect = useCallback(
        (id: string = "default", role: string = "player", dmToken?: string) => {
            const sessionId = asSessionId(id);
            sessionIdRef.current = id;
            roleRef.current = role;
            let url = wsUrl;
            if (!url) {
                const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                url = `ws://${host}:8000/ws/game/${sessionId}`;
            }

            // Append role and token if provided
            const params = new URLSearchParams();
            if (role) params.append("role", role);
            if (dmToken) params.append("dm_token", dmToken);
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                return;
            }

            const ws = new WebSocket(url);

            ws.onopen = () => {
                // Send a connection request to the server
                ws.send(JSON.stringify({ type: "CONNECTION_REQUEST", session_id: sessionId }));
            };

            ws.onmessage = (event) => {
                const data: AgUiEvent = JSON.parse(event.data);
                if (data.type === "CONNECTION_ESTABLISHED") {
                    onConnectionEstablished(data);
                } else {
                    const updater = dispatchMessage(data, narrativeBufferRef);
                    setGameState(updater);
                }
            };

            ws.onclose = () => {
                setGameState((prev) => ({ ...prev, connected: false }));
                const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000);
                reconnectAttemptsRef.current += 1;
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect(sessionIdRef.current, roleRef.current);
                }, delay);
            };

            ws.onerror = () => {
                setGameState((prev) => ({ ...prev, connected: false }));
            };

            wsRef.current = ws;
        },
        [wsUrl, onConnectionEstablished]
    );

    const sendAction = useCallback((action: Record<string, unknown>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(action));
        }
    }, []);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current !== null) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        reconnectAttemptsRef.current = 0;
        wsRef.current?.close();
        wsRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (reconnectTimeoutRef.current !== null) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
    }, []);

    const getSpells = useCallback(() => {
        if (!wsRef.current) return;
        wsRef.current.send(JSON.stringify({
            type: "get_spells",
            character_id: getMyCharacterId()
        }));
    }, [getMyCharacterId]);

    const listSaves = useCallback(() => {
        if (!wsRef.current) return;
        wsRef.current.send(JSON.stringify({
            action: "list_saves"
        }));
    }, []);

    const requestMapData = useCallback(() => {
        if (!wsRef.current) return;
        wsRef.current.send(JSON.stringify({
            action: "map_interaction",
            character_id: getMyCharacterId(),
            interaction_type: "request_data"
        }));
    }, [getMyCharacterId]);

    const removeToast = useCallback((index: number) => {
        setGameState((prev) => ({
            ...prev,
            toasts: prev.toasts.filter((_, i) => i !== index)
        }));
    }, []);

    const triggerMapCapture = useCallback(async (nodeId: string) => {
        try {
            const response = await fetch(`/api/world/map/capture/${nodeId}`, {
                method: "POST"
            });
            if (!response.ok) throw new Error("Capture failed");
            const data = await response.json();
            return data.image_url;
        } catch (error) {
            console.error("Map capture error:", error);
            return null;
        }
    }, []);

    const clearScreenShake = useCallback(() => {
        setGameState((prev) => ({ ...prev, screenShake: false }));
    }, []);

    const equipItem = useCallback((itemId: string, slot: string) => {
        wsRef.current?.send(JSON.stringify({
            action: "equip_item",
            character_id: getMyCharacterId(),
            item_id: itemId,
            slot: slot
        }));
    }, [getMyCharacterId]);

    const unequipItem = useCallback((itemId: string) => {
        wsRef.current?.send(JSON.stringify({
            action: "unequip_item",
            character_id: getMyCharacterId(),
            item_id: itemId
        }));
    }, [getMyCharacterId]);

    const openShop = useCallback((nodeId: string) => {
        wsRef.current?.send(JSON.stringify({
            action: "get_shop",
            node_id: nodeId,
            character_id: getMyCharacterId(),
        }));
    }, [getMyCharacterId]);

    const setSelectedTarget = useCallback((targetId: string | null) => {
        setGameState(prev => ({ ...prev, selectedTargetId: targetId }));
    }, []);

    const attackTarget = useCallback((targetId: string, weaponId?: string) => {
        const payload: Record<string, unknown> = {
            action: "attack",
            attacker_id: getMyCharacterId(),
            target_id: targetId
        };
        if (weaponId) {
            payload.weapon_id = weaponId;
        }
        wsRef.current?.send(JSON.stringify(payload));
    }, [getMyCharacterId]);

    const castSpell = useCallback((targetId: string, spellId: string) => {
        wsRef.current?.send(JSON.stringify({
            action: "cast_spell",
            attacker_id: getMyCharacterId(),
            target_id: targetId,
            spell_id: spellId
        }));
    }, [getMyCharacterId]);

    return {
        ...gameState,
        connect,
        sendAction,
        disconnect,
        getSpells,
        listSaves,
        requestMapData,
        triggerMapCapture,
        removeToast,
        clearScreenShake,
        equipItem,
        unequipItem,
        setSelectedTarget,
        attackTarget,
        castSpell,
        openShop,
    };
}
