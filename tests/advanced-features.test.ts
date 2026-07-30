import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSpec } from '../scripts/openspec-parser.js';
import { generateFeature } from '../scripts/gherkin-generator.js';
import { generateMessages } from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

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

// ===========================================================================
// 1. Feature-level tags
// ===========================================================================

describe('Feature-level tags', () => {

  it('should parse feature-level tags from H1', () => {
    const lines = [
      '# @smoke @regression Auth Specification',
      '## Purpose',
      'Auth endpoints.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.tags.length, 2);
    assert.equal(doc.tags[0], '@smoke');
    assert.equal(doc.tags[1], '@regression');
    assert.equal(doc.domain, 'Auth');
  });

  it('should parse single feature-level tag', () => {
    const lines = [
      '# @critical Auth Spec',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.tags.length, 1);
    assert.equal(doc.tags[0], '@critical');
  });

  it('should parse hyphenated feature-level tags', () => {
    const lines = [
      '# @integration-test @e2e Auth',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.tags.length, 2);
    assert.equal(doc.tags[0], '@integration-test');
    assert.equal(doc.tags[1], '@e2e');
  });

  it('should handle no feature-level tags', () => {
    const lines = [
      '# Auth Only',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.tags.length, 0);
  });

  it('should render feature-level tags in generated feature', () => {
    const lines = [
      '# @smoke Auth Spec',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.startsWith('@smoke'), 'feature-level tag should be first line');
    assert.ok(feature.includes('@smoke\nFeature: Auth Spec'), 'tag should be right before Feature:');
    assertValidGherkin(feature, 'Feature-level tags');
  });

  it('should render multiple feature-level tags', () => {
    const lines = [
      '# @smoke @regression @critical Auth',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.startsWith('@smoke @regression @critical'), 'all tags should be on one line');
    assertValidGherkin(feature, 'Multiple feature tags');
  });
});

// ===========================================================================
// 2. Background sections
// ===========================================================================

describe('Background sections', () => {

  it('should parse ## Background steps', () => {
    const lines = [
      '# Auth Spec',
      '## Purpose',
      'Auth test.',
      '## Background',
      '- **GIVEN** user is logged in',
      '- **AND** has admin role',
      '## Requirements',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.background.length, 2);
    assert.equal(doc.background[0].keyword, 'GIVEN');
    assert.equal(doc.background[0].text, 'user is logged in');
    assert.equal(doc.background[1].keyword, 'AND');
    assert.equal(doc.background[1].text, 'has admin role');
  });

  it('should handle Background without Purpose', () => {
    const lines = [
      '# Auth',
      '## Background',
      '- **GIVEN** user is logged in',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.background.length, 1);
    assert.equal(doc.background[0].keyword, 'GIVEN');
  });

  it('should handle empty Background', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Test.',
      '## Background',
      '## Requirements',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.background.length, 0);
  });

  it('should handle steps without bold markers in Background', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Test.',
      '## Background',
      '- Given user is logged in',
      '- When system is ready',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.background.length, 2);
    assert.equal(doc.background[0].keyword, 'GIVEN');
    assert.equal(doc.background[1].keyword, 'WHEN');
  });

  it('should render Background in generated feature', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth test.',
      '## Background',
      '- **GIVEN** user is logged in',
      '- **AND** has admin role',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.includes('Background:'), 'should have Background keyword');
    assert.ok(feature.includes('Given user is logged in'), 'should have background step');
    assert.ok(feature.includes('And has admin role'), 'should have AND step');
    assertValidGherkin(feature, 'Background in feature');
  });

  it('should place Background after Purpose and before Rules', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth test.',
      '## Background',
      '- **GIVEN** user is logged in',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    const purposeIdx = feature.indexOf('Auth test.');
    const bgIdx = feature.indexOf('Background:');
    const ruleIdx = feature.indexOf('Rule:');
    assert.ok(purposeIdx < bgIdx, 'Purpose should come before Background');
    assert.ok(bgIdx < ruleIdx, 'Background should come before Rules');
  });

  it('should validate generated Background feature with @cucumber/gherkin', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '## Background',
      '- **GIVEN** user is logged in',
      '- **AND** has API key',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** access',
      '- **THEN** ok',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assertValidGherkin(feature, 'Background feature');
  });
});

// ===========================================================================
// 3. Scenario Outline + Examples
// ===========================================================================

