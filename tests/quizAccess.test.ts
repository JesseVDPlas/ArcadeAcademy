import { canStartQuiz, getNoLivesReason, NO_LIVES_MESSAGE } from '@/lib/quizAccess';

describe('quizAccess', () => {
  it('blocks quiz start when lives are 0', () => {
    expect(canStartQuiz(0)).toBe(false);
  });

  it('allows quiz start when lives are positive', () => {
    expect(canStartQuiz(1)).toBe(true);
    expect(canStartQuiz(5)).toBe(true);
  });

  it('returns stable no-lives reason', () => {
    expect(getNoLivesReason()).toBe(NO_LIVES_MESSAGE);
  });
});

