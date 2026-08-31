'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Board from '@/features/game/components/Board/Board';
import AIVoiceCoach from '@/features/analysis/components/AIVoiceCoach';
import { CoachScriptLine } from '@/features/analysis/services/AudioProvider';
import { fetchApi } from '@/lib/api-client';
import { z } from 'zod';
import { LoadingState } from '@/components/ui/LoadingState';

const CoachResponseSchema = z.object({
  script: z.array(z.object({
    id: z.string(),
    text: z.string(),
    audioUrl: z.string().optional(),
    fen: z.string()
  })).optional()
}).passthrough();

export default function AIReviewPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const [script, setScript] = useState<CoachScriptLine[]>([]);
  const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScript() {
      try {
        const data = await fetchApi(CoachResponseSchema, `/api/analysis/${gameId}/coach`);
        const parsedScript: CoachScriptLine[] = (data.script || []).map(line => ({
          ...line,
          audioUrl: line.audioUrl || null
        }));
        setScript(parsedScript);
        if (parsedScript.length > 0) {
          setCurrentFen(parsedScript[0].fen);
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
        <LoadingState label="Loading AI grandmaster analysis…" />
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

          <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xl font-bold text-amber-500 mb-2 border-b border-neutral-800 pb-2">Master Games Explorer</h2>
            <OpeningExplorerWidget fen={currentFen} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Widget to fetch and display top master games for the current position
function OpeningExplorerWidget({ fen }: { fen: string }) {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import('@/lib/lichessApi').then(({ lichessApi }) => {
      setLoading(true);
      lichessApi.getTopGames(fen, 3)
        .then(res => setGames(res || []))
        .catch(() => setGames([]))
        .finally(() => setLoading(false));
    });
  }, [fen]);

  if (loading) return <div className="text-neutral-500 text-sm animate-pulse">Consulting opening databases...</div>;
  if (!games.length) return <div className="text-neutral-500 text-sm">No master games found for this exact position.</div>;

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
      {games.map((g, idx) => (
        <a 
          key={idx} 
          href={`https://lichess.org/${g.id}`} 
          target="_blank" 
          rel="noreferrer"
          className="block bg-neutral-950 p-3 rounded-lg hover:bg-neutral-800 transition-colors border border-neutral-800"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-white font-bold">{g.white.name} <span className="text-neutral-500 font-normal">({g.white.rating})</span></span>
            <span className="text-neutral-400 text-xs">vs</span>
            <span className="text-white font-bold">{g.black.name} <span className="text-neutral-500 font-normal">({g.black.rating})</span></span>
          </div>
          <div className="flex justify-between items-center mt-1 text-xs">
            <span className="text-amber-500">{g.year}</span>
            <span className="text-green-400">{g.winner === 'white' ? '1-0' : g.winner === 'black' ? '0-1' : '1/2-1/2'}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
