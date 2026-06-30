import contentManifest from '@/assets/data/content/content_manifest.json';
import geoPack from '@/assets/data/content/packs/geo_vwo1_core.json';
import histPack from '@/assets/data/content/packs/hist_vwo1_core.json';
import mathPack from '@/assets/data/content/packs/math_vwo1_core.json';
import nlPack from '@/assets/data/content/packs/nl_vwo1_core.json';
import { log } from '@/lib/analytics';
import { buildDailySetFromPacks } from '@/lib/content/selector';
import { assertManifestCompatible } from '@/lib/content/versioning';
import type { ContentManifest, ContentProfile, QuestionV2, QuizPack, QuizPackMeta } from '@/types/content';
import type { QuizRepository } from '@/lib/content/repository';

const PACK_REGISTRY: Record<string, QuizPack> = {
  [histPack.pack_id]: histPack as QuizPack,
  [nlPack.pack_id]: nlPack as QuizPack,
  [mathPack.pack_id]: mathPack as QuizPack,
  [geoPack.pack_id]: geoPack as QuizPack,
};

function validateQuestion(question: QuestionV2): void {
  if (!question.id || !question.question_text) throw new Error('Question missing id/question_text');
  if (!Array.isArray(question.options) || question.options.length !== 4) throw new Error(`Invalid options for ${question.id}`);
  if (question.correct_option_index < 0 || question.correct_option_index > 3) {
    throw new Error(`Invalid correct_option_index for ${question.id}`);
  }
  if (!question.explanation_short || question.explanation_short.length > 160) {
    throw new Error(`Invalid explanation_short for ${question.id}`);
  }
}

function validatePack(pack: QuizPack): void {
  if (!pack.pack_id || !pack.version || !pack.subject || !pack.grade_band) {
    throw new Error('Pack metadata incomplete');
  }
  if (!Array.isArray(pack.questions) || pack.questions.length < 10) {
    throw new Error(`Pack ${pack.pack_id} has too few questions`);
  }
  const seen = new Set<string>();
  for (const question of pack.questions) {
    validateQuestion(question);
    if (seen.has(question.id)) {
      throw new Error(`Duplicate question id in ${pack.pack_id}: ${question.id}`);
    }
    seen.add(question.id);
  }
}

function validateManifest(manifest: ContentManifest): void {
  assertManifestCompatible(manifest);
  if (!manifest.active_packs.length) throw new Error('Manifest has no active packs');
  if (!manifest.fallback_pack_id) throw new Error('Manifest missing fallback_pack_id');
}

class LocalQuizRepository implements QuizRepository {
  private manifest: ContentManifest = contentManifest as ContentManifest;
  private startupValidated = false;
  private validationError: string | null = null;

  private getFallbackPack(): QuizPack {
    const fallback = PACK_REGISTRY[this.manifest.fallback_pack_id] || Object.values(PACK_REGISTRY)[0];
    if (!fallback) {
      throw new Error('No fallback content pack available');
    }
    return fallback;
  }

  private ensureValidContent(): void {
    if (this.startupValidated) return;
    try {
      validateManifest(this.manifest);
      for (const meta of this.manifest.active_packs) {
        const pack = PACK_REGISTRY[meta.pack_id];
        if (!pack) throw new Error(`Pack not found in registry: ${meta.pack_id}`);
        validatePack(pack);
      }
      this.startupValidated = true;
    } catch (error) {
      this.validationError = error instanceof Error ? error.message : 'unknown_validation_error';
      log('content_fallback_used', { reason: 'content_validation_failed', error: this.validationError });
      this.startupValidated = true;
    }
  }

  async validateStartup(): Promise<void> {
    this.ensureValidContent();
  }

  async getPackList(): Promise<QuizPackMeta[]> {
    this.ensureValidContent();
    if (this.validationError) {
      const fallback = this.getFallbackPack();
      return [{
        pack_id: fallback.pack_id,
        version: fallback.version,
        subject: fallback.subject,
        grade_band: fallback.grade_band,
        difficulty_band: fallback.difficulty_band,
        question_count: fallback.questions.length,
        enabled: true,
      }];
    }
    return this.manifest.active_packs.filter((pack) => pack.enabled);
  }

  async getPack(packId: string): Promise<QuizPack> {
    this.ensureValidContent();
    const pack = PACK_REGISTRY[packId];
    if (!pack) {
      const fallback = this.getFallbackPack();
      log('content_fallback_used', { reason: 'pack_not_found', requestedPackId: packId, fallbackPackId: fallback.pack_id });
      return fallback;
    }
    return pack;
  }

  async getDailySet(dateKey: string, profile: ContentProfile, questionCount: number = 10): Promise<QuestionV2[]> {
    this.ensureValidContent();
    if (this.validationError) {
      return this.getFallbackPack().questions.slice(0, questionCount);
    }
    const active = this.manifest.active_packs.filter(
      (meta) => meta.enabled && meta.grade_band === profile.grade_band
    );
    const selected = active.length > 0 ? active : this.manifest.active_packs.filter((meta) => meta.enabled);
    const packs = selected
      .map((meta) => PACK_REGISTRY[meta.pack_id])
      .filter((pack): pack is QuizPack => Boolean(pack));

    if (packs.length === 0) {
      const fallback = PACK_REGISTRY[this.manifest.fallback_pack_id];
      if (!fallback) throw new Error('No content packs available');
      log('content_fallback_used', { reason: 'no_packs_for_daily', fallbackPackId: fallback.pack_id });
      return fallback.questions.slice(0, questionCount);
    }

    return buildDailySetFromPacks(packs, dateKey, questionCount);
  }
}

export const localQuizRepository = new LocalQuizRepository();
