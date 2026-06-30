import { getQuizTimings, QUIZ_SPEED_PRESETS } from '@/lib/quizTiming';

describe('quizTiming', () => {
  it('uses balanced defaults for each preset', () => {
    expect(QUIZ_SPEED_PRESETS.slow).toEqual({
      feedbackMs: 2200,
      gameOverDelayMs: 2400,
    });
    expect(QUIZ_SPEED_PRESETS.normal).toEqual({
      feedbackMs: 1400,
      gameOverDelayMs: 1600,
    });
    expect(QUIZ_SPEED_PRESETS.fast).toEqual({
      feedbackMs: 800,
      gameOverDelayMs: 1100,
    });
  });

  it('falls back to normal when speed is missing', () => {
    expect(getQuizTimings(undefined)).toEqual(QUIZ_SPEED_PRESETS.normal);
    expect(getQuizTimings(null)).toEqual(QUIZ_SPEED_PRESETS.normal);
  });
});
