'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Board from '@/features/game/components/Board/Board';
import AIVoiceCoach from '@/features/analysis/components/AIVoiceCoach';
import { CoachScriptLine } from '@/features/analysis/services/AudioProvider';

export default function AIReviewPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [script, setScript] = useState<CoachScriptLine[]>([]);
  const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScript() {
      try {
        const res = await fetch(`http://localhost:4001/api/analysis/${gameId}/coach`);
        const data = await res.json();
        setScript(data.script || []);
        if (data.script && data.script.length > 0) {
          setCurrentFen(data.script[0].fen);
        }
      } catch (err) {
        console.error('Failed to fetch coach script', err);
      } finally {
        setLoading(false);
      }
    }
    fetchScript();
  }, [gameId]);

  const handleLineChange = (line: CoachScriptLine) => {
    setCurrentFen(line.fen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center">
        <div className="text-white font-bold animate-pulse text-xl">Loading AI Grandmaster Analysis...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cc-bg p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Board Display */}
        <div className="w-full aspect-square max-w-[500px] mx-auto relative shadow-2xl rounded-2xl overflow-hidden ring-4 ring-neutral-800">
          <Board 
            position={currentFen} 
            onPieceDrop={() => false}
            isDraggablePiece={() => false}
          />
        </div>

        {/* AI Coach Panel */}
        <div className="flex flex-col gap-6">
          <div className="mb-4">
            <h1 className="text-4xl font-black text-white mb-2">Game Review</h1>
            <p className="text-neutral-400">Let's go over the critical moments of your match.</p>
          </div>
          
          <AIVoiceCoach 
            script={script} 
            onLineChange={handleLineChange} 
          />
        </div>

      </div>
    </div>
  );
}
