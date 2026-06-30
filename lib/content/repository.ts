import type { ContentProfile, QuestionV2, QuizPack, QuizPackMeta } from '@/types/content';

export interface QuizRepository {
  getPackList(): Promise<QuizPackMeta[]>;
  getPack(packId: string): Promise<QuizPack>;
  getDailySet(dateKey: string, profile: ContentProfile, questionCount?: number): Promise<QuestionV2[]>;
}
