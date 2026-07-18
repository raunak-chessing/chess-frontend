import { useEffect, useState } from "react";
import { gameApi } from "../../api/gameApi";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Loader2, TrendingUp, TrendingDown, Target, BrainCircuit } from "lucide-react";

interface AnalyzedMove {
  move: string;
  fen: string;
  color: string;
  eval: number;
  mate: number | null;
  centipawns: number;
  bestMove: string | null;
  classification: string;
  explanation: string;
}

interface GameAnalysis {
  whiteAccuracy: number;
  blackAccuracy: number;
  moves: AnalyzedMove[];
}

interface GameReviewProps {
  pgn: string;
  whitePlayerName: string;
  blackPlayerName: string;
}

export function GameReview({ pgn, whitePlayerName, blackPlayerName }: GameReviewProps) {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gameApi.analyzePgn(pgn);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [pgn]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-cc-text-muted space-y-4 p-8">
        <Loader2 className="w-12 h-12 animate-spin text-cc-accent-blue" />
        <p className="font-semibold text-sm">Engine is analyzing the game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 p-8">
        <p>Error: {error}</p>
        <button onClick={fetchAnalysis} className="mt-4 px-4 py-2 bg-cc-bg-card rounded-md border border-cc-border">
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!analysis || !analysis.moves) return null;

  const chartData = analysis.moves.map((m, i) => {
    let evalScore = m.mate ? (m.mate > 0 ? 10 : -10) : (m.centipawns / 100);
    // Cap the eval score between -10 and 10 for better charting
    if (evalScore > 10) evalScore = 10;
    if (evalScore < -10) evalScore = -10;
    
    return {
      moveNum: Math.floor(i / 2) + 1,
      eval: evalScore,
      classification: m.classification
    };
  });

  return (
    <div className="flex flex-col h-full bg-cc-bg-base border-l border-cc-border overflow-y-auto">
      <div className="p-4 bg-cc-bg-surface border-b border-cc-border flex items-center justify-between">
        <h2 className="text-lg font-black font-serif text-cc-text-primary flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cc-accent-green" /> Game Review
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Accuracy Stats */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white text-black p-4 rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-3xl font-black">{analysis.whiteAccuracy}%</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 mt-1">{whitePlayerName}</span>
          </div>
          <div className="flex-1 bg-black text-white p-4 rounded-xl shadow-lg border border-white/20 flex flex-col items-center">
            <span className="text-3xl font-black">{analysis.blackAccuracy}%</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 mt-1">{blackPlayerName}</span>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-cc-bg-card border border-cc-border rounded-xl p-4 h-64">
          <h3 className="text-xs font-bold uppercase text-cc-text-secondary mb-4 flex items-center gap-1">
            <Target className="w-3 h-3" /> Evaluation Graph
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEval" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9}/>
                  <stop offset="48%" stopColor="#ffffff" stopOpacity={0.2}/>
                  <stop offset="52%" stopColor="#000000" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="#000000" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="moveNum" hide />
              <YAxis domain={[-10, 10]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#888' }}
              />
              <ReferenceLine y={0} stroke="#333" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="eval" stroke="#666" fill="url(#colorEval)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Moves Breakdown */}
        <div className="bg-cc-bg-card border border-cc-border rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase text-cc-text-secondary mb-4">Key Moments</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {analysis.moves.map((m, i) => {
              if (m.classification === 'Book' || m.classification === 'Best Move' || m.classification === 'Excellent' || m.classification === 'Good') return null;
              
              const moveNum = Math.floor(i / 2) + 1;
              const isWhite = m.color === 'w';
              
              let badgeColor = "bg-gray-500 text-white";
              let icon = "?";
              
              if (m.classification === 'Blunder') { badgeColor = "bg-red-600 text-white"; icon = "??"; }
              else if (m.classification === 'Mistake') { badgeColor = "bg-orange-500 text-white"; icon = "?"; }
              else if (m.classification === 'Inaccuracy') { badgeColor = "bg-yellow-500 text-black"; icon = "?!"; }
              else if (m.classification === 'Miss') { badgeColor = "bg-pink-500 text-white"; icon = "❌"; }
              else if (m.classification === 'Brilliant') { badgeColor = "bg-cyan-400 text-black"; icon = "!!"; }
              else if (m.classification === 'Great') { badgeColor = "bg-blue-500 text-white"; icon = "!"; }

              return (
                <div key={i} className="flex flex-col p-3 rounded-lg bg-cc-bg-surface hover:bg-cc-border transition-colors gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-cc-text-muted text-sm w-6">{moveNum}.{isWhite ? '' : '..'}</span>
                      <span className="font-bold font-mono text-cc-text-primary text-base">{m.move}</span>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 uppercase tracking-wider ${badgeColor}`}>
                        <span>{icon}</span> {m.classification}
                      </div>
                    </div>
                    <div className="text-xs text-cc-text-secondary font-mono">
                      Eval: {m.mate ? `M${Math.abs(m.mate)}` : (m.centipawns > 0 ? '+' : '') + (m.centipawns / 100).toFixed(2)}
                    </div>
                  </div>
                  {m.explanation && (
                    <div className="text-xs text-zinc-400 pl-9 italic">
                      {m.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