describe('Scenario Outline and Examples', () => {

  it('should parse #### Scenario Outline', () => {
    const lines = [
      '# Auth Spec',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario Outline: Login with roles',
      '- **GIVEN** user <role>',
      '- **WHEN** login',
      '- **THEN** <status>',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].scenarios.length, 1);
    assert.equal(doc.requirements[0].scenarios[0].isOutline, true);
    assert.equal(doc.requirements[0].scenarios[0].name, 'Login with roles');
  });

  it('should not mark regular #### Scenario as outline', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario: Login',
      '- **WHEN** login',
      '- **THEN** ok',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].scenarios[0].isOutline, false);
  });

  it('should parse ##### Examples: pipe table', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario Outline: Login with roles',
      '- **GIVEN** user <role>',
      '- **WHEN** login',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| role  | status  |',
      '| admin | success |',
      '| guest | denied  |',
    ];
    const doc = parseSpec(lines.join(NL));
    const scenario = doc.requirements[0].scenarios[0];
    assert.equal(scenario.isOutline, true);
    assert.ok(scenario.examples, 'should have examples');
    assert.deepEqual(scenario.examples!.header, ['role', 'status']);
    assert.equal(scenario.examples!.rows.length, 2);
    assert.deepEqual(scenario.examples!.rows[0], ['admin', 'success']);
    assert.deepEqual(scenario.examples!.rows[1], ['guest', 'denied']);
  });

  it('should skip Markdown table separator rows in Examples', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario Outline: Login',
      '- **GIVEN** user <role>',
      '- **WHEN** login',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| role  | status  |',
      '| --- | --- |',
      '| admin | success |',
      '| guest | denied  |',
    ];
    const doc = parseSpec(lines.join(NL));
    const scenario = doc.requirements[0].scenarios[0];
    assert.equal(scenario.examples!.rows.length, 2, 'separator row should be skipped');
    assert.deepEqual(scenario.examples!.rows[0], ['admin', 'success']);
  });

  it('should handle Examples without preceding Scenario Outline (treat as Outline)', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario: Login with roles',
      '- **GIVEN** user <role>',
      '- **WHEN** login',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| role  | status  |',
      '| admin | success |',
    ];
    const doc = parseSpec(lines.join(NL));
    // When we see ##### Examples, we automatically set isOutline = true
    assert.equal(doc.requirements[0].scenarios[0].isOutline, true);
    assert.ok(doc.requirements[0].scenarios[0].examples);
  });

  it('should render Scenario Outline in generated feature', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario Outline: Login with roles',
      '- **GIVEN** user <role>',
      '- **WHEN** login',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| role  | status  |',
      '| admin | success |',
      '| guest | denied  |',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.includes('Scenario Outline: Login with roles'), 'should use Scenario Outline keyword');
    assert.ok(feature.includes('Examples:'), 'should have Examples keyword');
    assert.ok(feature.includes('| role | status |'), 'should include Examples header');
    assert.ok(feature.includes('| admin | success |'), 'should include example row');
    assert.ok(feature.includes('| guest | denied |'), 'should include second example row');
    assertValidGherkin(feature, 'Scenario Outline feature');
  });

  it('should render Scenario Outline in Portuguese', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario Outline: Login with roles',
      '- **GIVEN** user <role>',
      '- **WHEN** login',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| role  | status  |',
      '| admin | success |',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc, { language: 'pt' });
    assert.ok(feature.startsWith('# language: pt'), 'should have Portuguese header');
    assert.ok(feature.includes('Esquema do Cenário:') || feature.includes('Cenário: Login com papéis'),
      'should use Portuguese Scenario Outline keyword');
    assertValidGherkin(feature, 'Scenario Outline in Portuguese');
  });

  it('should correctly position Examples after steps in output', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario Outline: Login',
      '- **GIVEN** user <role>',
      '- **WHEN** login',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| role  | status  |',
      '| admin | success |',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    const thenIdx = feature.indexOf('Then <status>');
    const examplesIdx = feature.indexOf('Examples:');
    assert.ok(thenIdx < examplesIdx, 'Examples should come after all steps');
  });
});

// ===========================================================================
// 4. Gherkin Tables (pipe tables under steps)
// ===========================================================================

