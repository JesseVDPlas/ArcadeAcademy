export type ChallengeId = 'weekly_quiz_5' | 'weekly_daily_3' | 'weekly_perfect_2';
export type ChallengeStatus = 'in_progress' | 'completed' | 'claimed';
export type ChallengeMetric = 'quizzes' | 'dailies' | 'perfects';

export interface ChallengeDef {
  id: ChallengeId;
  title: string;
  desc: string;
  target: number;
  reward: number;
  metric: ChallengeMetric;
}

export interface ChallengeState {
  id: ChallengeId;
  progress: number;
  status: ChallengeStatus;
  reward: number;
}

export interface WeeklyChallenges {
  weekKey: string;
  defs: ChallengeDef[];
  states: Record<ChallengeId, ChallengeState>;
  archived?: {
    weekKey: string;
    summary: {
      id: ChallengeId;
      status: ChallengeStatus;
      progress: number;
    }[];
  }[];
  grace?: {
    weekKey: string;
    unclaimed: ChallengeId[];
    expiresAt: number;
  };
}

