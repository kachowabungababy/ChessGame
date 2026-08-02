import React, { useState, useEffect, useRef } from 'react';
import { createLobbyGame, joinLobbyGame, subscribeLobbyGame } from '../game/lobbyStore';

export default function OnlineLobbyScreen({ profile, onGameReady, onBack }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [isCreating, setIsCreating] = useState(false);
  const [waitingCode, setWaitingCode] = useState(null);
  const [hostColor, setHostColor] = useState('w');
  const [createError, setCreateError] = useState(null);

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);

  const unsubscribeRef = useRef(null);

  const isSignedIn = !!profile?.handle && profile.handle !== 'Guest';

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const handleCreateGame = async () => {
    setCreateError(null);
    setIsCreating(true);
    const result = await createLobbyGame(profile);
    setIsCreating(false);

    if (!result) {
      setCreateError('Could not create a game — check your connection and try again.');
      return;
    }

    setWaitingCode(result.code);
    setHostColor(result.hostColor);

    unsubscribeRef.current = subscribeLobbyGame(result.code, (row) => {
      if (row?.status === 'active' && row.guest_handle) {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        onGameReady({
          code: result.code,
          color: result.hostColor,
          opponentHandle: row.guest_handle,
          opponentElo: row.guest_elo,
        });
      }
    });
  };

  const handleCancelWaiting = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setWaitingCode(null);
  };

  const handleJoinGame = async () => {
    if (!joinCodeInput.trim()) return;
    setJoinError(null);
    setIsJoining(true);
    const result = await joinLobbyGame(joinCodeInput, profile);
    setIsJoining(false);

    if (result.error === 'not_found') {
      setJoinError('No waiting game found with that code.');
      return;
    }
    if (result.error === 'already_full') {
      setJoinError('That game already has two players or has already started.');
      return;
    }
    if (result.error) {
      setJoinError('Could not join — check your connection and try again.');
      return;
    }

    onGameReady({
      code: joinCodeInput.trim().toUpperCase(),
      color: result.guestColor,
      opponentHandle: result.row.host_handle,
      opponentElo: result.row.host_elo,
    });
  };

  return (
    <div className="online-lobby-container">
      <header className="lobby-header">
        <button className="btn-switch-nav font-poke" onClick={onBack}>
          ◄ Menu
        </button>
        <h1 className="lobby-title font-poke">🌐 Online Lobby</h1>
        <p className="lobby-subtitle">Play a live game with someone in another location</p>
      </header>

      {!isSignedIn ? (
        <div className="lobby-signin-required">
          <p>Sign in with a Trainer Handle (not Guest) to play online.</p>
        </div>
      ) : waitingCode ? (
        <div className="lobby-waiting-room">
          <p className="waiting-label">Share this code with your opponent:</p>
          <div className="invite-code-display font-poke">{waitingCode}</div>
          <p className="waiting-spinner">Waiting for opponent to join…</p>
          <button className="btn btn-secondary font-poke" onClick={handleCancelWaiting}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="lobby-panel">
          <div className="lobby-tabs">
            <button
              className={`lobby-tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Create Game
            </button>
            <button
              className={`lobby-tab ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveTab('join')}
            >
              Join Game
            </button>
          </div>

          {activeTab === 'create' ? (
            <div className="lobby-tab-content">
              <p>Create a new game and share the invite code with your opponent.</p>
              {createError && <p className="lobby-error">{createError}</p>}
              <button
                className="btn btn-primary font-poke"
                onClick={handleCreateGame}
                disabled={isCreating}
              >
                {isCreating ? 'Creating…' : 'Create Game'}
              </button>
            </div>
          ) : (
            <div className="lobby-tab-content">
              <p>Enter the invite code your opponent shared with you.</p>
              {joinError && <p className="lobby-error">{joinError}</p>}
              <input
                type="text"
                className="lobby-code-input font-poke"
                placeholder="e.g. PIKA42"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={12}
              />
              <button
                className="btn btn-primary font-poke"
                onClick={handleJoinGame}
                disabled={isJoining}
              >
                {isJoining ? 'Joining…' : 'Join Game'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
