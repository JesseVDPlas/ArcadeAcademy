#!/usr/bin/env node
/**
 * transform-to-pack.js
 *
 * Transforms pipeline questionbank JSON → app QuizPack format.
 *
 * Usage:
 *   node tools/transform-to-pack.js \
 *     --input <path-to-questionbank.json> \
 *     --output <path-to-pack.json> \
 *     --pack-id geo_vwo_ce_migr \
 *     --subject geo \
 *     --grade-band vwo_4 \
 *     [--difficulty-band mixed] \
 *     [--version 1.0.0] \
 *     [--status-filter APPROVED]   # filter op status veld (default: geen filter)
 *     [--update-manifest]          # update content_manifest.json automatisch
 *
 * Pipeline format (input):
 *   { vragen: [{ uuid, context, vraag, opties:{A,B,C,D}, correct, uitleg:{correct,...}, metadata:{..., moeilijkheid, eindterm_id, concepten} }] }
 *
 * App format (output):
 *   { pack_id, version, subject, grade_band, difficulty_band, questions: [QuestionV2] }
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    input: null,
    output: null,
    packId: null,
    subject: null,
    gradeBand: null,
    difficultyBand: 'mixed',
    version: '1.0.0',
    statusFilter: null,
    updateManifest: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':           result.input = args[++i]; break;
      case '--output':          result.output = args[++i]; break;
      case '--pack-id':         result.packId = args[++i]; break;
      case '--subject':         result.subject = args[++i]; break;
      case '--grade-band':      result.gradeBand = args[++i]; break;
      case '--difficulty-band': result.difficultyBand = args[++i]; break;
      case '--version':         result.version = args[++i]; break;
      case '--status-filter':   result.statusFilter = args[++i]; break;
      case '--update-manifest': result.updateManifest = true; break;
    }
  }
  return result;
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

const DIFFICULTY_MAP      = { L1: 'easy', L2: 'medium', L3: 'hard' };
const CORRECT_MAP         = { A: 0, B: 1, C: 2, D: 3 };
const EXPLANATION_MAX_LEN = 160;

function mapDifficulty(moeilijkheid) {
  const mapped = DIFFICULTY_MAP[moeilijkheid];
  if (!mapped) {
    console.warn(`  ⚠  Onbekende moeilijkheid "${moeilijkheid}" — valt terug op "medium"`);
    return 'medium';
  }
  return mapped;
}

function mapCorrectIndex(correct) {
  const idx = CORRECT_MAP[correct?.toUpperCase()];
  if (idx === undefined) {
    throw new Error(`Ongeldig correct-veld: "${correct}" — verwacht A/B/C/D`);
  }
  return idx;
}

/**
 * Truncate to maxLen chars at a word boundary, appending '…' if cut.
 */
function truncateExplanation(text, maxLen = EXPLANATION_MAX_LEN) {
  if (text.length <= maxLen) return text;
  const cut = text.lastIndexOf(' ', maxLen - 1);
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, maxLen - 1)) + '…';
}

// ── Transform one question ────────────────────────────────────────────────────

function transformQuestion(v) {
  const errors = [];

  if (!v.uuid)    errors.push('uuid ontbreekt');
  if (!v.context) errors.push('context ontbreekt');
  if (!v.vraag)   errors.push('vraag ontbreekt');
  if (!v.opties?.A || !v.opties?.B || !v.opties?.C || !v.opties?.D)
    errors.push('opties onvolledig (A/B/C/D verwacht)');
  if (!v.correct) errors.push('correct ontbreekt');
  if (!v.uitleg?.correct) errors.push('uitleg.correct ontbreekt');

  if (errors.length > 0) {
    throw new Error(`Vraag ${v.uuid || '?'} heeft validatiefouten: ${errors.join(', ')}`);
  }

  const meta = v.metadata || {};

  return {
    id: v.uuid,
    question_text: `${v.context.trim()} ${v.vraag.trim()}`,
    options: [v.opties.A, v.opties.B, v.opties.C, v.opties.D],
    correct_option_index: mapCorrectIndex(v.correct),
    explanation_short: truncateExplanation(v.uitleg.correct),
    learning_goal: meta.eindterm_id
      ? `Eindterm ${meta.eindterm_id}`
      : (meta.domein || 'Onbekende eindterm'),
    tags: meta.concepten || [],
    difficulty: mapDifficulty(meta.moeilijkheid),
  };
}

