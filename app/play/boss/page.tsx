'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { voteChessApi, BossFightState } from '@/features/social/api/voteChessApi';
import { Board } from '@/features/game/components/Board';
import { Chess } from 'chess.js';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function BossFightPage() {
  const [bossState, setBossState] = useState<BossFightState['state'] | null>(null);
  const [votedMove, setVotedMove] = useState<string | null>(null);

  useEffect(() => {
    voteChessApi.getState()
      .then((res) => setBossState(res.state))
      .catch((e) => toast.error('Failed to load Boss Fight state'));
  }, []);

  const handlePieceDrop = useCallback((source: string, target: string, piece: string) => {
    if (!bossState) return false;
    if (votedMove) {
      toast.error('You have already voted this turn!');
      return false;
    }

    const chess = new Chess(bossState.fen);
    try {
      const move = chess.move({
        from: source,
        to: target,
        promotion: 'q',
      });
      
      if (move) {
        voteChessApi.submitVote(move.san)
          .then(() => {
            setVotedMove(move.san);
            toast.success(`Vote cast for ${move.san}!`);
          })
          .catch((e) => toast.error(e.message || 'Failed to submit vote'));
        // Always snap back on UI since we just vote
        return false;
      }
    } catch (e) {
      // invalid move
    }
    return false; // don't update local board state
  }, [bossState, votedMove]);

  if (!bossState) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
           <span className="font-bold text-white">The Community (You)</span>
           <span className="text-sm text-cc-text-secondary bg-slate-800 px-2 py-1 rounded">1500</span>
        </div>
        <div className="text-cc-text-primary text-xl font-bold bg-slate-950 px-4 py-2 rounded shadow-inner tracking-widest uppercase">
           VOTE CHESS
        </div>
        <div className="flex items-center gap-3">
           <span className="text-sm text-cc-text-secondary bg-slate-800 px-2 py-1 rounded">3000</span>
           <span className="font-bold text-white">The Titan (Stockfish)</span>
        </div>
      </div>
      <div className="max-w-4xl mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-6 mt-8">
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <SectionHeader>Community vs The Titan</SectionHeader>
            <p className="text-sm text-cc-text-secondary">
              Turn {bossState.turnCount + 1} - The server will execute the majority vote at midnight.
            </p>
          </div>
          
          <div className="mt-4 border-2 border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
            <Board
              position={bossState.fen}
              flipped={false}
              viewMode="2.5d"
              onPieceDrop={handlePieceDrop}
              isDraggablePiece={() => !votedMove}
            />
            {!bossState.isActive && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-red-500">The Titan has fallen! (or you lost)</h2>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-80 space-y-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-bold text-amber-500 mb-2">Your Vote</h3>
            {votedMove ? (
              <div className="bg-green-900/40 border border-green-500/30 text-green-400 p-3 rounded-lg text-center font-mono font-bold text-2xl">
                {votedMove}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Drag a piece on the board to cast your vote for the next move.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
