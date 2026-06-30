import { AudioPlayer, useAudioPlayer } from 'expo-audio';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useUser } from './UserContext';

type SoundId = 'correct' | 'wrong' | 'coin' | 'levelup';

interface SoundContextValue {
  play: (id: SoundId) => void;
}

const SoundContext = createContext<SoundContextValue>({ play: () => {} });

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { soundOn } = useUser();
  const correctPlayer = useAudioPlayer(require('../assets/sfx/correct.wav'));
  const wrongPlayer = useAudioPlayer(require('../assets/sfx/wrong.wav'));
  const coinPlayer = useAudioPlayer(require('../assets/sfx/coin.wav'));
  const levelupPlayer = useAudioPlayer(require('../assets/sfx/levelup.wav'));

  const soundPlayers = useRef<Record<SoundId, AudioPlayer>>({
    correct: correctPlayer,
    wrong: wrongPlayer,
    coin: coinPlayer,
    levelup: levelupPlayer,
  });

  // Update refs when players change
  useEffect(() => {
    soundPlayers.current = {
      correct: correctPlayer,
      wrong: wrongPlayer,
      coin: coinPlayer,
      levelup: levelupPlayer,
    };
  }, [correctPlayer, wrongPlayer, coinPlayer, levelupPlayer]);

  const play = React.useCallback((id: SoundId) => {
    if (!soundOn) return; // Don't play if sound is off
    
    const player = soundPlayers.current[id];
    if (player) {
      try {
        player.seekTo(0); // Reset to start
        player.play();
      } catch (error) {
        if (__DEV__) {
          console.warn(`Failed to play sound ${id}:`, error);
        }
      }
    }
  }, [soundOn]);

  const contextValue = React.useMemo(() => ({ play }), [play]);

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}; 