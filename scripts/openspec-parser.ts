/**
 * openspec-parser.ts — Deterministic state-machine parser for OpenSpec spec.md files.
 *
 * Parses the following structure:
 *   # [@tag1 @tag2] <Domain> [Specification]
 *   ## Purpose
 *   <free-form description>
 *   ## Background
 *   - **GIVEN** <text>
 *   ## Requirements / ADDED/MODIFIED/REMOVED Requirements
 *   ### [@tag1] Requirement: <Name>
 *   <requirement body>
 *   #### [@tag1] Scenario: <Name>
 *   - **GIVEN** <text>
 *       - <sub-item> ...
 *       | pipe | table | ...
 *   - **WHEN** <text>
 *   - **THEN** <text>
 *   - **AND** <text>
 *   - **BUT** <text>
 *   ##### Examples:
 *   | header1 | header2 |
 *   | val1    | val2    |
 *
 * 0 dependencies — pure line-by-line parsing.
 */

import type { OpenSpecDoc, Requirement, Scenario, Step, OpenSpecStepKeyword, DeltaSection, Table, ScenarioExamples } from './types.js';

// ---------------------------------------------------------------------------
// Regex helpers
// ---------------------------------------------------------------------------

/** Matches `# [@tag1 @tag2] Domain Name [Specification]` with optional tags before the title. */
const H1_RE = /^#\s+((?:@[\w-]+\s+)*)(.+)$/;

/** Matches `## Section Title`. */
const H2_RE = /^##\s+(.+)$/;

/** Matches `### [@tag1 @tag2] Requirement: Name` with optional tags before "Requirement". */
const H3_REQUIREMENT_RE = /^###\s+((?:@[\w-]+\s+)*)Requirement:\s*(.+)$/i;

/** Matches `#### [@tag1 @tag2] [Scenario [Outline]|Scenario]: Name`. */
const H4_SCENARIO_RE = /^####\s+((?:@[\w-]+\s+)*)(Scenario(?:\s+Outline)?):\s*(.+)$/i;

/** Matches `##### Examples:`. */
const H5_EXAMPLES_RE = /^#####\s+Examples:\s*$/i;

/** Matches `- **GIVEN** text`, `- Given text` (bold optional), also WHEN/THEN/AND/BUT. */
const STEP_RE = /^-\s+\*{0,2}(GIVEN|WHEN|THEN|AND|BUT)\*{0,2}\s*(.*)$/i;

/** Matches indented sub-bullet: `  - text` or `    - text` etc. Captures the text. */
const SUB_ITEM_RE = /^(\s+)-\s+(.+)$/;

/** Matches a pipe table row: `| col1 | col2 |`. */
const PIPE_TABLE_RE = /^\s*\|.+\|\s*$/;

/** Matches `(Previously: ...)` or `(Reason: ...)` annotations after requirement headings. */
const PAREN_NOTE_RE = /\(([^)]+)\)\s*$/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract tag strings (e.g. '@smoke @regression') into an array. */
function extractTags(tagStr: string): string[] {
  return tagStr.trim().split(/\s+/).filter(t => t.length > 0 && t.startsWith('@'));
}

/** Parse a pipe table row into string array. Splits on `|` and trims each cell. */
function parsePipeRow(line: string): string[] {
  return line
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);
}

/** Check if a line is a pipe table separator (e.g. `| --- | --- |`). */
function isTableSeparator(line: string): boolean {
  return PIPE_TABLE_RE.test(line) && /^\s*\|[\s:-]+\|[\s:-]*\|/.test(line);
}

// ---------------------------------------------------------------------------
// Parser state
// ---------------------------------------------------------------------------

