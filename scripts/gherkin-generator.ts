/**
 * gherkin-generator.ts — Converts an OpenSpecDoc AST into a localized .feature file.
 *
 * Uses the embedded gherkin-languages.json to translate Gherkin keywords
 * (Feature, Rule, Scenario, Outline, Examples, Given, When, Then, And, But, Background)
 * into the target language.
 *
 * 0 runtime dependencies — only imports the JSON data.
 */

import type { OpenSpecDoc, OpenSpecStepKeyword, GeneratorOptions, DeltaSection, Step, Scenario } from './types.js';
import { DEFAULT_OPTIONS } from './types.js';
import { createRequire } from 'node:module';

// ---------------------------------------------------------------------------
// Load language data
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);
const LANGUAGES: Record<string, GherkinLanguage> = require('./gherkin-languages.json');

interface GherkinLanguage {
  name: string;
  native: string;
  feature: string[];
  background: string[];
  rule: string[];
  scenario: string[];
  scenarioOutline: string[];
  examples: string[];
  given: string[];
  when: string[];
  then: string[];
  and: string[];
  but: string[];
}

// ---------------------------------------------------------------------------
// Keyword resolution
// ---------------------------------------------------------------------------

/** Map from OpenSpec keyword → Gherkin keyword property name. */
const KEYWORD_MAP: Record<OpenSpecStepKeyword, keyof GherkinLanguage> = {
  GIVEN: 'given',
  WHEN: 'when',
  THEN: 'then',
  AND: 'and',
  BUT: 'but',
};

/**
 * Get the keyword for a given Gherkin property in a given language.
 *
 * Strategy by property type:
 * - `scenario`: use the keyword at index 1 (Gherkin convention lists
 *   "Example"-like keywords first and "Scenario"-like keywords second).
 *   Falls back to index 0 if only one keyword exists.
 * - `scenarioOutline`: use the first keyword (typically has "Outline").
 * - Everything else: use the first non-asterisk keyword.
 *
 * The asterisk `*` is a universal step keyword — we always skip it.
 */
function getKeyword(lang: GherkinLanguage, prop: keyof GherkinLanguage): string {
  const keywords = lang[prop] as string[];
  const filtered = keywords.filter(k => !/^\*\s*$/.test(k)); // exclude "*"

  if (filtered.length === 0) return prop;

  // For `scenario`, prefer index 1 ("Scenario"-like over "Example"-like)
  if (prop === 'scenario') {
    return filtered.length > 1 ? filtered[1] : filtered[0];
  }

  // For `scenarioOutline`, prefer index 0 (typically "Outline" form)
  if (prop === 'scenarioOutline') {
    return filtered[0];
  }

  // For everything else: first non-asterisk keyword
  return filtered[0];
}

/**
 * Helper that wraps getKeyword and caches the lang for convenience.
 */
function kw(lang: GherkinLanguage, prop: keyof GherkinLanguage): string {
  return getKeyword(lang, prop);
}

// ---------------------------------------------------------------------------
// Indentation helpers
// ---------------------------------------------------------------------------

