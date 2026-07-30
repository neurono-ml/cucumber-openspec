import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSpec } from '../scripts/openspec-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIXTURES = join(__dirname, 'fixtures');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf-8');
}

// =========================================================================
// RED phase — write a test that fails first
// =========================================================================

describe('openspec-parser', () => {
  it('should parse a basic spec with domain, purpose, requirements and scenarios', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);

    // Domain
    assert.equal(doc.domain, 'Auth', 'should extract domain name without "Specification" suffix');

    // Purpose
    assert.ok(doc.purpose.includes('authenticate users'), 'should extract purpose text');
    assert.ok(doc.purpose.includes('manage sessions securely'), 'should extract full purpose');

    // Requirements count
    assert.equal(doc.requirements.length, 2, 'should find 2 requirements');

    // First requirement
    const req1 = doc.requirements[0];
    assert.equal(req1.name, 'Session Timeout', 'should extract requirement name');
    assert.ok(req1.text.includes('expire a session after 30 minutes'), 'should extract requirement text');
    assert.equal(req1.scenarios.length, 2, 'should have 2 scenarios');

    // First scenario
    const sc1 = req1.scenarios[0];
    assert.equal(sc1.name, 'Idle timeout', 'should extract scenario name');
    assert.equal(sc1.steps.length, 4, 'should have 4 steps');

    // Step details
    assert.equal(sc1.steps[0].keyword, 'GIVEN');
    assert.equal(sc1.steps[0].text, 'an authenticated session');
    assert.equal(sc1.steps[1].keyword, 'WHEN');
    assert.equal(sc1.steps[1].text, '30 minutes pass with no activity');
    assert.equal(sc1.steps[2].keyword, 'THEN');
    assert.equal(sc1.steps[2].text, 'the session is invalidated');
    assert.equal(sc1.steps[3].keyword, 'AND');
    assert.equal(sc1.steps[3].text, 'the user must re-authenticate');

    // Second scenario (Activity resets timer)
    const sc2 = req1.scenarios[1];
    assert.equal(sc2.name, 'Activity resets timer');
    assert.equal(sc2.steps.length, 3);
    assert.equal(sc2.steps[2].keyword, 'THEN');

    // Second requirement (Login Validation)
    const req2 = doc.requirements[1];
    assert.equal(req2.name, 'Login Validation');
    assert.equal(req2.scenarios.length, 2, 'should have 2 scenarios');

    // Scenario without GIVEN (starts with WHEN)
    const loginScenario = req2.scenarios[0];
    assert.equal(loginScenario.name, 'Successful login');
    assert.equal(loginScenario.steps[0].keyword, 'WHEN', 'first step can be WHEN (no GIVEN)');
  });
});
