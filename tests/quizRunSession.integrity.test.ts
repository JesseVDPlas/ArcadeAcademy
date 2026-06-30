import { shouldLogQuizAbandon } from '@/lib/quizRunLifecycle';

describe('quizRunSession integrity', () => {
  it('logs abandon only when run started and not finished', () => {
    expect(shouldLogQuizAbandon({ runStarted: true, runFinished: false })).toBe(true);
    expect(shouldLogQuizAbandon({ runStarted: true, runFinished: true })).toBe(false);
    expect(shouldLogQuizAbandon({ runStarted: false, runFinished: false })).toBe(false);
  });
});