describe('Gherkin DataTables (pipe tables under steps)', () => {

  it('should parse a pipe table under a step', () => {
    const lines = [
      '# Auth Spec',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** the following users exist:',
      '  | name  | role  |',
      '  | Alice | admin |',
      '  | Bob   | guest |',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const step = doc.requirements[0].scenarios[0].steps[0];
    assert.ok(step.table, 'should have a table');
    assert.deepEqual(step.table!.header, ['name', 'role']);
    assert.equal(step.table!.rows.length, 2);
    assert.deepEqual(step.table!.rows[0], ['Alice', 'admin']);
    assert.deepEqual(step.table!.rows[1], ['Bob', 'guest']);
  });

  it('should render pipe table in generated feature', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** the following users exist:',
      '  | name  | role  |',
      '  | Alice | admin |',
      '  | Bob   | guest |',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    assert.ok(feature.includes('| name | role |'), 'should include table header');
    assert.ok(feature.includes('| Alice | admin |'), 'should include first data row');
    assert.ok(feature.includes('| Bob | guest |'), 'should include second data row');
    assertValidGherkin(feature, 'DataTable feature');
  });

  it('should handle table with single row', () => {
    const lines = [
      '# App',
      '## Purpose',
      'App.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** a single item:',
      '  | id | name |',
      '  | 1  | Foo  |',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const step = doc.requirements[0].scenarios[0].steps[0];
    assert.equal(step.table!.rows.length, 1);
    assert.deepEqual(step.table!.rows[0], ['1', 'Foo']);
  });

  it('should handle step without table (no regression)', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** normal step',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const step = doc.requirements[0].scenarios[0].steps[0];
    assert.equal(step.table, undefined);
    assert.equal(step.subItems.length, 0);
  });

  it('should place table after step in generated output', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** the following:',
      '  | col | val |',
      '  | A   | 1   |',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc);
    const givenIdx = feature.indexOf('Given the following:');
    const tableIdx = feature.indexOf('| col | val |');
    const whenIdx = feature.indexOf('When action');
    assert.ok(givenIdx < tableIdx, 'table should come after step text');
    assert.ok(tableIdx < whenIdx, 'table should come before next step');
  });

  it('should render table in French (localized)', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      'Auth.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** the following users:',
      '  | name | role |',
      '  | Ana  | admin |',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc, { language: 'fr' });
    assert.ok(feature.startsWith('# language: fr'));
    assert.ok(feature.includes('| name | role |'), 'table should be language-independent');
    assertValidGherkin(feature, 'DataTable in French');
  });
});

// ===========================================================================
// 5. Combined feature integration tests
// ===========================================================================

describe('Combined features integration', () => {

  it('should combine all features: tags + background + outline + tables', () => {
    const lines = [
      '# @smoke Auth Specification',
      '## Purpose',
      'Authentication and authorization.',
      '## Background',
      '- **GIVEN** user is logged in',
      '### Requirement: Login',
      '#### Scenario Outline: Login with different roles',
      '- **GIVEN** the following users:',
      '  | role   | password |',
      '  | admin  | admin123 |',
      '  | viewer | viewer123 |',
      '- **WHEN** user logs in',
      '- **THEN** <result>',
      '',
      '##### Examples:',
      '| role   | result  |',
      '| admin  | success |',
      '| viewer | limited |',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.tags.length, 1);
    assert.equal(doc.tags[0], '@smoke');
    assert.equal(doc.background.length, 1);
    assert.equal(doc.background[0].keyword, 'GIVEN');
    assert.equal(doc.requirements[0].scenarios[0].isOutline, true);
    assert.ok(doc.requirements[0].scenarios[0].steps[0].table, 'should have DataTable');

    const feature = generateFeature(doc);
    assert.ok(feature.includes('@smoke'), 'should have feature tag');
    assert.ok(feature.includes('Background:'), 'should have Background');
    assert.ok(feature.includes('Scenario Outline:'), 'should have Scenario Outline');
    assert.ok(feature.includes('Examples:'), 'should have Examples');
    assert.ok(feature.includes('| role | password |'), 'should have DataTable in step');
    assertValidGherkin(feature, 'Combined features');
  });

  it('should validate combined feature in Portuguese', () => {
    const lines = [
      '# @critical Auth',
      '## Purpose',
      'Autenticação.',
      '## Background',
      '- **GIVEN** usuário logado',
      '### Requirement: Login',
      '#### Scenario Outline: Login',
      '- **GIVEN** dados:',
      '  | user | pass |',
      '  | ana  | 123  |',
      '- **WHEN** login',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| status   |',
      '| sucesso  |',
      '| falha    |',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc, { language: 'pt' });
    assert.ok(feature.startsWith('# language: pt'));
    assert.ok(feature.includes('@critical'), 'should keep tags language-independent');
    assert.ok(feature.includes('Background') || feature.includes('Contexto'), 'should have Background keyword');
    assertValidGherkin(feature, 'Combined Portuguese');
  });

  it('should validate combined feature in Japanese', () => {
    const lines = [
      '# Auth',
      '## Purpose',
      '認証テスト。',
      '### Requirement: R1',
      '#### Scenario Outline: ログイン',
      '- **GIVEN** ユーザー <role>',
      '- **WHEN** ログイン',
      '- **THEN** <status>',
      '',
      '##### Examples:',
      '| role | status |',
      '| admin | 成功 |',
      '| guest | 拒否 |',
    ];
    const doc = parseSpec(lines.join(NL));
    const feature = generateFeature(doc, { language: 'ja' });
    assert.ok(feature.startsWith('# language: ja'));
    assertValidGherkin(feature, 'Combined Japanese');
  });
});
