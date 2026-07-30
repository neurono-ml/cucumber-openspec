import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSpec } from '../scripts/openspec-parser.js';
import { generateFeature } from '../scripts/gherkin-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf-8');
}

const NL = '\n';

describe('sub-bullets → Doc Strings', () => {
  it('should convert sub-bullets to Gherkin Doc Strings', () => {
    const content = loadFixture('sub-bullets-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'en' });

    // Should have Doc String for GIVEN step
    assert.ok(feature.includes('"""'), 'should have Doc String delimiter');
    assert.ok(feature.includes('- With role "superadmin"'), 'should preserve sub-bullet content');
    assert.ok(feature.includes('- With 2FA enabled'), 'should preserve sub-bullet content');

    // Should have Doc String for THEN step
    assert.ok(feature.includes('- With admin privileges'), 'should preserve THEN sub-bullets');
    assert.ok(feature.includes('- With access to all modules'), 'should preserve THEN sub-bullets');

    // Should have Doc String for AND step
    assert.ok(feature.includes('- With timestamp'), 'should preserve AND sub-bullets');

    // Verify the structure is correct
    const lines = feature.split(NL);
    const givenDocStringStart = lines.findIndex(l => l.includes('"""') && lines[lines.indexOf(l) - 1]?.includes('an authenticated admin user'));
    assert.ok(givenDocStringStart >= 0, 'Doc String should follow the GIVEN step');

    // Verify no scenario has a step with empty subItems
    assert.ok(
      doc.requirements.every(r =>
        r.scenarios.every(s =>
          s.steps.every(st => Array.isArray(st.subItems))
        )
      ),
      'all steps should have subItems array'
    );
  });
});

describe('delta specs', () => {
  it('should parse ADDED/MODIFIED/REMOVED sections', () => {
    const content = loadFixture('delta-spec.md');
    const doc = parseSpec(content, 'update-auth');

    assert.equal(doc.changeName, 'update-auth');
    assert.equal(doc.domain, 'Auth');

    // Should find requirements across all sections
    assert.equal(doc.requirements.length, 3, 'should find 3 requirements (ADDED + MODIFIED + REMOVED)');

    // ADDED
    const added = doc.requirements.find(r => r.deltaSection === 'ADDED');
    assert.ok(added, 'should have an ADDED requirement');
    assert.equal(added!.name, 'Password Reset');
    assert.equal(added!.scenarios.length, 1);
    assert.equal(added!.scenarios[0].steps.length, 4);

    // MODIFIED
    const modified = doc.requirements.find(r => r.deltaSection === 'MODIFIED');
    assert.ok(modified, 'should have a MODIFIED requirement');
    assert.equal(modified!.name, 'Session Timeout');
    assert.equal(modified!.modificationNote, 'Reduced from 30 to 15 minutes', 'should extract modification note');

    // REMOVED
    const removed = doc.requirements.find(r => r.deltaSection === 'REMOVED');
    assert.ok(removed, 'should have a REMOVED requirement');
    assert.equal(removed!.name, 'Legacy Token Support');
    assert.ok(removed!.text.length > 0, 'should have removal reason text');
  });

  it('should generate feature with delta markers', () => {
    const content = loadFixture('delta-spec.md');
    const doc = parseSpec(content, 'update-auth');
    const feature = generateFeature(doc, { language: 'en' });

    // MODIFIED note
    assert.ok(feature.includes('# MODIFIED: Reduced from 30 to 15 minutes'),
      'should include MODIFIED comment');

    // Generated feature still has valid Gherkin structure
    assert.ok(feature.includes('Feature: Auth'));
    assert.ok(feature.includes('Rule: Password Reset'));
    assert.ok(feature.includes('Rule: Session Timeout'));
    assert.ok(feature.includes('Rule: Legacy Token Support'));

    // REMOVED requirement body text should be present
    assert.ok(feature.includes('Feature removed'), 'should include removal reason in body');
  });
});

describe('edge cases', () => {
  it('should handle spec without Purpose', () => {
    const content = [
      '# Simple Spec',
      '### Requirement: A',
      '#### Scenario: S1',
      '- **WHEN** do X',
      '- **THEN** Y happens',
    ].join(NL);

    const doc = parseSpec(content);
    assert.equal(doc.domain, 'Simple Spec');
    assert.equal(doc.purpose, '');
    assert.equal(doc.requirements.length, 1);

    const feature = generateFeature(doc);
    assert.ok(feature.includes('Feature: Simple Spec'));
    assert.ok(feature.includes('Scenario: S1'));
  });

  it('should handle spec without requirements section heading', () => {
    const content = [
      '# No Requirements Heading',
      '## Purpose',
      'Just a test.',
      '',
      '### Requirement: Direct',
      '#### Scenario: Test',
      '- **GIVEN** state',
      '- **WHEN** action',
      '- **THEN** result',
    ].join(NL);

    const doc = parseSpec(content);
    assert.equal(doc.domain, 'No Requirements Heading');
    assert.equal(doc.requirements.length, 1);
    assert.equal(doc.requirements[0].scenarios.length, 1);
  });

  it('should handle inline code in step text', () => {
    const content = [
      '# Code Spec',
      '## Purpose',
      'Testing code in steps.',
      '',
      '### Requirement: API Auth',
      '#### Scenario: Token validation',
      '- **GIVEN** a valid JWT token',
      '- **WHEN** calling `GET /api/protected`',
      '- **THEN** the response status is 200',
    ].join(NL);

    const doc = parseSpec(content);
    const feature = generateFeature(doc);
    assert.ok(feature.includes('`GET /api/protected`'), 'should preserve inline code');
  });
});
