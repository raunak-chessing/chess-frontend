import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface StreamerHeatmapProps {
  streamerId: string;
}

let socket: Socket | null = null;

export function StreamerHeatmap({ streamerId }: StreamerHeatmapProps) {
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
        withCredentials: true,
      });
    }

    socket.emit('streamer:join', { streamerId });

    const handleHeatmapUpdate = (data: { streamerId: string, heatmap: Record<string, number> }) => {
      if (data.streamerId === streamerId) {
        setHeatmap(data.heatmap);
      }
    };

    socket.on('streamer:heatmapUpdate', handleHeatmapUpdate);

    return () => {
      socket?.off('streamer:heatmapUpdate', handleHeatmapUpdate);
    };
  }, [streamerId]);

  // Find max value to normalize opacities
  const maxVotes = Math.max(1, ...Object.values(heatmap));

  return (
    <div className="absolute inset-0 pointer-events-none z-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)' }}>
      {/* 
        This overlays on top of the chessboard. We need to map squares to the 8x8 grid.
        Assuming standard orientation (White at bottom), a8 is top-left, h1 is bottom-right.
      */}
      {Array.from({ length: 64 }).map((_, i) => {
        const file = String.fromCharCode(97 + (i % 8)); // a-h
        const rank = 8 - Math.floor(i / 8); // 8-1
        const square = `${file}${rank}`;
        
        const votes = heatmap[square] || 0;
        const opacity = votes > 0 ? Math.min(0.8, (votes / maxVotes) * 0.8 + 0.1) : 0;

        return (
          <div key={square} className="w-full h-full relative">
            {votes > 0 && (
              <div 
                className="absolute inset-0 bg-red-500 transition-opacity duration-500 ease-out" 
                style={{ opacity }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export const emitStreamerVote = (streamerId: string, square: string) => {
  if (socket?.connected) {
    socket.emit('streamer:voteMove', { streamerId, square });
  }
};
