import { GameState, AgUiEvent, NarrativeChunk, NarrativeEvent, StatePatch, ShowWidget, SpellBookUpdate, DiceResult, InitiativeUpdate, InventoryUpdate, LogEvent, MapDataEvent, MonsterSearchEvent, GoldUpdate, ShopInventory } from "./useAgentState";
import { asCombatantId } from "../domain/types";
import { spawnFloatingText } from "../components/FloatingTextLayer";

export type StateUpdater = (prev: GameState) => GameState;
export type MessageHandler = (data: any, bufferRef: React.MutableRefObject<string>) => StateUpdater;

/**
 * Strategy Pattern for WebSocket Message Dispatching.
 * Adheres to "No Else" (Switch is also a form of Else) and "Small Classes/Functions".
 */

const connectionEstablishedHandler: MessageHandler = () => (state) => state;

let lastNarrativeIndex = -1;

const narrativeChunkHandler: MessageHandler = (data: NarrativeChunk, bufferRef) => {
    const chunk = data;

    // Sequence Validation (§ Track A.2)
    // If indices are out of sync, we have a race condition or dropped packet.
    if (chunk.index <= lastNarrativeIndex && chunk.index !== 0) {
        console.warn(`[AG-UI] Out of sequence NarrativeChunk: received ${chunk.index}, expected > ${lastNarrativeIndex}`);
        // We continue anyway but log it for debugging. 
        // Index 0 resets the counter for a new stream.
    }

    if (chunk.index === 0) {
        bufferRef.current = ""; // Reset buffer on new stream explicitly
    }

    lastNarrativeIndex = chunk.index;
    bufferRef.current += chunk.content;

    return (prev) => {
        if (!chunk.done) {
            return {
                ...prev,
                currentNarrative: bufferRef.current,
                isStreaming: true,
            };
        }

        const finalText = bufferRef.current;
        bufferRef.current = "";
        lastNarrativeIndex = -1; // Reset for next stream
        return {
            ...prev,
            narrative: [...prev.narrative, finalText],
            currentNarrative: "",
            isStreaming: false,
        };
    };
};

const narrativeEventHandler: MessageHandler = (data: NarrativeEvent) => (prev) => {
    // Arrival and Encounter logic (§ Phase 7.1 & 7.3)
    const newToasts = [...prev.toasts];
    const nodeId = data.metadata?.node_id as string;
    const nodeName = data.metadata?.node_name as string;
    const isNewNode = nodeId && !prev.visitedNodeIds.includes(nodeId);

    if (isNewNode) {
        newToasts.push({
            type: "LOG",
            message: `New Discovery: ${nodeName || "Unknown Location"}`,
            level: "info",
        });
    }

    return {
        ...prev,
        toasts: newToasts,
        visitedNodeIds: isNewNode ? [...prev.visitedNodeIds, nodeId] : prev.visitedNodeIds,
        // We additive to narrative for structured events that don't stream
        narrative: data.event_type !== "travel" ? [...prev.narrative, data.content] : prev.narrative,
    };
};

const statePatchHandler: MessageHandler = (data: StatePatch) => (prev) => {
    const newTargets = { ...prev.targets };
    const newCombatants = [...prev.combatants];
    let shouldShake = false;


    for (const p of data.patches) {
        const parts = p.path.split("/").filter(Boolean);

        // Handle /targets/id/field
        if (parts[0] === "targets" && parts.length >= 3) {
            const targetId = parts[1];
            const field = parts[2];

            // Floating Text Logic for HP changes
            if (field === "hp") {
                const oldHp = newTargets[targetId]?.hp || 0;
                const newHp = p.value as number;
                const diff = newHp - oldHp;

                if (diff < 0) {
                    // Damage
                    spawnFloatingText(`${diff}`, window.innerWidth / 2, window.innerHeight / 2, "red");
                    shouldShake = true;
                } else if (diff > 0) {
                    // Healing
                    spawnFloatingText(`+${diff}`, window.innerWidth / 2, window.innerHeight / 2, "green");
                }
            }

            if (!newTargets[targetId]) {
                newTargets[targetId] = { hp: 0, status: "unknown", ac: 10, conditions: [] };
            }
            (newTargets[targetId] as Record<string, any>)[field] = p.value;
        }

        // Handle /combatants/id/field
        if (parts[0] === "combatants" && parts.length >= 3) {
            const cId = parts[1];
            const field = parts[2];
            const idx = newCombatants.findIndex(c => c.id === cId);
            if (idx !== -1) {
                (newCombatants[idx] as any)[field] = p.value;
            }
        }
    }

    return {
        ...prev,
        targets: newTargets,
        combatants: newCombatants,
        lastFactPacket: data.fact_packet || prev.lastFactPacket,
        screenShake: shouldShake || prev.screenShake,
    };
};