function indent(level: number, size: number): string {
  return ' '.repeat(level * size);
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a localized Gherkin .feature file from an OpenSpecDoc AST.
 *
 * @param doc    - Parsed OpenSpec document.
 * @param opts   - Generator options (language, etc.).
 * @returns      - The full .feature file content as a string.
 */
export function generateFeature(doc: OpenSpecDoc, opts: Partial<GeneratorOptions> = {}): string {
  const options: GeneratorOptions = { ...DEFAULT_OPTIONS, ...opts };
  const lang = resolveLanguage(options.language);
  const I = (level: number) => indent(level, options.indentSize);

  const lines: string[] = [];

  // ---- Language header ----
  if (options.language !== 'en') {
    lines.push(`# language: ${options.language}`);
  }

  // ---- Feature-level tags ----
  if (doc.tags.length > 0) {
    lines.push(doc.tags.join(' '));
  }

  // ---- Feature ----
  const featureKw = kw(lang, 'feature').replace(/:?\s*$/, '');
  lines.push(`${featureKw}: ${doc.domain}`);

  // ---- Feature description (Purpose) — directly after Feature, no blank line ----
  if (doc.purpose) {
    const paras = doc.purpose.split('\n');
    for (const para of paras) {
      if (para.trim()) {
        lines.push(`${I(1)}${para.trim()}`);
      }
    }
  }

  // ---- Background ----
  if (doc.background.length > 0) {
    lines.push('');
    const bgKw = kw(lang, 'background').replace(/:?\s*$/, '');
    lines.push(`${I(1)}${bgKw}:`);
    for (const step of doc.background) {
      lines.push(...renderStepLines(step, lang, I, 2));
    }
  }

  // Blank line before first Rule / Scenario
  lines.push('');

  // ---- Requirements (as Rules, grouped with their scenarios) ----
  const hasRules = doc.requirements.some(r => r.scenarios.length > 0);

  for (const req of doc.requirements) {
    if (options.includeRules && hasRules) {
      // Requirement-level tags
      if (req.tags.length > 0) {
        lines.push(`${I(1)}${req.tags.join(' ')}`);
      }
      const ruleKw = kw(lang, 'rule').replace(/:?\s*$/, '');
      lines.push(`${I(1)}${ruleKw}: ${req.name}`);

      // Requirement body text as free-form description (directly after Rule, no blank line)
      if (req.text) {
        lines.push(`${I(2)}${req.text}`);
      }
      lines.push('');

      // Modification note for deltas
      if (req.modificationNote) {
        lines.push(`${I(2)}# MODIFIED: ${req.modificationNote}`);
        lines.push('');
      }
      if (req.removalReason) {
        lines.push(`${I(2)}# REMOVED: ${req.name} — ${req.removalReason}`);
        lines.push('');
      }
    }

    // ---- Scenarios ----
    for (const scenario of req.scenarios) {
      const si = options.includeRules && hasRules ? 2 : 1; // scenario indent level

      // Scenario-level tags
      if (scenario.tags.length > 0) {
        lines.push(`${I(si)}${scenario.tags.join(' ')}`);
      }

      // Scenario keyword (Outline vs regular)
      if (scenario.isOutline) {
        const outlineKw = kw(lang, 'scenarioOutline').replace(/:?\s*$/, '');
        lines.push(`${I(si)}${outlineKw}: ${scenario.name}`);
      } else {
        const scenarioKw = kw(lang, 'scenario').replace(/:?\s*$/, '');
        lines.push(`${I(si)}${scenarioKw}: ${scenario.name}`);
      }

      // Delta section marker (as Gherkin comment right after scenario title)
      const sectionMarker = deltaMarker(req.deltaSection);
      if (sectionMarker) {
        lines.push(`${I(si + 1)}# ${sectionMarker}`);
      }

      // Steps
      for (const step of scenario.steps) {
        lines.push(...renderStepLines(step, lang, I, si + 1));
      }

      // Examples table (for Scenario Outline)
      if (scenario.examples) {
        lines.push('');
        const examplesKw = kw(lang, 'examples').replace(/:?\s*$/, '');
        lines.push(`${I(si)}${examplesKw}:`);
        const header = `| ${scenario.examples.header.join(' | ')} |`;
        lines.push(`${I(si + 1)}${header}`);
        for (const row of scenario.examples.rows) {
          const rowStr = `| ${row.join(' | ')} |`;
          lines.push(`${I(si + 1)}${rowStr}`);
        }
      }

      lines.push('');
    }
  }

  // ---- Remove trailing blank lines ----
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Per-step rendering
// ---------------------------------------------------------------------------

/**
 * Render a single step into 1+ lines (step text + optional Doc String + optional DataTable).
 */
function renderStepLines(step: Step, lang: GherkinLanguage, I: (level: number) => string, indentLevel: number): string[] {
  const lines: string[] = [];

  const stepKw = kw(lang, KEYWORD_MAP[step.keyword]);
  const kwText = stepKw.endsWith(' ') ? stepKw : stepKw + ' ';
  lines.push(`${I(indentLevel)}${kwText}${step.text}`);

  // Sub-bullets → Doc String
  if (step.subItems.length > 0) {
    lines.push(`${I(indentLevel + 1)}"""`);
    for (const item of step.subItems) {
      lines.push(`${I(indentLevel + 1)}- ${item}`);
    }
    lines.push(`${I(indentLevel + 1)}"""`);
  }

  // Pipe table → DataTable
  if (step.table) {
    const header = `| ${step.table.header.join(' | ')} |`;
    lines.push(`${I(indentLevel + 1)}${header}`);
    for (const row of step.table.rows) {
      const rowStr = `| ${row.join(' | ')} |`;
      lines.push(`${I(indentLevel + 1)}${rowStr}`);
    }
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveLanguage(code: string): GherkinLanguage {
  const lang = LANGUAGES[code];
  if (!lang) {
    throw new Error(`Unsupported Gherkin language code: "${code}". ` +
      `Available languages: ${Object.keys(LANGUAGES).join(', ')}`);
  }
  return lang;
}

function deltaMarker(section?: DeltaSection): string | null {
  switch (section) {
    case 'ADDED': return 'ADDED';
    case 'MODIFIED': return 'MODIFIED';
    case 'REMOVED': return 'REMOVED';
    default: return null;
  }
}
