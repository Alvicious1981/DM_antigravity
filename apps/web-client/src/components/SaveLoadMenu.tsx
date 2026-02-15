"use client";

import { useState, useEffect } from "react";
import { SaveInfo } from "@/hooks/useAgentState";

interface SaveLoadMenuProps {
    saves: SaveInfo[];
    onSave: (id: string) => void;
    onLoad: (id: string) => void;
    onListSaves: () => void;
    onClose?: () => void;
}

export default function SaveLoadMenu({ saves, onSave, onLoad, onListSaves, onClose }: SaveLoadMenuProps) {
    const [newSaveId, setNewSaveId] = useState("");

    // Refresh list on mount
    useEffect(() => {
        onListSaves();
    }, [onListSaves]);

    const handleSave = () => {
        if (!newSaveId.trim()) return;
        onSave(newSaveId.trim());
        setNewSaveId("");
        // Refresh list after a short delay to allow DB write
        setTimeout(onListSaves, 500);
    };

    const handleLoad = (id: string) => {
        onLoad(id);
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-[#2a2a2d] bg-[#141416] p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-cinzel text-xl text-[#c5a059]">Grimorio de Memorias</h2>
                    <button
                        onClick={onClose}
                        className="text-[#e0e0e4] hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Save Section */}
                <div className="mb-8">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-ash/60">Guardar Partida</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSaveId}
                            onChange={(e) => setNewSaveId(e.target.value)}
                            placeholder="Nombre del guardado..."
                            className="flex-1 rounded border border-[#2a2a2d] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e0e0e4] focus:border-[#c5a059] focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                        <button
                            onClick={handleSave}
                            disabled={!newSaveId.trim()}
                            className="rounded bg-[#c5a059]/10 px-4 py-2 text-sm font-bold text-[#c5a059] hover:bg-[#c5a059]/20 disabled:opacity-50"
                        >
                            Guardar
                        </button>
                    </div>
                </div>

                {/* Load Section */}
                <div>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-ash/60">Cargar Partida</h3>
                    <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
                        {saves.length === 0 ? (
                            <div className="py-4 text-center text-xs text-ash/40 italic">
                                No hay memorias guardadas.
                            </div>
                        ) : (
                            saves.map((save) => (
                                <div
                                    key={save.save_id}
                                    className="flex items-center justify-between rounded border border-[#2a2a2d] bg-[#0a0a0a] p-3 transition-colors hover:border-[#c5a059]/50"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[#e0e0e4]">{save.save_id}</span>
                                        <span className="text-xs text-ash/40">{new Date(save.created_at + "Z").toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={() => handleLoad(save.save_id)}
                                        className="rounded border border-cyan-500/30 px-3 py-1 text-xs text-cyan-500 hover:bg-cyan-500/10"
                                    >
                                        Cargar
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
