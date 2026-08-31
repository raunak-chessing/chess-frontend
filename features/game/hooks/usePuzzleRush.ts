"use client";

import { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { playSound } from "../../../lib/utils";
import { usePuzzlesStore } from "../../puzzles/store/puzzlesStore";

/**
 * Timer, lives, scoring, and move-validation logic for a Puzzle Rush run —
 * extracted out of the PuzzleRush component so it's purely presentational.
 */
export function usePuzzleRush() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("text-cc-text-primary");

  const { rushBatch, fetchRushBatch, currentRushIndex, nextRushPuzzle, resetRush } = usePuzzlesStore();
  const puzzle = rushBatch[currentRushIndex];

  // Local chess instance for validating moves
  const [localChess, setLocalChess] = useState<Chess>(new Chess());
  const [boardPosition, setBoardPosition] = useState<string>("start");

  // Timer countdown
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Sync FEN when starting a new puzzle
  const loadPuzzle = useCallback(
    (idx: number) => {
      const p = rushBatch[idx];
      if (!p) {
        if (rushBatch.length > 0) setIsGameOver(true);
        return;
      }
      const c = new Chess(p.fen);
      setLocalChess(c);
      setBoardPosition(p.fen);
      setCurrentMoveIdx(0);
      setStatusMessage("Puzzle " + p.id);
      setStatusColor("text-cc-text-primary");
    },
    [rushBatch],
  );

  useEffect(() => {
    // Initial fetch
    if (rushBatch.length === 0 && !isGameOver) {
      fetchRushBatch();
    }
  }, [rushBatch.length, isGameOver, fetchRushBatch]);

  useEffect(() => {
    loadPuzzle(currentRushIndex);
  }, [currentRushIndex, loadPuzzle]);

  const handlePieceDrop = useCallback(
    (source: string, target: string): boolean => {
      if (isGameOver || !puzzle) return false;

      const moveStr = `${source}${target}`;
      const correctMove = puzzle.moves[currentMoveIdx];
      const expectedFromTo = correctMove.slice(0, 4);
      const expectedPromotion = correctMove.length > 4 ? correctMove[4] : undefined;

      if (moveStr === expectedFromTo) {
        try {
          const move = localChess.move({ from: source, to: target, promotion: expectedPromotion });
          if (move) {
            setBoardPosition(localChess.fen());
            const nextIdx = currentMoveIdx + 1;

            playSound("/sounds/move.mp3");

            if (nextIdx >= puzzle.moves.length) {
              // Puzzle Solved!
              setScore((s) => s + 1);
              setStatusMessage("Correct!");
              setStatusColor("text-cc-green font-bold");

              playSound("/sounds/capture.mp3");

              // Brief delay then load next puzzle
              setTimeout(() => {
                nextRushPuzzle();
              }, 800);
            } else {
              // Wait for next move
              setCurrentMoveIdx(nextIdx);
            }
            return true;
          }
        } catch (err) {
          // Fall through to incorrect
        }
      }

      // Incorrect move
      playSound("/sounds/check.mp3");

      setLives((l) => {
        const nextLives = l - 1;
        if (nextLives <= 0) {
          setIsGameOver(true);
        }
        return nextLives;
      });

      setStatusMessage("Oops, that's not the best move! Try again.");
      setStatusColor("text-red-500 font-bold");

      // Reset board position to starting puzzle state
      const c = new Chess(puzzle.fen);
      setLocalChess(c);
      setBoardPosition(puzzle.fen);
      setCurrentMoveIdx(0);

      return false;
    },
    [isGameOver, puzzle, currentMoveIdx, localChess],
  );

  const handleRestart = useCallback(() => {
    resetRush();
    setScore(0);
    setLives(3);
    setTimeRemaining(180);
    setIsGameOver(false);
    fetchRushBatch();
  }, [fetchRushBatch, resetRush]);

  return {
    puzzle,
    currentRushIndex,
    score,
    lives,
    timeRemaining,
    isGameOver,
    statusMessage,
    statusColor,
    boardPosition,
    handlePieceDrop,
    handleRestart,
  };
}
