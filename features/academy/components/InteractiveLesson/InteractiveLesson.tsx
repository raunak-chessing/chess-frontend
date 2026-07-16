import { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Chess } from "chess.js";
import { Board } from "../../../game/components/Board";
import { AcademyLesson, ACADEMY_LESSONS } from "../../constants/lessons";

interface InteractiveLessonProps {
  lesson: AcademyLesson;
  onReturnToDashboard: () => void;
  onCompleteLesson: (lessonId: string) => void;
}

export const InteractiveLesson = memo(function InteractiveLesson({
  lesson,
  onReturnToDashboard,
  onCompleteLesson,
}: InteractiveLessonProps) {
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [boardPosition, setBoardPosition] = useState(lesson.fen);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("text-cc-text-primary");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showTheory, setShowTheory] = useState(true);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showVideo, setShowVideo] = useState(!!lesson.videoId);

  const [isSparring, setIsSparring] = useState(false);
  const [sparringChess, setSparringChess] = useState<Chess | null>(null);
  const sparringWorkerRef = useRef<Worker | null>(null);

  const [localChess, setLocalChess] = useState<Chess>(() => {
    return new Chess(lesson.fen);
  });

  const currentLessonIndex = useMemo(() => {
    return ACADEMY_LESSONS.findIndex((l) => l.id === lesson.id);
  }, [lesson.id]);

  const nextLesson = useMemo(() => {
    const sameLevelLessons = ACADEMY_LESSONS.filter((l) => l.level === lesson.level);
    const currentInLevel = sameLevelLessons.findIndex((l) => l.id === lesson.id);
    if (currentInLevel < sameLevelLessons.length - 1) {
      return sameLevelLessons[currentInLevel + 1];
    }
    return null;
  }, [lesson]);

  useEffect(() => {
    setBoardPosition(lesson.fen);
    setLocalChess(new Chess(lesson.fen));
    setCurrentMoveIdx(0);
    setStatusMessage(lesson.prompts[0] || "Make the correct move!");
    setStatusColor("text-cc-text-primary");
    setIsCompleted(false);
    setShowHint(false);
    setShowTheory(true);
    setWrongAttempts(0);
    setShowVideo(!!lesson.videoId);
    setIsSparring(false);
    if (sparringWorkerRef.current) {
      sparringWorkerRef.current.terminate();
      sparringWorkerRef.current = null;
    }
  }, [lesson]);

  useEffect(() => {
    return () => {
      if (sparringWorkerRef.current) {
        sparringWorkerRef.current.terminate();
      }
    };
  }, []);

  const handleToggleSparring = () => {
    if (!isSparring) {
      const sc = new Chess(boardPosition);
      setSparringChess(sc);
      setIsSparring(true);
      setStatusMessage("Sparring Mode — play freely against Stockfish!");
      setStatusColor("text-amber-400 font-bold");
    } else {
      setIsSparring(false);
      setLocalChess(new Chess(lesson.fen));
      setBoardPosition(lesson.fen);
      setCurrentMoveIdx(0);
      setStatusMessage(lesson.prompts[0] || "Make the correct move!");
      setStatusColor("text-cc-text-primary");
      if (sparringWorkerRef.current) {
        sparringWorkerRef.current.terminate();
        sparringWorkerRef.current = null;
      }
    }
  };

  const handlePieceDrop = useCallback(
    (source: string, target: string): boolean => {
      if (isSparring && sparringChess) {
        try {
          const move = sparringChess.move({ from: source, to: target, promotion: "q" });
          if (move) {
            setBoardPosition(sparringChess.fen());
            new Audio("/sounds/move.mp3").play().catch(() => {});

            if (sparringChess.isGameOver()) {
              setStatusMessage(
                sparringChess.isCheckmate()
                  ? "Checkmate! Well played."
                  : "Draw! Good defense."
              );
              setStatusColor("text-cc-green font-bold");
              return true;
            }

            setStatusMessage("Stockfish is thinking...");
            if (sparringWorkerRef.current) {
              sparringWorkerRef.current.terminate();
            }

            const worker = new Worker("/stockfish.js");
            sparringWorkerRef.current = worker;

            worker.postMessage("uci");
            worker.postMessage(`position fen ${sparringChess.fen()}`);
            worker.postMessage("go depth 8");

            worker.onmessage = (e) => {
              const line = e.data;
              if (line.startsWith("bestmove")) {
                const bestMove = line.split(" ")[1];
                if (bestMove && bestMove !== "(none)") {
                  const fromSq = bestMove.slice(0, 2);
                  const toSq = bestMove.slice(2, 4);
                  try {
                    const scMove = sparringChess.move({ from: fromSq, to: toSq, promotion: "q" });
                    if (scMove) {
                      setBoardPosition(sparringChess.fen());
                      new Audio("/sounds/capture.mp3").play().catch(() => {});

                      if (sparringChess.isGameOver()) {
                        setStatusMessage(
                          sparringChess.isCheckmate()
                            ? "Checkmate! Stockfish wins this round."
                            : "Draw! Sparring complete."
                        );
                        setStatusColor("text-red-500 font-bold");
                      } else {
                        setStatusMessage("Your turn — make your move!");
                      }
                    }
                  } catch {
                    setStatusMessage("Your turn — make your move!");
                  }
                }
              }
            };
            return true;
          }
        } catch {
          return false;
        }
      }

      if (isCompleted) return false;

      const moveStr = `${source}${target}`;
      const correctMove = lesson.moves[currentMoveIdx];

      if (moveStr === correctMove) {
        try {
          const move = localChess.move({ from: source, to: target, promotion: "q" });
          if (move) {
            new Audio("/sounds/move.mp3").play().catch(() => {});
            const nextIdx = currentMoveIdx + 1;

            if (nextIdx >= lesson.moves.length) {
              setBoardPosition(localChess.fen());
              setIsCompleted(true);
              setStatusMessage("Excellent! You've mastered this concept.");
              setStatusColor("text-cc-green font-bold");
              new Audio("/sounds/capture.mp3").play().catch(() => {});
              onCompleteLesson(lesson.id);
            } else {
              const oppReply = lesson.opponentMoves[currentMoveIdx];
              if (oppReply) {
                setTimeout(() => {
                  try {
                    const fromSq = oppReply.slice(0, 2);
                    const toSq = oppReply.slice(2, 4);
                    const oppMove = localChess.move({ from: fromSq, to: toSq, promotion: "q" });
                    if (oppMove) {
                      new Audio("/sounds/capture.mp3").play().catch(() => {});
                      setBoardPosition(localChess.fen());
                      setCurrentMoveIdx(nextIdx);
                      setStatusMessage(lesson.prompts[nextIdx] || "Find the next move.");
                      setStatusColor("text-cc-text-primary");
                      setShowHint(false);
                      setWrongAttempts(0);
                    }
                  } catch {
                    setCurrentMoveIdx(nextIdx);
                    setBoardPosition(localChess.fen());
                    setStatusMessage(lesson.prompts[nextIdx] || "Find the next move.");
                    setStatusColor("text-cc-text-primary");
                    setShowHint(false);
                    setWrongAttempts(0);
                  }
                }, 600);
              } else {
                setCurrentMoveIdx(nextIdx);
                setBoardPosition(localChess.fen());
                setStatusMessage(lesson.prompts[nextIdx] || "Find the next move.");
                setStatusColor("text-cc-text-primary");
                setShowHint(false);
                setWrongAttempts(0);
              }
            }
            return true;
          }
        } catch {
          return false;
        }
      }

      new Audio("/sounds/check.mp3").play().catch(() => {});
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);

      if (newAttempts >= 3 && !showHint) {
        setShowHint(true);
        setStatusMessage("That's not right. Here's a hint to help you!");
        setStatusColor("text-amber-400");
      } else {
        setStatusMessage("Not quite — think about the lesson concept and try again.");
        setStatusColor("text-red-400");
      }

      setBoardPosition(localChess.fen());
      return false;
    },
    [lesson, currentMoveIdx, localChess, isCompleted, onCompleteLesson, isSparring, sparringChess, wrongAttempts, showHint]
  );

  const handleRestart = useCallback(() => {
    setBoardPosition(lesson.fen);
    setLocalChess(new Chess(lesson.fen));
    setCurrentMoveIdx(0);
    setStatusMessage(lesson.prompts[0] || "Make the correct move!");
    setStatusColor("text-cc-text-primary");
    setIsCompleted(false);
    setShowHint(false);
    setWrongAttempts(0);
    setShowVideo(!!lesson.videoId);
    setIsSparring(false);
    if (sparringWorkerRef.current) {
      sparringWorkerRef.current.terminate();
      sparringWorkerRef.current = null;
    }
  }, [lesson]);

  const moveProgress = lesson.moves.length > 0 ? ((currentMoveIdx) / lesson.moves.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl border border-cc-border-light shadow-2xl">
      {/* Lesson Header */}
      <div className="flex justify-between items-center bg-cc-bg-card p-4 rounded-2xl border border-cc-border shadow-md">
        <div className="flex items-center gap-4 text-left">
          <span className="w-10 h-10 rounded-xl bg-cc-bg-sidebar border border-cc-border-light flex items-center justify-center text-lg font-bold text-cc-text-primary font-mono">
            {currentLessonIndex + 1}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] text-cc-text-muted font-bold uppercase tracking-wider font-serif">
              {lesson.category} • {lesson.level}
            </span>
            <span className="text-lg font-serif font-black text-cc-text-primary leading-tight">
              {lesson.title}
            </span>
          </div>
        </div>
        <button
          onClick={onReturnToDashboard}
          className="text-xs text-cc-text-secondary hover:text-white transition-colors border border-cc-border-light px-4 py-2 rounded-xl cursor-pointer hover:bg-cc-bg-hover font-serif"
        >
          ← Back
        </button>
      </div>

      {/* Move Progress Bar */}
      {!isSparring && (
        <div className="w-full h-1.5 bg-cc-bg-sidebar rounded-full overflow-hidden border border-cc-border-light">
          <div
            style={{ width: `${isCompleted ? 100 : moveProgress}%` }}
            className={`h-full transition-all duration-500 rounded-full ${
              isCompleted
                ? "bg-cc-green"
                : "bg-cc-bg-hover"
            }`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Area: Board or Video */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[600px] relative rounded-2xl overflow-hidden border border-cc-border shadow-xl">
            {showVideo ? (
              <div className="w-full aspect-video bg-black flex flex-col">
                <iframe 
                  src={`https://www.youtube.com/embed/${lesson.videoId}?autoplay=1`} 
                  title="Lesson Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : (
              <Board
                position={boardPosition}
                flipped={lesson.turn === "b"}
                viewMode="2d"
                onPieceDrop={handlePieceDrop}
                squareStyles={{}}
                onSquareClick={() => {}}
              />
            )}

            {/* Completion Overlay */}
            {isCompleted && (
              <div className="absolute inset-0 bg-cc-bg-page/95 backdrop-blur-sm flex flex-col justify-center items-center gap-5 text-center z-40">
                <div className="w-16 h-16 rounded-full bg-cc-green/20 border-2 border-cc-green flex items-center justify-center">
                  <span className="text-3xl text-cc-green">✓</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-serif font-extrabold text-cc-green uppercase tracking-wider">
                    Lesson Complete!
                  </h3>
                  <p className="text-[11px] text-cc-text-secondary max-w-xs leading-relaxed">
                    You've demonstrated understanding of <span className="text-cc-text-primary font-bold">{lesson.title}</span>.
                    Continue to the next lesson or practice this position.
                  </p>
                </div>
                <div className="flex gap-3 mt-1">
                  {nextLesson ? (
                    <button
                      onClick={() => {
                        onReturnToDashboard();
                        setTimeout(() => {
                          const event = new CustomEvent("selectLesson", { detail: nextLesson.id });
                          window.dispatchEvent(event);
                        }, 100);
                      }}
                      className="px-6 py-2.5 text-xs font-bold rounded-xl bg-cc-green hover:bg-cc-green-hover text-white active:scale-95 transition-all shadow-lg cursor-pointer"
                    >
                      Next Lesson →
                    </button>
                  ) : (
                    <button
                      onClick={onReturnToDashboard}
                      className="px-6 py-2.5 text-xs font-bold rounded-xl bg-cc-green hover:bg-cc-green-hover text-white active:scale-95 transition-all shadow-lg cursor-pointer"
                    >
                      Back to Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleToggleSparring}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-cc-bg-sidebar/50 border border-cc-border-light text-cc-text-primary hover:bg-cc-bg-hover transition-all cursor-pointer"
                  >
                    Practice Position 🤖
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {showVideo ? (
             <div className="bg-cc-bg-card p-6 rounded-2xl border border-cc-border shadow-md flex flex-col gap-6 text-center">
               <div className="text-4xl">🎥</div>
               <h3 className="text-xl font-serif font-extrabold text-white">Grandmaster Intro</h3>
               <p className="text-zinc-400 text-sm">Watch the video to understand the core concepts behind this lesson before attempting the challenge.</p>
               <button
                 onClick={() => setShowVideo(false)}
                 className="w-full py-4 bg-cc-green hover:bg-cc-green-hover text-white font-bold rounded-xl text-lg transition-all shadow-lg mt-4"
               >
                 Start Challenge
               </button>
             </div>
          ) : (
          /* Coach Panel */
          <div className="bg-cc-bg-card p-5 rounded-2xl border border-cc-border shadow-md flex flex-col gap-4">
            {/* Step Counter */}
            <div className="flex justify-between items-center border-b border-cc-border-light pb-3">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-serif">
                {isSparring ? "Free Play Mode" : `Step ${currentMoveIdx + 1} of ${lesson.moves.length}`}
              </span>
              {!isSparring && (
                <div className="flex gap-1.5">
                  {lesson.moves.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        idx < currentMoveIdx
                          ? "bg-cc-green shadow-md"
                          : idx === currentMoveIdx
                          ? "bg-cc-text-primary scale-125 shadow-md"
                          : "bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Coach Instruction */}
            <div className="flex flex-col gap-3 text-left">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-cc-bg-sidebar border border-cc-border-light flex items-center justify-center text-xl select-none shadow-md">
                  🎓
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] text-cc-text-primary font-serif font-extrabold leading-none">
                    Coach
                  </span>
                  <span className="text-[9px] text-zinc-500 font-medium">Academy Instructor</span>
                </div>
              </div>

              <div className="relative bg-cc-bg-input border border-cc-border-light p-4 rounded-2xl min-h-[80px]">
                <p className={`text-[13px] leading-relaxed font-medium transition-all duration-300 ${statusColor}`}>
                  {statusMessage}
                </p>
              </div>
            </div>

            {/* Hint Section */}
            {!isSparring && (
              <div className="flex flex-col gap-2">
                {showHint ? (
                  <div className="p-3.5 bg-amber-950/20 border border-amber-800/30 rounded-xl text-left">
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider font-serif flex items-center gap-1.5">
                      💡 Hint
                    </span>
                    <p className="text-[11px] text-zinc-300 font-medium mt-1.5 leading-relaxed">
                      {lesson.hints[currentMoveIdx]}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="w-full py-2.5 text-xs font-bold rounded-xl border border-amber-800/30 text-amber-500/80 hover:text-amber-400 hover:bg-amber-950/15 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Show Hint 💡
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto pt-3 border-t border-cc-border-light">
              <button
                onClick={handleToggleSparring}
                className={`flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] ${
                  isSparring
                    ? "bg-amber-700 hover:bg-amber-600 text-white"
                    : "bg-cc-bg-sidebar/60 hover:bg-cc-bg-sidebar border border-cc-border-light text-cc-text-secondary hover:text-white"
                }`}
              >
                {isSparring ? "Exit Practice ✕" : "Practice 🤖"}
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 text-[11px] font-bold rounded-xl bg-cc-bg-sidebar/60 hover:bg-cc-bg-sidebar border border-cc-border-light text-cc-text-secondary hover:text-white transition-all cursor-pointer active:scale-[0.98]"
              >
                Restart 🔄
              </button>
            </div>
          </div>
          )}

          {/* Theory Panel (Collapsible) */}
          <div className="bg-cc-bg-card/80 rounded-2xl border border-cc-border-light overflow-hidden">
            <button
              onClick={() => setShowTheory(!showTheory)}
              className="w-full p-4 flex justify-between items-center cursor-pointer hover:bg-cc-bg-hover transition-colors text-left"
            >
              <span className="text-[11px] text-cc-text-primary font-serif font-extrabold uppercase tracking-wider flex items-center gap-2">
                📚 Theory & Explanation
              </span>
              <span className="text-zinc-500 text-xs">
                {showTheory ? "▾" : "▸"}
              </span>
            </button>
            {showTheory && (
              <div className="px-4 pb-4 border-t border-cc-border-light/30">
                <p className="text-[11px] text-zinc-400 font-medium leading-[1.8] mt-3">
                  {lesson.theory}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
