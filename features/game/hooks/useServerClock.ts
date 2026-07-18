import { useState, useEffect, useRef } from 'react';

export interface ServerClockState {
  displayWhiteTime: string;
  displayBlackTime: string;
  isWhiteLow: boolean;
  isBlackLow: boolean;
}

function formatTime(ms: number): string {
  if (ms <= 0) return "0:00.0";
  const totalSeconds = ms / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((ms % 1000) / 100);

  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${secs}.${tenths}`;
  }
}

export function useServerClock(
  activeTurn: 'w' | 'b',
  serverWhiteMs: number,
  serverBlackMs: number,
  serverSyncTimestamp: number,
  isGameActive: boolean,
  onTimeout?: (color: 'w' | 'b') => void
): ServerClockState {
  const [whiteDisplay, setWhiteDisplay] = useState(serverWhiteMs);
  const [blackDisplay, setBlackDisplay] = useState(serverBlackMs);
  const frameRef = useRef<number>();
  const timeoutCalledRef = useRef(false);

  useEffect(() => {
    // Reset timeout flag when sync timestamp changes significantly or game resets
    timeoutCalledRef.current = false;
  }, [serverSyncTimestamp, isGameActive]);

  useEffect(() => {
    if (!isGameActive) {
      setWhiteDisplay(serverWhiteMs);
      setBlackDisplay(serverBlackMs);
      return;
    }

    const updateClocks = () => {
      const now = Date.now();
      const elapsed = now - serverSyncTimestamp;

      let currentWhite = serverWhiteMs;
      let currentBlack = serverBlackMs;

      if (activeTurn === 'w') {
        currentWhite = Math.max(0, serverWhiteMs - elapsed);
      } else {
        currentBlack = Math.max(0, serverBlackMs - elapsed);
      }

      setWhiteDisplay(currentWhite);
      setBlackDisplay(currentBlack);

      if (currentWhite <= 0 && !timeoutCalledRef.current) {
        timeoutCalledRef.current = true;
        onTimeout?.('w');
      } else if (currentBlack <= 0 && !timeoutCalledRef.current) {
        timeoutCalledRef.current = true;
        onTimeout?.('b');
      }

      frameRef.current = requestAnimationFrame(updateClocks);
    };

    frameRef.current = requestAnimationFrame(updateClocks);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [activeTurn, serverWhiteMs, serverBlackMs, serverSyncTimestamp, isGameActive, onTimeout]);

  return {
    displayWhiteTime: formatTime(whiteDisplay),
    displayBlackTime: formatTime(blackDisplay),
    isWhiteLow: whiteDisplay > 0 && whiteDisplay < 30000,
    isBlackLow: blackDisplay > 0 && blackDisplay < 30000,
  };
}
