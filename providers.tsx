import React from 'react';
import { BoostersProvider } from './contexts/BoostersContext';
import { ChallengesProvider } from './contexts/ChallengesContext';
import { CirclesProvider } from './contexts/CirclesContext';
import { LeaderboardProvider } from './contexts/LeaderboardContext';
import { QuizProvider } from './contexts/QuizContext';
import { SoundProvider } from './contexts/SoundContext';
import { TokenProvider } from './contexts/TokenContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserProvider } from './contexts/UserContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TokenProvider>
        <ChallengesProvider>
          <CirclesProvider>
            <LeaderboardProvider>
              <BoostersProvider>
                <SoundProvider>
                  <ToastProvider>
                    <QuizProvider>
                      {children}
                    </QuizProvider>
                  </ToastProvider>
                </SoundProvider>
              </BoostersProvider>
            </LeaderboardProvider>
          </CirclesProvider>
        </ChallengesProvider>
      </TokenProvider>
    </UserProvider>
  );
}