const showWidgetHandler: MessageHandler = (data: ShowWidget) => (prev) => ({
    ...prev,
    activeWidgets: [...prev.activeWidgets, data]
});

const spellBookUpdateHandler: MessageHandler = (data: SpellBookUpdate) => (prev) => ({
    ...prev,
    spells: data.spells,
});

const diceResultHandler: MessageHandler = (data: DiceResult) => (prev) => ({
    ...prev,
    lastDiceResult: data,
});

const initiativeUpdateHandler: MessageHandler = (data: InitiativeUpdate) => (prev) => ({
    ...prev,
    combatants: data.combatants,
    currentRound: data.round || prev.currentRound,
});

const inventoryUpdateHandler: MessageHandler = (data: InventoryUpdate) => (prev) => ({
    ...prev,
    inventory: data.items,
});

const mapUpdateHandler: MessageHandler = (data: any) => (prev) => ({
    ...prev,
    mapState: {
        ...prev.mapState,
        currentNodeId: data.node_id || prev.mapState.currentNodeId,
        lastInteraction: {
            cell: data.cell_id,
            type: data.interaction_type,
            character: data.character_id
        }
    }
});

const mapDataHandler: MessageHandler = (data: MapDataEvent) => (prev) => ({
    ...prev,
    mapState: {
        ...prev.mapState,
        nodes: data.nodes,
        currentNodeId: data.current_node_id
    }
});

const saveListHandler: MessageHandler = (data: any) => (prev) => ({
    ...prev,
    saveList: data.saves,
});

const logHandler: MessageHandler = (data: LogEvent) => (prev) => ({
    ...prev,
    narrative: [
        ...prev.narrative,
        `[${data.level.toUpperCase()}] ${data.message}`
    ],
    toasts: [...prev.toasts, data]
});

const lootDistributedHandler: MessageHandler = (data: any) => (prev) => ({
    ...prev,
    toasts: [...prev.toasts, { type: "LOG", message: data.message || "Loot received!", level: "info" } as LogEvent],
});

const monsterSearchResultsHandler: MessageHandler = (data: MonsterSearchEvent) => (prev) => ({
    ...prev,
    monsterSearchResults: data.results,
});

const goldUpdateHandler: MessageHandler = (data: GoldUpdate) => (prev) => ({
    ...prev,
    gold: data.gold,
    toasts: [
        ...prev.toasts,
        { type: "LOG", message: `+${data.delta} gp (total: ${data.gold} gp)`, level: "info" } as LogEvent,
    ],
});

const shopInventoryHandler: MessageHandler = (data: ShopInventory) => (prev) => ({
    ...prev,
    shopInventory: data,
});

const ackHandler: MessageHandler = (data: any) => (prev) => {
    if (data.status === "error") {
        return {
            ...prev,
            toasts: [...prev.toasts, { type: "LOG", message: data.message, level: "error" } as LogEvent],
        };
    }
    return prev;
};

const handlers: Record<string, MessageHandler> = {
    CONNECTION_ESTABLISHED: connectionEstablishedHandler,
    NARRATIVE_CHUNK: narrativeChunkHandler,
    STATE_PATCH: statePatchHandler,
    SHOW_WIDGET: showWidgetHandler,
    SPELL_BOOK_UPDATE: spellBookUpdateHandler,
    DICE_RESULT: diceResultHandler,
    INITIATIVE_UPDATE: initiativeUpdateHandler,
    INVENTORY_UPDATE: inventoryUpdateHandler,
    MAP_UPDATE: mapUpdateHandler,
    MAP_DATA: mapDataHandler,
    SAVE_LIST: saveListHandler,
    LOG: logHandler,
    NARRATIVE_EVENT: narrativeEventHandler,
    LOOT_DISTRIBUTED: lootDistributedHandler,
    MONSTER_SEARCH_RESULTS: monsterSearchResultsHandler,
    ACK: ackHandler,
    GOLD_UPDATE: goldUpdateHandler,
    SHOP_INVENTORY: shopInventoryHandler,
};

export function dispatchMessage(
    event: AgUiEvent,
    bufferRef: React.MutableRefObject<string>
): StateUpdater {
    const handler = handlers[event.type];
    if (!handler) {
        return (state) => state; // Null Object Pattern
    }
    return handler(event, bufferRef);
}
