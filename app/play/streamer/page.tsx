'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authClient } from '@/lib/auth-client';
import Board from '@/features/game/components/Board/Board';
import { Chess } from 'chess.js';
import { User, Eye, Vote, Flame } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StreamerModePage() {
  const { data: session } = authClient.useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState(new Chess());
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [streamerId, setStreamerId] = useState<string>('demo-streamer'); // In reality, this would be a URL param
  const [isStreamer, setIsStreamer] = useState(false); // In reality, check if session.user.id === streamerId
  
  useEffect(() => {
    if (!session) return;
    
    // Check if the current user is the streamer
    if (session.user.id === streamerId) {
      setIsStreamer(true);
    }

    const newSocket = io('http://localhost:4001', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to streamer gateway');
      newSocket.emit('streamer:join', { streamerId });
    });

    newSocket.on('streamer:heatmapUpdate', (data: { streamerId: string, heatmap: Record<string, number> }) => {
      setHeatmap(data.heatmap);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session, streamerId]);

  const handleSquareClick = (square: string) => {
    if (!isStreamer && socket) {
      socket.emit('streamer:voteMove', { streamerId, square });
      toast.success(`Voted for ${square}!`, { id: 'vote', duration: 1000, icon: '🔥' });
    }
  };

  const handlePieceDrop = (sourceSquare: string, targetSquare: string) => {
    if (!isStreamer) return false;
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // always promote to queen for simplicity here
      });
      if (move === null) return false;
      setGame(gameCopy);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Compute dynamic square styles based on heatmap
  const maxVotes = Math.max(...Object.values(heatmap), 1);
  const customSquareStyles: Record<string, React.CSSProperties> = {};
  
  for (const [sq, votes] of Object.entries(heatmap)) {
    if (votes > 0) {
      const intensity = Math.min(votes / maxVotes, 1);
      customSquareStyles[sq] = {
        background: `radial-gradient(circle, rgba(245, 158, 11, ${intensity * 0.8}) 0%, rgba(245, 158, 11, 0) 80%)`,
        boxShadow: `inset 0 0 ${20 * intensity}px rgba(245, 158, 11, ${intensity})`,
      };
    }
  }

  return (
    <div className="min-h-screen bg-cc-bg p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6 text-amber-400" />
              TWITCH MODE
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              {isStreamer 
                ? "You are broadcasting. Your viewers are voting on your next move!" 
                : "You are a viewer. Click on any square on the board to vote for the streamer's next move!"}
            </p>
            
            <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Live Viewers</div>
                <div className="text-xl font-black text-white">4,281</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50 mt-4">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <Vote className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Votes</div>
                <div className="text-xl font-black text-white">{Object.values(heatmap).reduce((a, b) => a + b, 0)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="w-full aspect-square max-w-[600px] relative">
            <Board 
              position={game.fen()} 
              onPieceDrop={handlePieceDrop}
              onSquareClick={handleSquareClick}
              squareStyles={customSquareStyles}
              isDraggablePiece={() => isStreamer}
            />
          </div>
        </div>
        
        {/* Right Sidebar (Chat/Feed mockup) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
           <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-2xl h-[500px] flex flex-col">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 pb-3 mb-3">Live Chat</h3>
              <div className="flex-1 overflow-hidden flex flex-col gap-3">
                <div className="text-sm"><span className="font-bold text-blue-400">PogChamp99:</span> e4 is the only way</div>
                <div className="text-sm"><span className="font-bold text-green-400">GrandmasterB:</span> vote for Knight to f3!</div>
                <div className="text-sm"><span className="font-bold text-amber-400">ChessNoob:</span> what does the glowing square mean?</div>
                <div className="text-sm"><span className="font-bold text-purple-400">xX_Slayer_Xx:</span> 👑</div>
              </div>
              <div className="mt-auto pt-4">
                <input type="text" placeholder="Send a message..." className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
