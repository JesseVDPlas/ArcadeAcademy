#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SOURCE_REAL = path.join(ROOT, 'assets/data/test_quiz_data_vwo1.json');
const SOURCE_PLACEHOLDER = path.join(ROOT, 'assets/data/placeholder_quizzes.json');
const OUT_DIR = path.join(ROOT, 'assets/data/content/packs');
const MANIFEST_PATH = path.join(ROOT, 'assets/data/content/content_manifest.json');

const SUBJECTS = ['hist', 'nl', 'math', 'geo'];
const GRADE_BAND = 'vwo_1';
const VERSION = '1.0.0';

function toArray4(options) {
  if (!Array.isArray(options)) return null;
  if (options.length < 4) return null;
  return [String(options[0]), String(options[1]), String(options[2]), String(options[3])];
}

function normalizeDifficulty(value) {
  const d = String(value || '').toLowerCase();
  if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  return 'medium';
}

function normalizeQuestion(raw, subject, idx) {
  const options = toArray4(raw.options);
  if (!options) return null;
  const c = Number(raw.correct_option_index);
  if (!Number.isInteger(c) || c < 0 || c > 3) return null;

  const explanation = String(raw.explanation || '').trim();
  const explanationShort = explanation.length > 160 ? `${explanation.slice(0, 157)}...` : explanation || 'Controleer het juiste antwoord en probeer de redenering te onthouden.';

  return {
    id: String(raw.id || `${subject}_${idx}`),
    question_text: String(raw.question_text || ''),
    options,
    correct_option_index: c,
    explanation_short: explanationShort,
    learning_goal: String(raw.learning_goal || 'Kennis toepassen in quizcontext.'),
    tags: Array.isArray(raw.tags) ? raw.tags.map((x) => String(x)) : [],
    difficulty: normalizeDifficulty(raw.difficulty),
  };
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const real = loadJson(SOURCE_REAL);
  const placeholder = loadJson(SOURCE_PLACEHOLDER);
  const allQuizzes = [...(real.quizzes || []), ...(placeholder.quizzes || [])];

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    active_packs: [],
    fallback_pack_id: 'hist_vwo1_core',
  };

  for (const subject of SUBJECTS) {
    const matching = allQuizzes.filter((quiz) => String(quiz.subject || '').toLowerCase() === subject);
    const questions = matching
      .flatMap((quiz) => quiz.questions || [])
      .map((q, idx) => normalizeQuestion(q, subject, idx))
      .filter(Boolean);

    if (questions.length < 10) {
      throw new Error(`Not enough questions for subject ${subject}: ${questions.length}`);
    }

    const packId = `${subject}_vwo1_core`;
    const pack = {
      pack_id: packId,
      version: VERSION,
      subject,
      grade_band: GRADE_BAND,
      difficulty_band: 'mixed',
      questions,
    };

    const outPath = path.join(OUT_DIR, `${packId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(pack, null, 2));

    manifest.active_packs.push({
      pack_id: packId,
      version: VERSION,
      subject,
      grade_band: GRADE_BAND,
      difficulty_band: 'mixed',
      question_count: questions.length,
      enabled: true,
    });
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Generated ${manifest.active_packs.length} local content packs.`);
}

main();
