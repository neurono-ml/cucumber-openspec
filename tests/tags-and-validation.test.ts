import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { parseSpec } from '../scripts/openspec-parser.js';
import { generateFeature } from '../scripts/gherkin-generator.js';
import { generateMessages } from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');
const NL = '\n';

// ---------------------------------------------------------------------------
// Gherkin grammar validation helper
// ---------------------------------------------------------------------------

function validateGherkin(featureText: string): { valid: boolean; error?: string } {
  const uuidFn = IdGenerator.uuid();
  const result = generateMessages(
    featureText,
    'validated.feature',
    'text/x.cucumber.gherkin+plain',
    {
      includeSource: false,
      includePickles: false,
      includeGherkinDocument: true,
      newId: uuidFn,
    }
  );
  for (const msg of result) {
    if (msg.parseError) {
      return { valid: false, error: msg.parseError.message };
    }
    if (msg.gherkinDocument) {
      return { valid: true };
    }
  }
  return { valid: false, error: 'No GherkinDocument produced' };
}

function assertValidGherkin(featureText: string, label: string): void {
  const result = validateGherkin(featureText);
  assert.ok(result.valid, `${label} should be valid Gherkin${result.error ? ': ' + result.error : ''}`);
}

// ---------------------------------------------------------------------------
// Tags tests
// ---------------------------------------------------------------------------

describe('tags parsing and generation', () => {

  it('should parse scenario-level tags', () => {
    const lines = [
      '# API Spec',
      '## Purpose',
      'API endpoints.',
      '### Requirement: Rate Limit',
      '#### @smoke Scenario: Exceeded',
      '- **GIVEN** a client',
      '- **WHEN** they exceed 100 req/min',
      '- **THEN** they get 429',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].scenarios[0].tags.length, 1);
    assert.equal(doc.requirements[0].scenarios[0].tags[0], '@smoke');
    assert.equal(doc.requirements[0].scenarios[0].name, 'Exceeded');
  });

  it('should parse multiple scenario-level tags', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### @smoke @regression @slow Scenario: Full test',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const tags = doc.requirements[0].scenarios[0].tags;
    assert.equal(tags.length, 3);
    assert.equal(tags[0], '@smoke');
    assert.equal(tags[1], '@regression');
    assert.equal(tags[2], '@slow');
    assert.equal(doc.requirements[0].scenarios[0].name, 'Full test');
  });

  it('should parse requirement-level tags', () => {
    const lines = [
      '# Auth Spec',
      '## Purpose',
      'Auth.',
      '### @critical Requirement: Login',
      '#### Scenario: Success',
      '- **WHEN** login',
      '- **THEN** ok',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].tags.length, 1);
    assert.equal(doc.requirements[0].tags[0], '@critical');
    assert.equal(doc.requirements[0].name, 'Login');
  });

  it('should parse scenario with no tags', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: No tags',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].scenarios[0].tags.length, 0);
    assert.equal(doc.requirements[0].scenarios[0].name, 'No tags');
  });

  it('should parse requirement with no tags', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: No Tags Here',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].tags.length, 0);
    assert.equal(doc.requirements[0].name, 'No Tags Here');
  });

  it('should render scenario tags in generated feature', () => {
    const lines = [
      '# API',
      '## Purpose',
      'API test.',
      '### Requirement: Rate Limit',
      '#### @smoke @regression Scenario: Exceeded',
      '- **GIVEN** a client',
      '- **WHEN** exceed limit',
      '- **THEN** 429',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.includes('@smoke @regression'), 'should contain scenario tags');
    assert.ok(feature.includes('Scenario: Exceeded'), 'should have scenario name');
    // Tags should be on the line immediately before Scenario
    const tagLineIndex = feature.indexOf('@smoke @regression');
    const scenarioLineIndex = feature.indexOf('Scenario: Exceeded');
    assert.ok(tagLineIndex < scenarioLineIndex, 'tags should come before Scenario line');
  });

  it('should render requirement tags in generated feature', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth test.',
      '### @critical Requirement: Login',
      '#### Scenario: Success',
      '- **WHEN** login',
      '- **THEN** ok',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.includes('@critical'), 'should contain requirement tag');
    assert.ok(feature.includes('Rule: Login'), 'should have Rule line');
    // Tag should be on the line immediately before Rule
    const tagLineIndex = feature.indexOf('@critical');
    const ruleLineIndex = feature.indexOf('Rule: Login');
    assert.ok(tagLineIndex < ruleLineIndex, 'tag should come before Rule line');
  });

  it('should render both requirement and scenario tags', () => {
    const lines = [
      '# App',
      '## Purpose',
      'App test.',
      '### @critical Requirement: Auth',
      '#### @smoke Scenario: Login',
      '- **GIVEN** user',
      '- **WHEN** login',
      '- **THEN** ok',
      '#### @regression Scenario: Logout',
      '- **GIVEN** logged in',
      '- **WHEN** logout',
      '- **THEN** done',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    // Check requirement tag
    assert.ok(feature.includes('@critical'));
    // Check scenario tags
    assert.ok(feature.includes('@smoke'));
    assert.ok(feature.includes('@regression'));
    // Valid Gherkin
    assertValidGherkin(feature, 'Tags combined');
  });

  it('should handle tags with hyphenated names', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### @integration-test @e2e Scenario: Full',
      '- **WHEN** run',
      '- **THEN** done',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].scenarios[0].tags.length, 2);
    assert.equal(doc.requirements[0].scenarios[0].tags[0], '@integration-test');
    assert.equal(doc.requirements[0].scenarios[0].tags[1], '@e2e');
    const feature = generateFeature(doc);
    assert.ok(feature.includes('@integration-test @e2e'));
    assertValidGherkin(feature, 'Hyphenated tags');
  });
});

