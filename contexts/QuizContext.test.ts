import { Question, quizActions, quizReducer, QuizState } from './QuizContext';

describe('quizReducer', () => {
  it('SET_QUESTIONS zet vragen in de state', () => {
    const initial: QuizState = {
      lives: 3,
      score: 0,
      current: 0,
      highScore: 0,
      questions: [],
    };
    const mock: Question[] = [
      {
        id: '1',
        paragraph: '',
        question: 'Wat is 2+2?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
        explanation: '2+2=4',
      },
      {
        id: '2',
        paragraph: '',
        question: 'Wat is de hoofdstad van Frankrijk?',
        options: ['Berlijn', 'Parijs', 'Rome', 'Madrid'],
        correctIndex: 1,
        explanation: 'Parijs is de hoofdstad van Frankrijk.',
      },
    ];
    const next = quizReducer(initial, quizActions.setQuestions(mock));
    expect(next.questions.length).toBe(mock.length);
    expect(next.questions[0].question).toBe('Wat is 2+2?');
    expect(next.current).toBe(0);
    expect(next.score).toBe(0);
    expect(next.lives).toBe(3);
  });
}); 