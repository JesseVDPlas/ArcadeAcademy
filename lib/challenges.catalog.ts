import { ChallengeDef } from '@/types/challenges';

export const weeklyCatalog: readonly ChallengeDef[] = [
  {
    id: 'weekly_quiz_5',
    title: 'Complete 5 quizzes',
    desc: 'Finish any 5 quizzes this week',
    target: 5,
    reward: 50,
    metric: 'quizzes',
  },
  {
    id: 'weekly_daily_3',
    title: 'Do 3 daily challenges',
    desc: 'Complete the daily set 3 times',
    target: 3,
    reward: 75,
    metric: 'dailies',
  },
  {
    id: 'weekly_perfect_2',
    title: '2 perfect scores',
    desc: 'Score 100% two times',
    target: 2,
    reward: 100,
    metric: 'perfects',
  },
] as const;




