import { Question, quizActions, quizReducer, QuizState } from './QuizContext';

describe('quizReducer', () => {
  it('SET_QUESTIONS zet vragen in de state', () => {
    const levels: QuizState['levels'] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      status: i === 0 ? 'current' : 'locked',
    }));

    const initial: QuizState = {
      lives: 3,
      score: 0,
      current: 0,
      highScore: 0,
      questions: [],
      levels,
    };
    const mock: Question[] = [
      {
        id: '1',
        question_text: 'Wat is 2+2?',
        options: ['3', '4', '5', '6'],
        correct_option_index: 1,
        explanation: '2+2=4',
        difficulty: 'easy',
        learning_goal: 'Basis optellen',
        tags: ['math'],
      },
      {
        id: '2',
        question_text: 'Wat is de hoofdstad van Frankrijk?',
        options: ['Berlijn', 'Parijs', 'Rome', 'Madrid'],
        correct_option_index: 1,
        explanation: 'Parijs is de hoofdstad van Frankrijk.',
        difficulty: 'easy',
        learning_goal: 'Europese hoofdsteden',
        tags: ['geo'],
      },
    ];
    const next = quizReducer(initial, quizActions.setQuestions(mock));
    expect(next.questions.length).toBe(mock.length);
    expect(next.questions[0].question_text).toBe('Wat is 2+2?');
    expect(next.current).toBe(0);
    expect(next.score).toBe(0);
    expect(next.lives).toBe(3);
  });
});