// ── Validate difficulty_band arg ──────────────────────────────────────────────

function validateDifficultyBand(band) {
  const valid = ['easy', 'mixed', 'advanced'];
  if (!valid.includes(band)) {
    console.warn(`  ⚠  Ongeldige difficulty-band "${band}" — valt terug op "mixed"`);
    return 'mixed';
  }
  return band;
}

// ── Update manifest ───────────────────────────────────────────────────────────

function updateManifest(manifestPath, packMeta) {
  if (!fs.existsSync(manifestPath)) {
    console.warn(`  ⚠  Manifest niet gevonden op ${manifestPath} — sla manifest-update over`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const existing = manifest.active_packs.findIndex(p => p.pack_id === packMeta.pack_id);

  if (existing >= 0) {
    manifest.active_packs[existing] = packMeta;
    console.log(`  ✓  Manifest: pack "${packMeta.pack_id}" bijgewerkt`);
  } else {
    manifest.active_packs.push(packMeta);
    console.log(`  ✓  Manifest: pack "${packMeta.pack_id}" toegevoegd`);
  }

  manifest.generated_at = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();

  // Required args
  const missing = ['input', 'output', 'packId', 'subject', 'gradeBand'].filter(k => !args[k]);
  if (missing.length > 0) {
    console.error(`Fout: verplichte argumenten ontbreken: ${missing.map(k => `--${k.replace(/([A-Z])/g, '-$1').toLowerCase()}`).join(', ')}`);
    console.error('\nGebruik: node tools/transform-to-pack.js --input <bank.json> --output <pack.json> --pack-id <id> --subject <geo> --grade-band <vwo_4>');
    process.exit(1);
  }

  // Read input
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Fout: inputbestand niet gevonden: ${inputPath}`);
    process.exit(1);
  }

  const bank = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (!Array.isArray(bank.vragen)) {
    console.error('Fout: inputbestand heeft geen "vragen" array — controleer het pipeline-formaat');
    process.exit(1);
  }

  // Filter op status indien opgegeven
  let vragen = bank.vragen;
  if (args.statusFilter) {
    const before = vragen.length;
    vragen = vragen.filter(v => v.status === args.statusFilter);
    console.log(`  ℹ  Status-filter "${args.statusFilter}": ${before} → ${vragen.length} vragen`);
  }

  if (vragen.length === 0) {
    console.error('Fout: geen vragen na filtering — niets te transformeren');
    process.exit(1);
  }

  // Transform
  console.log(`\nTransformeren: ${vragen.length} vragen → ${args.packId}`);
  const questions = [];
  let skipped = 0;

  for (const v of vragen) {
    try {
      questions.push(transformQuestion(v));
      console.log(`  ✓  ${v.uuid}`);
    } catch (err) {
      console.warn(`  ✗  Overgeslagen: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n  ${questions.length} getransformeerd, ${skipped} overgeslagen`);

  if (questions.length === 0) {
    console.error('Fout: geen geldige vragen — pack niet weggeschreven');
    process.exit(1);
  }

  const difficultyBand = validateDifficultyBand(args.difficultyBand);

  // Build pack
  const pack = {
    pack_id: args.packId,
    version: args.version,
    subject: args.subject,
    grade_band: args.gradeBand,
    difficulty_band: difficultyBand,
    questions,
  };

  // Write output
  const outputPath = path.resolve(args.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(pack, null, 2));
  console.log(`\n  ✓  Pack weggeschreven: ${outputPath}`);

  // Update manifest
  if (args.updateManifest) {
    const manifestPath = path.resolve(__dirname, '../assets/data/content/content_manifest.json');
    const packMeta = {
      pack_id: args.packId,
      version: args.version,
      subject: args.subject,
      grade_band: args.gradeBand,
      difficulty_band: difficultyBand,
      question_count: questions.length,
      enabled: true,
    };
    updateManifest(manifestPath, packMeta);
  }

  console.log('\nKlaar.\n');
}

main();
