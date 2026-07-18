'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorldMap } from '../../../features/overworld/components/WorldMap/WorldMap';
import { useSocket } from '../../../lib/socket-client';
import { fetchApi } from '@/lib/api-client';

export default function OverworldPage() {
  const [hexes, setHexes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inQueue, setInQueue] = useState(false);
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    // Fetch map state with credentials for Fog of War (userId extraction)
    fetchApi('/api/overworld/map')
      .then(data => {
        setHexes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load map', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for real-time map updates (e.g. someone capturing a territory)
    socket.on('hexUpdated', (updatedHex: any) => {
      setHexes(prev => prev.map(h => h.id === updatedHex.id ? updatedHex : h));
    });

    socket.on('queueJoined', () => setInQueue(true));
    
    socket.on('roomJoined', (data: { room: string; color: string }) => {
      router.push(`/play/${data.room}`);
    });

    return () => {
      socket.off('hexUpdated');
      socket.off('queueJoined');
      socket.off('roomJoined');
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-2xl animate-pulse font-mono tracking-widest">
          SYNCING AETHELGARD WORLD STATE...
        </div>
      </div>
    );
  }

  const handleInitiateAttack = (hexId: string) => {
    if (!socket) return;
    socket.emit('joinQueue', {
      timeControl: '10|0',
      targetHexId: hexId,
    });
  };

  return (
    <div className="w-full h-screen bg-black p-4">
      <div className="w-full h-full relative">
        <WorldMap hexes={hexes} onInitiateAttack={handleInitiateAttack} />
        
        {/* HUD Elements */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            Aethelgard
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
            Global War Map • Live
          </p>
          {inQueue && (
            <div className="mt-4 px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-lg text-indigo-300 font-mono animate-pulse">
              [ MATCHMAKING: SEEKING OPPONENT FOR SIEGE... ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