// ---------------------------------------------------------------------------
// Gherkin grammar validation tests
// ---------------------------------------------------------------------------

describe('Gherkin grammar validation', () => {

  it('should validate the existing English fixture', () => {
    const content = readFileSync(join(FIXTURES, 'expected', 'en_auth.feature'), 'utf-8');
    assertValidGherkin(content, 'English fixture');
  });

  it('should validate generated feature from auth spec', () => {
    const content = readFileSync(join(FIXTURES, 'auth-spec.md'), 'utf-8');
    const doc = parseSpec(content);
    const feature = generateFeature(doc);
    assertValidGherkin(feature, 'Generated auth feature');
  });

  it('should validate feature with Doc Strings', () => {
    const content = readFileSync(join(FIXTURES, 'sub-bullets-spec.md'), 'utf-8');
    const doc = parseSpec(content);
    const feature = generateFeature(doc);
    assert.ok(feature.includes('"""'), 'should have Doc Strings');
    assertValidGherkin(feature, 'Doc Strings feature');
  });

  it('should validate feature with delta annotations', () => {
    const content = readFileSync(join(FIXTURES, 'delta-spec.md'), 'utf-8');
    const doc = parseSpec(content, 'update-auth');
    const feature = generateFeature(doc);
    assert.ok(feature.includes('# MODIFIED:'), 'should have MODIFIED comment');
    assert.ok(feature.includes('# REMOVED:'), 'should have REMOVED comment');
    assertValidGherkin(feature, 'Delta feature');
  });

  it('should validate feature in Portuguese', () => {
    const content = readFileSync(join(FIXTURES, 'auth-spec.md'), 'utf-8');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'pt' });
    assert.ok(feature.startsWith('# language: pt'));
    assertValidGherkin(feature, 'Portuguese feature');
  });

  it('should validate feature in Arabic (RTL)', () => {
    const content = readFileSync(join(FIXTURES, 'auth-spec.md'), 'utf-8');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'ar' });
    assert.ok(feature.startsWith('# language: ar'));
    assertValidGherkin(feature, 'Arabic feature');
  });

  it('should validate feature with tags', () => {
    const lines = [
      '# Auth API',
      '## Purpose',
      'Auth endpoints.',
      '### @critical Requirement: Login',
      '#### @smoke @regression Scenario: Success',
      '- **GIVEN** valid credentials',
      '- **WHEN** login',
      '- **THEN** token returned',
      '#### @slow Scenario: Timeout',
      '- **GIVEN** idle session',
      '- **WHEN** 30 min pass',
      '- **THEN** session expires',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.includes('@critical'), 'should have requirement tag');
    assert.ok(feature.includes('@smoke @regression'), 'should have scenario tags');
    assert.ok(feature.includes('@slow'), 'should have second scenario tag');
    assertValidGherkin(feature, 'Tagged feature');
  });

  it('should validate feature with no Purpose (minimal spec)', () => {
    const lines = [
      '# Minimal',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assertValidGherkin(feature, 'Minimal feature');
  });

  it('should validate feature with 25 scenarios (stress)', () => {
    const scenarios: string[] = [];
    for (let i = 0; i < 25; i++) {
      scenarios.push('#### Scenario: S' + (i + 1));
      scenarios.push('- **GIVEN** context ' + i);
      scenarios.push('- **WHEN** action ' + i);
      scenarios.push('- **THEN** result ' + i);
    }
    const lines = [
      '# Stress Test',
      '## Purpose',
      'Testing large specs.',
      '### Requirement: Big',
      ...scenarios,
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assertValidGherkin(feature, 'Stress test feature');
  });

  it('should validate feature in all tested languages', () => {
    const content = readFileSync(join(FIXTURES, 'auth-spec.md'), 'utf-8');
    const doc = parseSpec(content);
    for (const lang of ['fr', 'de', 'ja', 'zh-CN']) {
      const feature = generateFeature(doc, { language: lang });
      assertValidGherkin(feature, `Feature in ${lang}`);
    }
  });

  it('should validate the end-to-end CLI output', () => {
    const tmpDir = join(__dirname, '..', 'tmp-test-validate');
    const scriptsDir = join(__dirname, '..', 'scripts');
    const cli = `npx tsx ${join(scriptsDir, 'index.ts')}`;
    const input = join(tmpDir, 'openspec', 'specs', 'auth');
    const outDir = join(tmpDir, 'features');

    try {
      // Create an openspec/ layout
      mkdirSync(input, { recursive: true });
      const specContent = readFileSync(join(FIXTURES, 'auth-spec.md'), 'utf-8');
      writeFileSync(join(input, 'spec.md'), specContent);

      mkdirSync(outDir, { recursive: true });
      const cmd = `${cli} -i ${join(tmpDir, 'openspec')} -o ${outDir}`;
      execSync(cmd, { cwd: tmpDir, encoding: 'utf-8' });

      const featurePath = join(outDir, 'auth.feature');
      assert.ok(existsSync(featurePath), 'feature file should exist');
      const content = readFileSync(featurePath, 'utf-8');
      assertValidGherkin(content, 'CLI-generated feature');
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
