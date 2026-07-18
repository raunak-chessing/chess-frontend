"use client";

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import dynamic from "next/dynamic";
const Chessboard = dynamic(() => import("react-chessboard").then(mod => mod.Chessboard), { ssr: false });
import type { ChessboardOptions } from 'react-chessboard';
import { studiesApi } from '../../api/studiesApi';
import { useStudyStore } from '../../store/studiesStore';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';
import { Save, Plus } from 'lucide-react';

type BoardArrows = NonNullable<ChessboardOptions['arrows']>;

type StudyChapter = {
  id: string;
  title: string;
  pgn?: string | null;
  fen?: string | null;
  annotations?: BoardArrows | null;
};

type ActiveStudy = {
  title: string;
  ownerId?: string | null;
  owner: {
    name: string;
  };
  chapters?: StudyChapter[];
};

function loadChapterGame(chapter: StudyChapter) {
  const nextGame = new Chess();
  if (chapter.pgn) {
    nextGame.loadPgn(chapter.pgn);
  } else if (chapter.fen) {
    nextGame.load(chapter.fen);
  }
  return nextGame;
}

export function StudyEditor({ studyId }: { studyId: string }) {
  const { data: session } = authClient.useSession();
  const { activeStudy, setActiveStudy, activeChapterId, setActiveChapterId, updateActiveChapter } = useStudyStore();
  const study = activeStudy as ActiveStudy | null;
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(new Chess());
  const [arrows, setArrows] = useState<BoardArrows>([]);

  useEffect(() => {
    studiesApi.getStudy(studyId)
      .then(study => {
        setActiveStudy(study);
        if (study.chapters && study.chapters.length > 0) {
          const firstChapter = study.chapters[0] as StudyChapter;
          setGame(loadChapterGame(firstChapter));
          setArrows(firstChapter.annotations ?? []);
        }
      })
      .catch(() => toast.error('Failed to load study'))
      .finally(() => setLoading(false));
  }, [studyId, setActiveStudy]);

  const activeChapter = useMemo(() => {
    return study?.chapters?.find((chapter) => chapter.id === activeChapterId);
  }, [study, activeChapterId]);

  const isOwner = session?.user?.id === study?.ownerId;

  const handleChapterSelect = (chapter: StudyChapter) => {
    setActiveChapterId(chapter.id);
    setGame(loadChapterGame(chapter));
    setArrows(chapter.annotations ?? []);
  };

  const handleAddChapter = async () => {
    if (!study) return;
    try {
      const title = prompt('Chapter title:', `Chapter ${(study.chapters?.length || 0) + 1}`);
      if (!title) return;
      await studiesApi.addChapter(studyId, title);
      const updatedStudy = await studiesApi.getStudy(studyId);
      setActiveStudy(updatedStudy);
    } catch {
      toast.error('Failed to add chapter');
    }
  };

  const saveChapter = async () => {
    if (!activeChapterId) return;
    try {
      await studiesApi.updateChapter(activeChapterId, {
        fen: game.fen(),
        pgn: game.pgn(),
        annotations: arrows,
      });
      updateActiveChapter({ fen: game.fen(), pgn: game.pgn(), annotations: arrows });
      toast.success('Chapter saved');
    } catch {
      toast.error('Failed to save chapter');
    }
  };

  const onDrop = useCallback<NonNullable<ChessboardOptions['onPieceDrop']>>(
    ({ sourceSquare, targetSquare }) => {
      if (!isOwner) return false;
      if (!targetSquare) return false;
      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      };
      try {
        const result = game.move(move);
        if (result) {
          setGame(new Chess(game.fen()));
          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    [game, isOwner],
  );

  const chessboardOptions = useMemo<ChessboardOptions>(
    () => ({
      id: 'study-editor-board',
      position: game.fen(),
      onPieceDrop: onDrop,
      boardOrientation: 'white',
      arrows,
      allowDrawingArrows: isOwner,
      onArrowsChange: ({ arrows }) => setArrows(arrows),
    }),
    [arrows, game, isOwner, onDrop],
  );

  if (loading) return <div className="p-8 text-center">Loading study...</div>;
  if (!study) return <div className="p-8 text-center">Study not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-4rem)]">
      {/* Sidebar for Chapters */}
      <div className="w-full md:w-64 bg-surface border border-surface-highlight rounded-lg p-4 flex flex-col h-full">
        <h2 className="text-xl font-bold text-text-primary mb-4">{study.title}</h2>
        <div className="text-sm text-text-secondary mb-4">by {study.owner.name}</div>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {study.chapters?.map((chapter, idx) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterSelect(chapter)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeChapterId === chapter.id 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-text-primary hover:bg-surface-highlight'
              }`}
            >
              {idx + 1}. {chapter.title}
            </button>
          ))}
        </div>

        {isOwner && (
          <button 
            onClick={handleAddChapter}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-surface-highlight hover:bg-[var(--cc-border)] text-text-primary rounded-md transition-colors"
          >
            <Plus size={16} /> Add Chapter
          </button>
        )}
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-surface-highlight">
          <h3 className="text-lg font-bold text-text-primary">{activeChapter?.title || 'No Chapter Selected'}</h3>
          {isOwner && (
            <button 
              onClick={saveChapter}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm"
            >
              <Save size={16} /> Save Changes
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start h-full">
          <div className="w-full max-w-[600px] aspect-square flex-shrink-0">
            <Chessboard options={chessboardOptions} />
          </div>
          
          {/* PGN / Notation Panel */}
          <div className="flex-1 bg-surface border border-surface-highlight rounded-lg p-4 h-full min-h-[300px] overflow-y-auto">
            <h4 className="font-bold text-text-primary mb-2">Move List & Annotations</h4>
            <div className="font-mono text-sm text-text-primary whitespace-pre-wrap bg-bg-page p-3 rounded-md">
              {game.pgn() || 'No moves yet. Play moves on the board to start annotating!'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
