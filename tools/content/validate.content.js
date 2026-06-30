#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'assets/data/content');
const MANIFEST_PATH = path.join(CONTENT_DIR, 'content_manifest.json');

const manifestSchema = {
  type: 'object',
  required: ['schema_version', 'generated_at', 'active_packs', 'fallback_pack_id'],
  properties: {
    schema_version: { type: 'string' },
    generated_at: { type: 'string' },
    fallback_pack_id: { type: 'string' },
    active_packs: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['pack_id', 'version', 'subject', 'grade_band', 'difficulty_band', 'question_count', 'enabled'],
        properties: {
          pack_id: { type: 'string' },
          version: { type: 'string' },
          subject: { type: 'string' },
          grade_band: { type: 'string' },
          difficulty_band: { enum: ['easy', 'mixed', 'advanced'] },
          question_count: { type: 'integer', minimum: 1 },
          enabled: { type: 'boolean' },
        },
      },
    },
  },
};

const packSchema = {
  type: 'object',
  required: ['pack_id', 'version', 'subject', 'grade_band', 'difficulty_band', 'questions'],
  properties: {
    pack_id: { type: 'string' },
    version: { type: 'string' },
    subject: { type: 'string' },
    grade_band: { type: 'string' },
    difficulty_band: { enum: ['easy', 'mixed', 'advanced'] },
    questions: {
      type: 'array',
      minItems: 10,
      items: {
        type: 'object',
        required: [
          'id',
          'question_text',
          'options',
          'correct_option_index',
          'explanation_short',
          'learning_goal',
          'tags',
          'difficulty',
        ],
        properties: {
          id: { type: 'string' },
          question_text: { type: 'string', minLength: 1 },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'string' },
          },
          correct_option_index: { type: 'integer', minimum: 0, maximum: 3 },
          explanation_short: { type: 'string', minLength: 1, maxLength: 160 },
          learning_goal: { type: 'string', minLength: 1 },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          difficulty: { enum: ['easy', 'medium', 'hard'] },
        },
      },
    },
  },
};

function fail(message, details) {
  console.error(`\n[content:validate] ${message}`);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    fail(`Manifest not found at ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const ajv = new Ajv({ allErrors: true });
  const validateManifest = ajv.compile(manifestSchema);
  const validatePack = ajv.compile(packSchema);

  if (!validateManifest(manifest)) {
    fail('Manifest schema invalid', validateManifest.errors);
  }

  const packIds = new Set();
  for (const meta of manifest.active_packs) {
    if (packIds.has(meta.pack_id)) {
      fail(`Duplicate pack_id in manifest: ${meta.pack_id}`);
    }
    packIds.add(meta.pack_id);

    const packPath = path.join(CONTENT_DIR, 'packs', `${meta.pack_id}.json`);
    if (!fs.existsSync(packPath)) {
      fail(`Pack file missing: ${packPath}`);
    }

    const pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
    if (!validatePack(pack)) {
      fail(`Pack schema invalid: ${meta.pack_id}`, validatePack.errors);
    }

    if (pack.questions.length !== meta.question_count) {
      fail(
        `Pack question_count mismatch for ${meta.pack_id}: manifest=${meta.question_count}, actual=${pack.questions.length}`
      );
    }

    const questionIds = new Set();
    for (const question of pack.questions) {
      if (questionIds.has(question.id)) {
        fail(`Duplicate question id in ${meta.pack_id}: ${question.id}`);
      }
      questionIds.add(question.id);
    }
  }

  if (!packIds.has(manifest.fallback_pack_id)) {
    fail(`fallback_pack_id not found in active_packs: ${manifest.fallback_pack_id}`);
  }

  console.log(`[content:validate] OK (${manifest.active_packs.length} packs validated)`);
}

main();
