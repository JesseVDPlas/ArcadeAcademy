export interface RunSessionLike {
  correct?: number;
  total?: number;
  daily?: boolean;
}

export interface ResultParamsLike {
  score?: string | number;
  total?: string | number;
  daily?: string;
  dailySubjectId?: string;
}

export interface DerivedResultMetrics {
  correct: number;
  total: number;
  isDaily: boolean;
  mismatch: boolean;
}

export function deriveResultMetrics(
  params: ResultParamsLike,
  runSession: RunSessionLike
): DerivedResultMetrics {
  const scoreParam = Number(params.score || 0);
  const totalParam = Number(params.total || 0);
  const isDailyFromParams =
    params.daily === '1' ||
    params.daily === 'true' ||
    (typeof params.dailySubjectId === 'string' && params.dailySubjectId.length > 0);
  const runSessionTotal = Number(runSession.total || 0);
  const runSessionCorrect = Number(runSession.correct || 0);

  return {
    correct: scoreParam,
    total: totalParam,
    isDaily: isDailyFromParams || Boolean(runSession.daily),
    mismatch:
      runSessionTotal > 0 && (runSessionCorrect !== scoreParam || runSessionTotal !== totalParam),
  };
}
