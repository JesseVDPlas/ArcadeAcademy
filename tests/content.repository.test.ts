import { localQuizRepository } from '@/lib/content/localRepository';

describe('LocalQuizRepository', () => {
  it('returns enabled pack list', async () => {
    const packs = await localQuizRepository.getPackList();
    expect(packs.length).toBeGreaterThan(0);
    expect(packs.every((pack) => pack.enabled)).toBe(true);
  });

  it('returns deterministic daily set for same date', async () => {
    const profile = { grade_band: 'vwo_1', subjects_unlocked: true };
    const first = await localQuizRepository.getDailySet('2026-02-16', profile);
    const second = await localQuizRepository.getDailySet('2026-02-16', profile);

    expect(first.length).toBe(10);
    expect(second.length).toBe(10);
    expect(first.map((q) => q.id)).toEqual(second.map((q) => q.id));
  });

  it('returns valid pack with required fields', async () => {
    const packs = await localQuizRepository.getPackList();
    const pack = await localQuizRepository.getPack(packs[0].pack_id);
    const question = pack.questions[0];

    expect(pack.pack_id).toBeTruthy();
    expect(question.explanation_short.length).toBeLessThanOrEqual(160);
    expect(question.options.length).toBe(4);
  });
});
