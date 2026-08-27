import React, { useEffect, useState } from 'react';
import { wagerApi } from '../api/wagerApi';
import toast from 'react-hot-toast';
import { Coins, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface WagerOverlayProps {
  gameId: string;
  whitePlayerId: string;
  blackPlayerId: string;
  whiteName: string;
  blackName: string;
}

export function WagerOverlay({ gameId, whitePlayerId, blackPlayerId, whiteName, blackName }: WagerOverlayProps) {
  const [odds, setOdds] = useState<Record<string, number>>({});
  const [amount, setAmount] = useState<number>(100);
  const [isWagering, setIsWagering] = useState(false);

  useEffect(() => {
    // Fetch odds periodically
    const fetchOdds = () => {
      wagerApi.getOdds(gameId)
        .then(res => setOdds(res.odds))
        .catch(() => {});
    };
    fetchOdds();
    const interval = setInterval(fetchOdds, 10000);
    return () => clearInterval(interval);
  }, [gameId]);

  const handleWager = async (predictedWinnerId: string) => {
    setIsWagering(true);
    try {
      const result = await wagerApi.placeWager(gameId, predictedWinnerId, amount);
      toast.success(`Wager placed! Potential payout: ${Math.floor(amount * result.odds)} Gold`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to place wager');
    } finally {
      setIsWagering(false);
    }
  };

  const whiteOdds = odds[whitePlayerId] ? odds[whitePlayerId].toFixed(2) : '1.00';
  const blackOdds = odds[blackPlayerId] ? odds[blackPlayerId].toFixed(2) : '1.00';

  if (Object.keys(odds).length === 0) return null; // No betting pool active

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-xl mt-4 max-w-sm w-full mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold">
        <Coins size={20} />
        <span className="uppercase tracking-wider text-sm">Spectator Betting</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => handleWager(whitePlayerId)}
          disabled={isWagering}
          className="flex flex-col items-center p-3 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-amber-500 transition-all disabled:opacity-50"
        >
          <span className="text-xs font-bold text-slate-300 truncate w-full text-center">{whiteName}</span>
          <span className="text-lg font-black text-white mt-1">{whiteOdds}x</span>
          <span className="text-[10px] text-amber-400 font-mono mt-1">Payout: {Math.floor(amount * parseFloat(whiteOdds))}</span>
        </button>

        <button
          onClick={() => handleWager(blackPlayerId)}
          disabled={isWagering}
          className="flex flex-col items-center p-3 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-amber-500 transition-all disabled:opacity-50"
        >
          <span className="text-xs font-bold text-slate-300 truncate w-full text-center">{blackName}</span>
          <span className="text-lg font-black text-white mt-1">{blackOdds}x</span>
          <span className="text-[10px] text-amber-400 font-mono mt-1">Payout: {Math.floor(amount * parseFloat(blackOdds))}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
        <span className="text-xs font-bold text-slate-400 px-2">BET:</span>
        <input 
          type="number"
          min="10"
          step="10"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full bg-transparent text-amber-400 font-mono font-bold text-lg outline-none"
        />
        <Coins size={16} className="text-amber-500 mx-2" />
      </div>
    </div>
  );
}
