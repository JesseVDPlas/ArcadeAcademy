export type ContentDifficulty = 'easy' | 'medium' | 'hard';

export interface QuestionV2 {
  id: string;
  question_text: string;
  options: [string, string, string, string];
  correct_option_index: 0 | 1 | 2 | 3;
  explanation_short: string;
  learning_goal: string;
  tags: string[];
  difficulty: ContentDifficulty;
}

export interface QuizPack {
  pack_id: string;
  version: string;
  subject: string;
  grade_band: string;
  difficulty_band: 'easy' | 'mixed' | 'advanced';
  questions: QuestionV2[];
}

export interface QuizPackMeta {
  pack_id: string;
  version: string;
  subject: string;
  grade_band: string;
  difficulty_band: 'easy' | 'mixed' | 'advanced';
  question_count: number;
  enabled: boolean;
}

export interface ContentManifest {
  schema_version: string;
  generated_at: string;
  active_packs: QuizPackMeta[];
  fallback_pack_id: string;
}

export interface ContentProfile {
  grade_band: string;
  subjects_unlocked: boolean;
  preferred_subjects?: string[];
}
