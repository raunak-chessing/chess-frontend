'use client';

import React, { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket-client';
import { ColosseumEventData } from './ColosseumModal.types';
import { authClient } from '@/lib/auth-client';

export function ColosseumModal() {
  const [eventData, setEventData] = useState<ColosseumEventData | null>(null);
  const [amount, setAmount] = useState<string>('100');
  const [bettingOn, setBettingOn] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    const socket = getSocket();
    
    const handleEvent = (data: ColosseumEventData) => {
      // Don't show to the players actually playing the game
      if (user?.id === data.white.id || user?.id === data.black.id) return;
      setEventData(data);
    };

    socket.on('GlobalSpectatorEvent', handleEvent);

    return () => {
      socket.off('GlobalSpectatorEvent', handleEvent);
    };
  }, [user]);

  const handleWager = async () => {
    if (!eventData || !bettingOn) return;
    setStatus('loading');
    
    try {
      const socket = getSocket();
      // Emitting through socket for real-time wager placement
      (socket as any).emit('placeWager', {
        gameId: eventData.gameId,
        predictedWinnerId: bettingOn,
        amount: parseInt(amount, 10),
      }, (response: any) => {
        if (response.success) {
          setStatus('success');
          setTimeout(() => setEventData(null), 3000); // Close after success
        } else {
          setStatus('error');
        }
      });
    } catch (error) {
      setStatus('error');
    }
  };

  if (!eventData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg p-8 overflow-hidden rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-xl">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50 blur-sm" />
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 tracking-tight uppercase">
            The Colosseum Opens
          </h2>
          <p className="text-slate-400 mt-2 text-sm">{eventData.message}</p>
        </div>

        <div className="flex items-center justify-between gap-4 mb-8">
          {/* White Player */}
          <button 
            onClick={() => setBettingOn(eventData.white.id)}
            className={`flex-1 p-4 rounded-xl border transition-all duration-200 ${
              bettingOn === eventData.white.id 
                ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="text-xl font-bold text-slate-100">{eventData.white.name}</div>
            <div className="text-sm font-medium text-amber-500 mt-1">
              {eventData.odds[eventData.white.id]?.toFixed(2)}x Payout
            </div>
            <div className="text-xs text-slate-500 mt-2">{eventData.white.rating} ELO</div>
          </button>

          <div className="text-slate-500 font-bold italic">VS</div>

          {/* Black Player */}
          <button 
            onClick={() => setBettingOn(eventData.black.id)}
            className={`flex-1 p-4 rounded-xl border transition-all duration-200 ${
              bettingOn === eventData.black.id 
                ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="text-xl font-bold text-slate-100">{eventData.black.name}</div>
            <div className="text-sm font-medium text-amber-500 mt-1">
              {eventData.odds[eventData.black.id]?.toFixed(2)}x Payout
            </div>
            <div className="text-xs text-slate-500 mt-2">{eventData.black.rating} ELO</div>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Wager Amount (Gold)</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              placeholder="Enter amount..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setEventData(null)}
              className="flex-1 px-4 py-3 rounded-lg font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Dismiss
            </button>
            <button 
              onClick={handleWager}
              disabled={!bettingOn || status === 'loading' || status === 'success'}
              className="flex-1 px-4 py-3 rounded-lg font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              {status === 'loading' ? 'Placing...' : status === 'success' ? 'Wager Placed!' : 'Place Wager'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
