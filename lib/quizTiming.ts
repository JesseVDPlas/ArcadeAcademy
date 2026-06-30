export type QuizSpeed = 'slow' | 'normal' | 'fast';

export interface QuizTimingPreset {
  feedbackMs: number;
  gameOverDelayMs: number;
}

export const QUIZ_SPEED_PRESETS: Record<QuizSpeed, QuizTimingPreset> = {
  slow: {
    feedbackMs: 2200,
    gameOverDelayMs: 2400,
  },
  normal: {
    feedbackMs: 1400,
    gameOverDelayMs: 1600,
  },
  fast: {
    feedbackMs: 800,
    gameOverDelayMs: 1100,
  },
};

export function getQuizTimings(speed: QuizSpeed | null | undefined): QuizTimingPreset {
  if (!speed) return QUIZ_SPEED_PRESETS.normal;
  return QUIZ_SPEED_PRESETS[speed] ?? QUIZ_SPEED_PRESETS.normal;
}
