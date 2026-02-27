'use client';
import React, { useState, useEffect } from 'react';
import { EpicBattleMenu } from '../components/stitch/EpicBattleMenu';
import { LoadGameScreen } from '../components/stitch/LoadGameScreen';
import { HighFidelityCharacterCreator as CharacterCreator } from '../components/stitch/HighFidelityCharacterCreator';
import { GameplayHud } from '../components/stitch/GameplayHud';
import { DeathScreen } from '../components/stitch/DeathScreen';
import { LevelUpScreen } from '../components/stitch/LevelUpScreen';
import { useAgentState } from '../hooks/useAgentState';

type ViewState = 'MENU' | 'LOAD' | 'CREATOR' | 'GAME' | 'DEAD' | 'LEVEL_UP';

// Inner component so it can access useAgentState after session is set
function GameView({ session, onDead, onQuit, onLevelUp }: {
  session: any;
  onDead: () => void;
  onQuit: () => void;
  onLevelUp: () => void;
}) {
  const { combatants, sendAction, connect, connected } = useAgentState();

  // Connect on mount if not connected
  useEffect(() => {
    if (session?.save_id && !connected) {
      connect(session.save_id);
    }
  }, [session, connected, connect]);

  // Watch for player death
  const player = combatants.find(c => c.isPlayer);
  useEffect(() => {
    const hpCurrent = (player as any)?.hp_current ?? 1;
    const hpMax = (player as any)?.hp_max ?? 0;
    if (player && hpMax > 0 && hpCurrent <= 0) {
      onDead();
    }
  }, [player, onDead]);

  const handleAction = (actionId: string) => {
    sendAction({ type: 'action', action: actionId });
  };

  const handleMessage = (message: string) => {
    sendAction({ action: 'narrative_action', content: message });
  };

  return (
    <GameplayHud
      onAction={handleAction}
      onSendMessage={handleMessage}
      onLevelUp={onLevelUp}
    />
  );
}

export default function Home() {
  const [view, setView] = useState<ViewState>('MENU');
  const [saves, setSaves] = useState<{ save_id: string; created_at: string }[]>([]);
  const [session, setSession] = useState<any>(null);

  // Fetch saves
  const refreshSaves = () => {
    fetch('/api/game/list')
      .then(res => res.json())
      .then(data => setSaves(Array.isArray(data) ? data : []))
      .catch(() => setSaves([]));
  };

  useEffect(() => { refreshSaves(); }, []);

  const handleMenuAction = (id: string) => {
    if (id === 'new-game' || id === 'new_game') setView('CREATOR');
    else if (id === 'load-game' || id === 'load_game') { refreshSaves(); setView('LOAD'); }
    else if (id === 'continue') { refreshSaves(); setView('LOAD'); }
    // quit / options — no-op for now

  };

  const handleLoadGame = async (saveId: string) => {
    try {
      const res = await fetch(`/api/game/load/${saveId}`, { method: 'POST' });
      const data = await res.json();
      setSession(data);
      setView('GAME');
    } catch {
      console.error('Failed to load game');
    }
  };

  const handleCreateSession = async (characterData: any) => {
    try {
      const res = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: characterData.name,
          class_id: characterData.classId,
          background_id: characterData.backgroundId,
          race_id: characterData.raceId,
        }),
      });
      const data = await res.json();
      setSession(data);
      setView('GAME');
    } catch {
      console.error('Failed to create session');
    }
  };

  const handleRetry = () => {
    // Reload same session
    if (session?.save_id) handleLoadGame(session.save_id);
    else setView('MENU');
  };

  // Map real saves into LoadGameScreen format
  const loadGameData = saves.length > 0 ? {
    saves: saves.map((s, i) => ({
      id: s.save_id,
      characterName: (s as any).character_name || `Chronicle #${i + 1}`,
      characterClass: (s as any).character_class || 'Adventurer',
      level: (s as any).level || 1,
      location: (s as any).location || 'Unknown',
      timestamp: new Date(s.created_at).toLocaleDateString(),
      playtime: '—',
      state: 'Saved',
      stateIcon: 'bookmark',
      stateColorClass: 'text-orange-300',
      isAutosave: i === 0,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrBz7VigHk5_t9CpXW7QK8za8j_eIgFytZnZS0ey0F0rDili0rpk9qGzwt_yxzymvXcPMsyuzrMpKg541n3i5CiXF28JzIx4MDOqgzmiaD69Tk52QXOmySP_B7XB08Z6noeycT0udByvfLrYt00YeD40OLy6Lu5wY1HWKoTS5KVPd0fHXK2996bX-wlz3FoOGxbtiQoVcth0x19xzy_XvAeVk-0wwdSgQ5Qld2W5n87A7SAdS1MFq7SSErDGL88NnfnjWesQhi8w',
    })),
    previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrBz7VigHk5_t9CpXW7QK8za8j_eIgFytZnZS0ey0F0rDili0rpk9qGzwt_yxzymvXcPMsyuzrMpKg541n3i5CiXF28JzIx4MDOqgzmiaD69Tk52QXOmySP_B7XB08Z6noeycT0udByvfLrYt00YeD40OLy6Lu5wY1HWKoTS5KVPd0fHXK2996bX-wlz3FoOGxbtiQoVcth0x19xzy_XvAeVk-0wwdSgQ5Qld2W5n87A7SAdS1MFq7SSErDGL88NnfnjWesQhi8w',
    previewTitle: 'Chronicle Preview',
    dangerLevel: 'Unknown',
    partyMembers: [],
    activeQuest: { title: 'The Journey Continues', description: 'Resume your adventure.' },
    gameVersion: '6.0.0',
    difficulty: 'Standard',
  } : undefined;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {view === 'MENU' && (
        <EpicBattleMenu onMenuItemClick={handleMenuAction} />
      )}

      {view === 'LOAD' && (
        <LoadGameScreen
          onLoad={handleLoadGame}
          onBack={() => setView('MENU')}
          data={loadGameData as any}
        />
      )}

      {view === 'CREATOR' && (
        <CharacterCreator
          onComplete={handleCreateSession}
          onCancel={() => setView('MENU')}
        />
      )}

      {view === 'GAME' && session && (
        <GameView
          session={session}
          onDead={() => setView('DEAD')}
          onQuit={() => setView('MENU')}
          onLevelUp={() => setView('LEVEL_UP')}
        />
      )}

      {view === 'LEVEL_UP' && (
        <LevelUpScreen
          onConfirm={() => setView('GAME')}
        />
      )}

      {view === 'DEAD' && (
        <DeathScreen
          onRetry={handleRetry}
          onQuit={() => setView('MENU')}
        />
      )}
    </main>
  );
}