enum State {
  /** Looking for the `# Domain` header. */
  Start,
  /** Inside `## Purpose` section — collecting description text. */
  InPurpose,
  /** Inside `## Background` section — collecting background steps. */
  InBackground,
  /** Looking for the next `### Requirement:` or end of file. */
  BetweenRequirements,
  /** Collecting the body text of a requirement. */
  InRequirementBody,
  /** Inside a `#### Scenario:` — collecting steps. */
  InScenario,
  /** Inside a `##### Examples:` table — collecting pipe table rows. */
  InExamples,
}

// ---------------------------------------------------------------------------
// Delta section detection
// ---------------------------------------------------------------------------

const DELTA_SECTION_RE = /^##\s+(ADDED|MODIFIED|REMOVED)\s+Requirements$/i;

function parseDeltaSection(text: string): DeltaSection | null {
  const m = text.match(DELTA_SECTION_RE);
  if (!m) return null;
  return m[1].toUpperCase() as DeltaSection;
}

// ---------------------------------------------------------------------------
// Main parse function
// ---------------------------------------------------------------------------

/**
 * Parse an OpenSpec spec.md string into a structured document.
 *
 * @param content - Raw markdown content of the spec file.
 * @param changeName - Optional change name (for delta specs under `changes/`).
 * @returns Parsed OpenSpecDoc.
 * @throws {Error} If the content has structural issues (e.g. scenario without requirement).
 */
