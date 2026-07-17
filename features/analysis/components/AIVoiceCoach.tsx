'use client';

import React, { useEffect, useState, useRef } from 'react';
import { BrowserTTSProvider, CoachScriptLine } from '../services/AudioProvider';
import { Mic, Play, Square, SkipForward } from 'lucide-react';

interface AIVoiceCoachProps {
  script: CoachScriptLine[];
  onLineChange: (line: CoachScriptLine) => void;
}

export default function AIVoiceCoach({ script, onLineChange }: AIVoiceCoachProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const audioProvider = useRef(new BrowserTTSProvider());
  const isPlayingRef = useRef(false);

  // Sync state with ref for async callbacks
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioProvider.current.stop();
    };
  }, []);

  const playNextLine = async (index: number) => {
    if (index >= script.length) {
      setIsPlaying(false);
      return;
    }

    if (!isPlayingRef.current) return;

    setCurrentLineIndex(index);
    const line = script[index];
    onLineChange(line);

    await audioProvider.current.speak(
      line.text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );

    // Wait a brief moment before the next line
    setTimeout(() => {
      if (isPlayingRef.current) {
        playNextLine(index + 1);
      }
    }, 500);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioProvider.current.stop();
      setIsSpeaking(false);
    } else {
      setIsPlaying(true);
      playNextLine(currentLineIndex);
    }
  };

  const handleSkip = () => {
    audioProvider.current.stop();
    if (currentLineIndex < script.length - 1) {
      playNextLine(currentLineIndex + 1);
    } else {
      setIsPlaying(false);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl relative overflow-hidden">
      {/* Decorative glowing orb that reacts to speaking */}
      <div 
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl transition-all duration-300 ${
          isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-30'
        }`}
      />

      <div className="flex items-center justify-between z-10">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 font-black text-xl flex items-center gap-2 tracking-wider">
          <Mic className={`w-6 h-6 text-blue-400 ${isSpeaking ? 'animate-pulse' : ''}`} />
          AI GRANDMASTER
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center border border-neutral-700 transition-colors"
          >
            {isPlaying ? <Square className="w-4 h-4 text-red-400" fill="currentColor" /> : <Play className="w-4 h-4 text-green-400" fill="currentColor" />}
          </button>
          <button 
            onClick={handleSkip}
            disabled={!isPlaying}
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center border border-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 min-h-[100px] flex items-center z-10 relative">
        <p className="text-lg text-neutral-200 font-medium leading-relaxed italic">
          "{script[currentLineIndex]?.text || 'Press play to start the review.'}"
        </p>
      </div>

      <div className="flex items-center gap-2 mt-2 z-10">
        {script.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              idx === currentLineIndex 
                ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                : idx < currentLineIndex 
                  ? 'bg-neutral-600' 
                  : 'bg-neutral-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
