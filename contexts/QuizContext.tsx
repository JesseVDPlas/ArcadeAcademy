import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import quizData from '../assets/data/test_quiz_data_vwo1.json';

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  class_level: string;
};

export type Question = {
  id: string;
  paragraph: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

// 1. Types ------------------------------------------------------
export type LevelStatus = 'locked' | 'current' | 'done';
export type Level = { id: number; status: LevelStatus };

export type QuizState = {
  lives: number;
  score: number;
  current: number; // index of current question
  highScore: number;
  questions: Question[];
  levels: Level[];
};

export type QuizAction =
  | { type: 'START'; totalQuestions?: number }
  | { type: 'ANSWER_CORRECT' }
  | { type: 'ANSWER_WRONG' }
  | { type: 'RESET' }
  | { type: 'SET_HIGHSCORE'; payload: number }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'LEVEL_DONE'; payload: number }
  | { type: 'SET_LEVELS'; payload: Level[] };

// 2. Reducer -----------------------------------------------------
export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START': {
      // Reset levels if not present
      const levels = state.levels?.length
        ? state.levels
        : Array.from({ length: 5 }, (_, i) => ({ id: i, status: (i === 0 ? 'current' : 'locked') as LevelStatus }));
      return {
        ...state,
        lives: 3,
        score: 0,
        current: 0,
        levels,
      };
    }
    case 'ANSWER_CORRECT':
      return {
        ...state,
        score: state.score + 1,
        current: state.current + 1,
      };
    case 'ANSWER_WRONG':
      return {
        ...state,
        lives: Math.max(state.lives - 1, 0),
        current: state.current + 1,
      };
    case 'SET_HIGHSCORE':
      return {
        ...state,
        highScore: Math.max(state.highScore, action.payload),
      };
    case 'RESET': {
      const levels = state.levels?.length
        ? state.levels
        : Array.from({ length: 5 }, (_, i) => ({ id: i, status: (i === 0 ? 'current' : 'locked') as LevelStatus }));
      return {
        ...state,
        lives: 3,
        score: 0,
        current: 0,
        levels,
      };
    }
    case 'SET_QUESTIONS': {
      const levels = Array.from({ length: 5 }, (_, i) => ({ id: i, status: (i === 0 ? 'current' : 'locked') as LevelStatus }));
      return { ...state, questions: action.payload, current: 0, score: 0, lives: 3, levels };
    }
    case 'LEVEL_DONE': {
      // Mark current level as done, unlock next
      const idx = action.payload;
      const levels = state.levels.map((lvl, i) => {
        if (i === idx) return { ...lvl, status: 'done' };
        if (i === idx + 1 && lvl.status === 'locked') return { ...lvl, status: 'current' };
        return lvl;
      });
      return { ...state, levels };
    }
    case 'SET_LEVELS': {
      return { ...state, levels: action.payload };
    }
    default:
      return state;
  }
}

// 3. Initial State ---------------------------------------------
const INITIAL_STATE: QuizState = {
  lives: 3,
  score: 0,
  current: 0,
  highScore: 0,
  questions: [],
  levels: Array.from({ length: 5 }, (_, i) => ({ id: i, status: (i === 0 ? 'current' : 'locked') as LevelStatus })),
};

// 4. Context -----------------------------------------------------
interface QuizContextValue {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
}

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

// 5. Provider ----------------------------------------------------
export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(quizReducer, INITIAL_STATE);

  // Save currentLevelId to AsyncStorage on change
  useEffect(() => {
    const saveLevel = async () => {
      const currentLevel = state.levels.find(lvl => lvl.status === 'current');
      if (currentLevel) {
        await AsyncStorage.setItem('currentLevelId', String(currentLevel.id));
      }
    };
    saveLevel();
  }, [state.levels]);

  // On mount, read currentLevelId and set levels accordingly
  useEffect(() => {
    const loadLevel = async () => {
      const stored = await AsyncStorage.getItem('currentLevelId');
      if (stored !== null) {
        const id = parseInt(stored, 10);
        const levels = Array.from({ length: 5 }, (_, i) => {
          if (i < id) return { id: i, status: 'done' as LevelStatus };
          if (i === id) return { id: i, status: 'current' as LevelStatus };
          return { id: i, status: 'locked' as LevelStatus };
        }) as Level[];
        dispatch({ type: 'SET_LEVELS', payload: levels });
      }
    };
    loadLevel();
     
  }, []);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
};

// 6. Hook --------------------------------------------------------
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// 7. Utility Action Creators (optional) -------------------------
export const quizActions = {
  start: (): QuizAction => ({ type: 'START' }),
  correct: (): QuizAction => ({ type: 'ANSWER_CORRECT' }),
  wrong: (): QuizAction => ({ type: 'ANSWER_WRONG' }),
  reset: (): QuizAction => ({ type: 'RESET' }),
  setHighScore: (score: number): QuizAction => ({ type: 'SET_HIGHSCORE', payload: score }),
  setQuestions: (q: Question[]) => ({ type: 'SET_QUESTIONS', payload: q } as const),
  levelDone: (levelId: number): QuizAction => ({ type: 'LEVEL_DONE', payload: levelId }),
  setLevels: (levels: Level[]) => ({ type: 'SET_LEVELS', payload: levels } as const),
};

const INITIAL_LIVES = 3;
const QUESTIONS_PER_QUIZ = 5;

export const QuizProviderOld: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHighscore();
  }, []);

  const startNewQuiz = (subject: string, grade?: string) => {
    setLoading(true);
    // Filter quiz op subject en klas
    let filtered = quizData.quizzes.filter(
      (q: any) =>
        q.subject.toLowerCase() === subject.toLowerCase() &&
        (!grade || q.class_level.toLowerCase() === grade.toLowerCase())
    );
    // Pak de eerste quiz die matcht
    const quiz = filtered[0];
    if (!quiz) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    // Map de vragen naar het interne formaat
    let mappedQuestions = quiz.questions.map((q: any) => ({
      question: q.question_text,
      options: q.options.map((opt: string) => opt.replace(/^'/, '').replace(/'$/, '')),
      correctAnswer: q.options[q.correct_option_index].replace(/^'/, '').replace(/'$/, ''),
      subject: quiz.subject,
      class_level: quiz.class_level,
    }));
    // Shuffle en pak QUESTIONS_PER_QUIZ
    mappedQuestions = mappedQuestions.sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_QUIZ);
    setQuestions(mappedQuestions);
    setCurrentIndex(0);
    setLives(INITIAL_LIVES);
    setScore(0);
    setLoading(false);
  };

  const answerQuestion = (correct: boolean) => {
    if (correct) setScore(s => s + 1);
    else setLives(l => l - 1);
    setCurrentIndex(i => i + 1);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setLives(INITIAL_LIVES);
    setScore(0);
  };

  const loadHighscore = async () => {
    const data = await SecureStore.getItemAsync('highscore');
    if (data) setHighscore(Number(data));
  };

  return (
    <QuizContext.Provider value={{ questions, currentIndex, lives, score, highscore, loading, startNewQuiz, answerQuestion, resetQuiz }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizOld = () => {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within a QuizProvider');
  return ctx;
}; 