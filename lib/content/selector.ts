import type { ContentDifficulty, QuestionV2, QuizPack } from '@/types/content';

function seededRandom(seed: number): () => number {
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  const random = seededRandom(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function difficultyOrder(difficulty: ContentDifficulty): number {
  if (difficulty === 'easy') return 0;
  if (difficulty === 'medium') return 1;
  return 2;
}

export function selectPracticeQuestions(pack: QuizPack, count: number): QuestionV2[] {
  const sorted = pack.questions
    .slice()
    .sort((a, b) => difficultyOrder(a.difficulty) - difficultyOrder(b.difficulty));

  if (sorted.length <= count) return sorted;
  return sorted.slice(0, count);
}

export function buildDailySetFromPacks(packs: QuizPack[], dateKey: string, count: number): QuestionV2[] {
  const all = packs.flatMap((pack) => pack.questions);
  const seed = Number(dateKey.replace(/-/g, '')) || 0;
  const shuffled = seededShuffle(all, seed);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
