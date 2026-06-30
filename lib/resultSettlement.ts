import type { ResultParamsLike, RunSessionLike } from '@/lib/resultLogic';

export type SettlementPolicy = 'minimal_safe_settle' | 'hard_block';

export interface ResultSettlement {
  correct: number;
  total: number;
  isDaily: boolean;
  mismatch: boolean;
  rejected: boolean;
  source: 'runSession' | 'params';
}

function toNumber(input: string | number | undefined): number {
  const value = Number(input ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export function computeResultSettlement(
  params: ResultParamsLike,
  runSession: RunSessionLike,
  policy: SettlementPolicy = 'minimal_safe_settle'
): ResultSettlement {
  const scoreParam = toNumber(params.score);
  const totalParam = toNumber(params.total);
  const isDailyFromParams =
    params.daily === '1' ||
    params.daily === 'true' ||
    (typeof params.dailySubjectId === 'string' && params.dailySubjectId.length > 0);

  const runSessionTotal = toNumber(runSession.total);
  const runSessionCorrect = toNumber(runSession.correct);

  const hasTrustedRun = runSessionTotal > 0;
  const mismatch =
    hasTrustedRun && (runSessionCorrect !== scoreParam || runSessionTotal !== totalParam);

  if (hasTrustedRun) {
    return {
      correct: runSessionCorrect,
      total: runSessionTotal,
      isDaily: Boolean(runSession.daily),
      mismatch,
      rejected: false,
      source: 'runSession',
    };
  }

  if (policy === 'hard_block' || totalParam <= 0) {
    return {
      correct: scoreParam,
      total: totalParam,
      isDaily: isDailyFromParams || Boolean(runSession.daily),
      mismatch: false,
      rejected: true,
      source: 'params',
    };
  }

  return {
    correct: scoreParam,
    total: totalParam,
    isDaily: isDailyFromParams || Boolean(runSession.daily),
    mismatch: false,
    rejected: true,
    source: 'params',
  };
}