export function parseSpec(content: string, changeName?: string): OpenSpecDoc {
  const lines = content.split(/\r?\n/);

  let domain = '';
  let purpose = '';
  let docTags: string[] = [];
  const requirements: Requirement[] = [];
  const background: Step[] = [];

  let state: State = State.Start;
  let currentRequirement: Requirement | null = null;
  let currentScenario: Scenario | null = null;
  let currentDeltaSection: DeltaSection | undefined;
  let currentModificationNote: string | undefined;

  // Pipe table collection buffer for inline step tables
  let tableBuffer: string[] | null = null;

  // Helper to flush a scenario when we encounter a new one or end
  function flushScenario(): void {
    if (currentScenario && currentRequirement) {
      currentRequirement.scenarios.push(currentScenario);
      currentScenario = null;
    }
  }

  // Helper to flush a requirement when we encounter a new one or end
  function flushRequirement(): void {
    flushScenario();
    if (currentRequirement) {
      // A requirement must have at least one scenario
      requirements.push(currentRequirement);
      currentRequirement = null;
    }
  }

  // Helper to finalize tables for the last step of the current scenario
  function flushTableBuffer(): void {
    if (tableBuffer && tableBuffer.length > 0 && currentScenario) {
      const lastStep = currentScenario.steps[currentScenario.steps.length - 1];
      if (lastStep) {
        lastStep.table = parseTable(tableBuffer);
      }
    }
    tableBuffer = null;
  }

  // Parse collected pipe table rows into a Table
  function parseTable(rows: string[]): Table {
    const parsed = rows.map(r => parsePipeRow(r));
    return {
      header: parsed[0] || [],
      rows: parsed.slice(1).filter(r => r.length > 0),
    };
  }

  // Parse Examples pipe table rows into ScenarioExamples
  function parseExamples(rows: string[]): ScenarioExamples {
    // Skip separator row (e.g., | --- | --- |)
    const filtered = rows.filter(r => !isTableSeparator(r));
    const parsed = filtered.map(r => parsePipeRow(r));
    return {
      header: parsed[0] || [],
      rows: parsed.slice(1).filter(r => r.length > 0),
    };
  }

  // Collect a pipe table line (caching during InScenario / InExamples)
  function collectTableLine(line: string): boolean {
    if (!PIPE_TABLE_RE.test(line)) return false;
    if (tableBuffer === null) tableBuffer = [];
    tableBuffer.push(line);
    return true;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // ---- H1: Domain ----
    const h1Match = line.match(H1_RE);
    if (h1Match) {
      if (domain === '') {
        const tagStr = h1Match[1];
        docTags = extractTags(tagStr);
        // Strip trailing " Specification" if present
        domain = h1Match[2].replace(/\s+Specification$/i, '').trim();
        state = State.BetweenRequirements;
      }
      // Subsequent H1 headings are just section markers — skip
      continue;
    }

    // ---- H5: Examples (only valid inside a Scenario Outline) ----
    if (H5_EXAMPLES_RE.test(line)) {
      flushTableBuffer();
      if (currentScenario) {
        currentScenario.isOutline = true;
        state = State.InExamples;
        tableBuffer = [];
      }
      continue;
    }

    // ---- H4: Scenario or Scenario Outline ----
    const h4Match = line.match(H4_SCENARIO_RE);
    if (h4Match) {
      flushTableBuffer();
      const scenarioType = h4Match[2].trim(); // "Scenario" or "Scenario Outline"
      const scenarioName = h4Match[3].trim();
      if (!currentRequirement) {
        throw new Error(
          `Line ${i + 1}: Scenario "${scenarioName}" found outside of a Requirement. ` +
          'Each scenario must be inside a ### Requirement block.'
        );
      }
      flushScenario();
      currentScenario = {
        name: scenarioName,
        steps: [],
        tags: extractTags(h4Match[1]),
        isOutline: scenarioType.toLowerCase().includes('outline'),
      };
      state = State.InScenario;
      continue;
    }

    // ---- H3: Requirement ----
    const h3Match = line.match(H3_REQUIREMENT_RE);
    if (h3Match) {
      flushTableBuffer();
      flushRequirement();
      const reqTags = extractTags(h3Match[1]);
      let reqName = h3Match[2].trim();

      // Extract parenthetical notes (e.g., modification notes)
      const noteMatch = reqName.match(PAREN_NOTE_RE);
      if (noteMatch && currentDeltaSection === 'MODIFIED') {
        currentModificationNote = noteMatch[1];
        reqName = reqName.replace(PAREN_NOTE_RE, '').trim();
      }

      currentRequirement = {
        name: reqName,
        text: '',
        scenarios: [],
        tags: reqTags,
        deltaSection: currentDeltaSection,
        modificationNote: currentModificationNote,
      };

      state = State.InRequirementBody;
      continue;
    }

    // ---- H2: Section ----
    const h2Match = line.match(H2_RE);
    if (h2Match) {
      flushTableBuffer();
      const sectionTitle = h2Match[1].trim();

      // Check for delta section
      const ds = parseDeltaSection(line);
      if (ds) {
        flushRequirement();
        currentDeltaSection = ds;
        currentModificationNote = undefined;
        state = State.BetweenRequirements;
        continue;
      }

      if (sectionTitle.toUpperCase() === 'PURPOSE') {
        flushRequirement();
        purpose = '';
        currentDeltaSection = undefined;
        state = State.InPurpose;
        continue;
      }

      if (sectionTitle.toUpperCase() === 'BACKGROUND') {
        flushRequirement();
        state = State.InBackground;
        continue;
      }

      // Some other ## section we don't care about (e.g. "Requirements")
      if (sectionTitle.toUpperCase() === 'REQUIREMENTS' ||
          sectionTitle.toUpperCase() === 'ADDED REQUIREMENTS' ||
          sectionTitle.toUpperCase() === 'MODIFIED REQUIREMENTS' ||
          sectionTitle.toUpperCase() === 'REMOVED REQUIREMENTS') {
        flushRequirement();
        state = State.BetweenRequirements;
        continue;
      }

      // Unknown section — treat as between-requirements
      flushRequirement();
      state = State.BetweenRequirements;
      continue;
    }

    // ---- InExamples: collect pipe table rows ----
    if (state === State.InExamples) {
      // If we hit a step line, heading, or empty line followed by non-table, exit examples
      if (line === '' || STEP_RE.test(line) || H4_SCENARIO_RE.test(line) || H3_REQUIREMENT_RE.test(line) || H2_RE.test(line)) {
        // Finalize examples
        if (tableBuffer && tableBuffer.length > 0 && currentScenario) {
          currentScenario.examples = parseExamples(tableBuffer);
        }
        tableBuffer = null;
        state = State.InScenario;

        // Re-process this line in the new state
        i--;
        continue;
      }

      if (PIPE_TABLE_RE.test(line)) {
        if (tableBuffer === null) tableBuffer = [];
        tableBuffer.push(line);
      }
      continue;
    }

    // ---- InBackground: collect background steps ----
    if (state === State.InBackground) {
      if (line === '' || H2_RE.test(line) || H3_REQUIREMENT_RE.test(line)) {
        if (H2_RE.test(line) || H3_REQUIREMENT_RE.test(line)) {
          i--; // Re-process heading in the new state
        }
        state = State.BetweenRequirements;
        continue;
      }

      const stepMatch = line.match(STEP_RE);
      if (stepMatch) {
        background.push({
          keyword: stepMatch[1].toUpperCase() as OpenSpecStepKeyword,
          text: stepMatch[2].trim(),
          subItems: [],
        });
      }
      continue;
    }

    // ---- Step line ----
    const stepMatch = line.match(STEP_RE);
    if (stepMatch) {
      flushTableBuffer();
      if (!currentScenario) {
        // Scenario-less step — create an implicit scenario
        if (!currentRequirement) {
          throw new Error(
            `Line ${i + 1}: Step found outside of a Requirement and Scenario.`
          );
        }
        currentScenario = {
          name: '(implicit)',
          steps: [],
          tags: [],
          isOutline: false,
        };
      }
      currentScenario.steps.push({
        keyword: stepMatch[1].toUpperCase() as OpenSpecStepKeyword,
        text: stepMatch[2].trim(),
        subItems: [],
      });
      state = State.InScenario;
      continue;
    }

    // ---- Sub-bullet (indented `- item`) — only when NOT inside a pipe table ----
    if (state === State.InScenario && SUB_ITEM_RE.test(line) && !PIPE_TABLE_RE.test(line)) {
      const subMatch = line.match(SUB_ITEM_RE)!;
      const lastStep = currentScenario!.steps[currentScenario!.steps.length - 1];
      if (lastStep) {
        lastStep.subItems.push(subMatch[2].trim());
      }
      continue;
    }

    // ---- Pipe table line under a step (inline DataTable) ----
    if (state === State.InScenario && collectTableLine(line)) {
      continue;
    }

    // ---- Purpose body text (everything until next ##) ----
    if (state === State.InPurpose) {
      if (line === '') {
        purpose += '\n';
      } else {
        purpose += (purpose.length > 0 && !purpose.endsWith('\n') ? ' ' : '') + line;
      }
      continue;
    }

    // ---- Requirement body text (everything until next ### or ####) ----
    if (state === State.InRequirementBody) {
      if (line !== '' && currentRequirement) {
        currentRequirement.text += (currentRequirement.text.length > 0 ? ' ' : '') + line;
        // For REMOVED requirements, also store as removalReason
        if (currentRequirement.deltaSection === 'REMOVED') {
          currentRequirement.removalReason = currentRequirement.text;
        }
      }
      continue;
    }

    // ---- Empty lines in BetweenRequirements — skip ----
    if (state === State.BetweenRequirements && line === '') {
      continue;
    }
  }

  // Flush remaining buffers — IMPORTANT: InExamples first (consumes tableBuffer for examples),
  // then flushTableBuffer (which uses tableBuffer only for step tables).
  if (state === State.InExamples) {
    if (tableBuffer && tableBuffer.length > 0 && currentScenario) {
      currentScenario.examples = parseExamples(tableBuffer);
    }
    tableBuffer = null;
  }
  flushTableBuffer();
  flushRequirement();

  // Clean up purpose (collapse multiple newlines)
  purpose = purpose.replace(/\n{3,}/g, '\n\n').trim();

  return {
    domain,
    purpose,
    requirements,
    tags: docTags,
    changeName,
    background,
  };
}
