"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ──────────────────────────────────────────────────────────
// AG-UI Protocol Types (§6)
// ──────────────────────────────────────────────────────────

export interface AgUiEvent {
    type: string;
    [key: string]: unknown;
}

export interface NarrativeChunk {
    type: "NARRATIVE_CHUNK";
    content: string;
    index: number;
    done: boolean;
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

export interface GameState {
    connected: boolean;
    sessionId: string | null;
    narrative: string[];
    currentNarrative: string;
    isStreaming: boolean;
    targets: Record<string, { hp: number; status: string }>;
    lastFactPacket: Record<string, unknown> | null;
    lastDiceResult: DiceResult | null;
}

// ──────────────────────────────────────────────────────────
// useAgentState Hook — AG-UI WebSocket Client
// ──────────────────────────────────────────────────────────

export function useAgentState(wsUrl?: string) {
    const [state, setState] = useState<GameState>({
        connected: false,
        sessionId: null,
        narrative: [],
        currentNarrative: "",
        isStreaming: false,
        targets: {},
        lastFactPacket: null,
        lastDiceResult: null,
    });

    const wsRef = useRef<WebSocket | null>(null);
    const narrativeBufferRef = useRef<string>("");

    const connect = useCallback(
        (sessionId: string = "default") => {
            const url = wsUrl || `ws://localhost:8000/ws/game/${sessionId}`;

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                return;
            }

            const ws = new WebSocket(url);

            ws.onopen = () => {
                setState((prev) => ({ ...prev, connected: true, sessionId }));
            };

            ws.onmessage = (event) => {
                const data: AgUiEvent = JSON.parse(event.data);

                switch (data.type) {
                    case "CONNECTION_ESTABLISHED":
                        break;

                    case "NARRATIVE_CHUNK": {
                        const chunk = data as unknown as NarrativeChunk;
                        narrativeBufferRef.current += chunk.content;

                        setState((prev) => ({
                            ...prev,
                            currentNarrative: narrativeBufferRef.current,
                            isStreaming: !chunk.done,
                        }));

                        if (chunk.done) {
                            const finalText = narrativeBufferRef.current;
                            narrativeBufferRef.current = "";
                            setState((prev) => ({
                                ...prev,
                                narrative: [...prev.narrative, finalText],
                                currentNarrative: "",
                                isStreaming: false,
                            }));
                        }
                        break;
                    }

                    case "STATE_PATCH": {
                        const patch = data as unknown as StatePatch;
                        setState((prev) => {
                            const newTargets = { ...prev.targets };

                            for (const p of patch.patches) {
                                // Parse path like "/targets/goblin_1/hp"
                                const parts = p.path.split("/").filter(Boolean);
                                if (parts[0] === "targets" && parts.length >= 3) {
                                    const targetId = parts[1];
                                    const field = parts[2];
                                    if (!newTargets[targetId]) {
                                        newTargets[targetId] = { hp: 20, status: "alive" };
                                    }
                                    (newTargets[targetId] as Record<string, unknown>)[field] =
                                        p.value;
                                }
                            }

                            return {
                                ...prev,
                                targets: newTargets,
                                lastFactPacket: patch.fact_packet || prev.lastFactPacket,
                            };
                        });
                        break;
                    }

                    case "DICE_RESULT": {
                        setState((prev) => ({
                            ...prev,
                            lastDiceResult: data as unknown as DiceResult,
                        }));
                        break;
                    }
                }
            };

            ws.onclose = () => {
                setState((prev) => ({ ...prev, connected: false }));
            };

            ws.onerror = () => {
                setState((prev) => ({ ...prev, connected: false }));
            };

            wsRef.current = ws;
        },
        [wsUrl]
    );

    const sendAction = useCallback((action: Record<string, unknown>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(action));
        }
    }, []);

    const disconnect = useCallback(() => {
        wsRef.current?.close();
        wsRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            wsRef.current?.close();
        };
    }, []);

    return {
        ...state,
        connect,
        sendAction,
        disconnect,
    };
}
