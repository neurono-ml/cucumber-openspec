/**
 * OpenSpec → Gherkin AST types.
 * These represent the parsed structure of an OpenSpec spec.md file
 * and are used by the generator to produce .feature files.
 */

/** Possible Gherkin step keywords in OpenSpec notation. */
export type OpenSpecStepKeyword = 'GIVEN' | 'WHEN' | 'THEN' | 'AND' | 'BUT';

/** A Gherkin DataTable (pipe table) attached to a step. */
export interface Table {
  /** The column headers from the first row. */
  header: string[];
  /** The data rows. */
  rows: string[][];
}

/** A single step within a scenario. */
export interface Step {
  /** The keyword type (GIVEN, WHEN, THEN, AND, BUT). */
  keyword: OpenSpecStepKeyword;
  /** The step text after the keyword. */
  text: string;
  /** Sub-bullets indented under this step (→ Doc String in Gherkin). */
  subItems: string[];
  /** Optional DataTable (pipe table) attached to this step. */
  table?: Table;
}

/** Examples table for a Scenario Outline. */
export interface ScenarioExamples {
  /** Column headers. */
  header: string[];
  /** Data rows. */
  rows: string[][];
}

/** A single scenario (concrete example that illustrates a requirement). */
export interface Scenario {
  /** The scenario title. */
  name: string;
  /** The ordered list of steps. */
  steps: Step[];
  /** Gherkin tags (e.g. @smoke, @regression). */
  tags: string[];
  /** Whether this is a Scenario Outline (vs a plain Scenario). */
  isOutline: boolean;
  /** Examples table for Scenario Outlines. */
  examples?: ScenarioExamples;
}

/** The type of delta section. */
export type DeltaSection = 'ADDED' | 'MODIFIED' | 'REMOVED';

/** A requirement (business rule) with its scenarios. */
export interface Requirement {
  /** The requirement name (from `### Requirement: name`). */
  name: string;
  /** The requirement body text (SHALL/MUST statement). */
  text: string;
  /** Scenarios that exercise this requirement. */
  scenarios: Scenario[];
  /** Gherkin tags (e.g. @smoke, @regression). */
  tags: string[];
  /** For delta specs: which section this requirement came from. */
  deltaSection?: DeltaSection;
  /** For MODIFIED requirements: optional note on what changed. */
  modificationNote?: string;
  /** For REMOVED requirements: reason for removal. */
  removalReason?: string;
}

/** A fully parsed OpenSpec document. */
export interface OpenSpecDoc {
  /** The domain name (from `# Domain` header, e.g. "Auth"). */
  domain: string;
  /** The purpose/description text (from `## Purpose`). */
  purpose: string;
  /** The list of requirements. */
  requirements: Requirement[];
  /** Gherkin tags (e.g. @smoke, @regression) on the Feature. */
  tags: string[];
  /** If this doc came from a change delta, the change name. */
  changeName?: string;
  /** Background steps shared across all scenarios (from `## Background`). */
  background: Step[];
}

/**
 * Options that control how the Gherkin generator behaves.
 */
export interface GeneratorOptions {
  /** The target Gherkin language code (e.g. "en", "pt", "fr"). Defaults to "en". */
  language: string;
  /** Include Gherkin `Rule:` blocks from requirements. Defaults to true. */
  includeRules: boolean;
  /** Indent size in spaces. Defaults to 2. */
  indentSize: number;
}

export const DEFAULT_OPTIONS: GeneratorOptions = {
  language: 'en',
  includeRules: true,
  indentSize: 2,
};
