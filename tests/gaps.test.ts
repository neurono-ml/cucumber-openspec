import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSpec } from '../scripts/openspec-parser.js';
import { generateFeature } from '../scripts/gherkin-generator.js';

const NL = '\n';

describe('Gap analysis — critical untested paths', () => {

  it('should parse **BUT** keyword', () => {
    const lines = [
      '# Auth Spec',
      '## Purpose',
      'Test BUT.',
      '### Requirement: Access',
      '#### Scenario: Denied',
      '- **GIVEN** a user',
      '- **WHEN** they access admin',
      '- **THEN** access denied',
      '- **BUT** an audit log is created',
    ];
    const doc = parseSpec(lines.join(NL));
    const steps = doc.requirements[0].scenarios[0].steps;
    assert.equal(steps.length, 4);
    assert.equal(steps[3].keyword, 'BUT');
  });

  it('should skip H3 without Requirement prefix', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Some other heading',
      'This is not a requirement.',
      '### Requirement: Real',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements.length, 1);
    assert.equal(doc.requirements[0].name, 'Real');
  });

  it('should handle spec with only a domain heading', () => {
    const doc = parseSpec('# Empty Spec\n');
    assert.equal(doc.domain, 'Empty Spec');
    assert.equal(doc.purpose, '');
    assert.equal(doc.requirements.length, 0);
    const feature = generateFeature(doc);
    assert.ok(feature.includes('Feature: Empty Spec'));
  });

  it('should handle AND without preceding keyword', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** context',
      '- **AND** extra context',
      '- **WHEN** action',
      '- **THEN** result',
      '- **BUT** side effect',
    ];
    const doc = parseSpec(lines.join(NL));
    const steps = doc.requirements[0].scenarios[0].steps;
    assert.equal(steps.length, 5);
    assert.equal(steps[1].keyword, 'AND');
    assert.equal(steps[4].keyword, 'BUT');
  });

  it('should parse steps without **bold** markers', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- Given something',
      '- When action',
      '- Then result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].scenarios[0].steps.length, 3);
    assert.equal(doc.requirements[0].scenarios[0].steps[0].keyword, 'GIVEN');
  });

  it('should parse steps with single asterisks', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- *Given* something',
      '- *When* action',
      '- *Then* result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements[0].scenarios[0].steps.length, 3);
    assert.equal(doc.requirements[0].scenarios[0].steps[0].keyword, 'GIVEN');
  });

  it('should handle multiple H1 headings (use first)', () => {
    const lines = [
      '# First Domain',
      '## Purpose',
      'Main purpose.',
      '### Requirement: A',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
      '',
      '# Second Domain',
      '### Requirement: B',
      '#### Scenario: S2',
      '- **WHEN** action2',
      '- **THEN** result2',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.domain, 'First Domain');
    assert.equal(doc.requirements.length, 2, 'both requirements should be captured');
  });

  it('should handle step text with special characters', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test special chars.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** a "quoted" string',
      "- **WHEN** it's apostrophe",
      '- **THEN** price is $100 & tax',
    ];
    const doc = parseSpec(lines.join(NL));
    const steps = doc.requirements[0].scenarios[0].steps;
    assert.equal(steps[0].text, 'a "quoted" string');
    assert.equal(steps[1].text, "it's apostrophe");
    assert.equal(steps[2].text, 'price is $100 & tax');
  });

  it('should handle blank lines between steps', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test blank lines.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **GIVEN** context',
      '',
      '- **WHEN** action',
      '',
      '',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    const steps = doc.requirements[0].scenarios[0].steps;
    assert.equal(steps.length, 3, 'blank lines between steps should be ignored');
  });

  it('should handle multiple change specs for same domain', () => {
    const lines = [
      '# Auth',
      '## ADDED Requirements',
      '### Requirement: New Feature',
      '#### Scenario: Test',
      '- **WHEN** something',
      '- **THEN** ok',
    ];
    const doc = parseSpec(lines.join(NL), 'change-one');
    assert.equal(doc.changeName, 'change-one');
    assert.equal(doc.requirements[0].deltaSection, 'ADDED');

    const doc2 = parseSpec(lines.join(NL), 'change-two');
    assert.equal(doc2.changeName, 'change-two');
    assert.equal(doc2.requirements[0].deltaSection, 'ADDED');
  });

  it('should preserve step keyword case via .toUpperCase()', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **Given** something',
      '- **wHeN** action',
      '- **then** result',
      '- **And** more',
    ];
    const doc = parseSpec(lines.join(NL));
    const steps = doc.requirements[0].scenarios[0].steps;
    assert.equal(steps[0].keyword, 'GIVEN');
    assert.equal(steps[1].keyword, 'WHEN');
    assert.equal(steps[2].keyword, 'THEN');
    assert.equal(steps[3].keyword, 'AND');
  });

  it('should handle descriptive text between H3/H4 headings', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Test.',
      '### Requirement: R1',
      'Some descriptive text about the requirement.',
      'More details here.',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements.length, 1);
    assert.ok(doc.requirements[0].text.includes('Some descriptive text'));
    assert.equal(doc.requirements[0].scenarios[0].name, 'S1');
  });

  it('should generate valid Gherkin for spec with 20+ scenarios', () => {
    const scenarios = [];
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
    assert.equal(doc.requirements[0].scenarios.length, 25);
    const feature = generateFeature(doc);
    assert.ok(feature.includes('Feature: Stress Test'));
    assert.ok(feature.includes('Scenario: S25'));
  });

  it('should handle H2 that is not Purpose or Requirements', () => {
    const lines = [
      '# Test',
      '## Purpose',
      'Main purpose.',
      '## Implementation Details',
      'This should be ignored.',
      '### Requirement: R1',
      '#### Scenario: S1',
      '- **WHEN** action',
      '- **THEN** result',
    ];
    const doc = parseSpec(lines.join(NL));
    assert.equal(doc.requirements.length, 1, 'should still find requirement after unknown H2');
  });
});
