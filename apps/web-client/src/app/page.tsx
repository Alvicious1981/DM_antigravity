'use client';
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen';
import Dashboard from './Dashboard';
import MainMenu from './MainMenu';
import CharacterCreator from '../components/CharacterCreator';

type GameState = 'SPLASH' | 'MENU' | 'CREATOR' | 'GAME';

export default function Home() {
  const [view, setView] = useState<GameState>('SPLASH');
  const [saves, setSaves] = useState<{ save_id: string; created_at: string }[]>([]);
  const [session, setSession] = useState<any>(null); // TODO: Type this

  // Fetch saves on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/game/list')
      .then(res => res.json())
      .then(data => setSaves(data))
      .catch(err => console.error("Failed to fetch saves:", err));
  }, []);

  const handleNewGame = () => {
    setView('CREATOR');
  };

  const handleLoadGame = async (saveId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/game/load/${saveId}`, {
        method: 'POST',
      });
      const data = await res.json();
      setSession(data);
      setView('GAME');
    } catch (err) {
      console.error("Failed to load game:", err);
    }
  };

  const handleCreateSession = async (characterData: { name: string; classId: string; backgroundId: string }) => {
    try {
      const res = await fetch('http://localhost:8000/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData),
      });
      const data = await res.json();
      setSession(data);
      setView('GAME');
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {view === 'SPLASH' && (
        <WelcomeScreen onEnter={() => setView('MENU')} />
      )}

      {view === 'MENU' && (
        <MainMenu
          onNewGame={handleNewGame}
          onLoadGame={handleLoadGame}
          onSettings={() => console.log("Settings not implemented")}
          saves={saves}
        />
      )}

      {view === 'CREATOR' && (
        <CharacterCreator
          onCreate={handleCreateSession}
          onCancel={() => setView('MENU')}
        />
      )}

      {view === 'GAME' && (
        <Dashboard initialSession={session} />
      )}
    </main>
  );
}
