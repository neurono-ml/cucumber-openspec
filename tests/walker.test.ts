import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkOpenspec } from '../scripts/openspec-walker.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TMP = join(__dirname, '..', 'tmp-test-openspec');

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf-8');
}

describe('openspec-walker', () => {
  before(() => {
    rmSync(TMP, { recursive: true, force: true });

    // Create a mock openspec/ directory
    // openspec/specs/auth/spec.md
    write(join(TMP, 'openspec', 'specs', 'auth', 'spec.md'), [
      '# Auth Specification',
      '## Purpose',
      'Authentication system.',
      '### Requirement: Login',
      '#### Scenario: Success',
      '- **WHEN** valid login',
      '- **THEN** authenticated',
    ].join('\n'));

    // openspec/specs/payments/spec.md
    write(join(TMP, 'openspec', 'specs', 'payments', 'spec.md'), [
      '# Payments Specification',
      '## Purpose',
      'Payment processing.',
      '### Requirement: Charge',
      '#### Scenario: Success',
      '- **GIVEN** valid card',
      '- **WHEN** charge',
      '- **THEN** success',
    ].join('\n'));

    // openspec/changes/add-webhook/specs/auth/spec.md (delta)
    write(join(TMP, 'openspec', 'changes', 'add-webhook', 'specs', 'auth', 'spec.md'), [
      '# Auth Specification',
      '## Purpose',
      'Auth updates.',
      '## ADDED Requirements',
      '### Requirement: Webhook',
      '#### Scenario: Event sent',
      '- **WHEN** event fires',
      '- **THEN** webhook sent',
    ].join('\n'));

    // A standalone specs/ directory (alternative layout)
    write(join(TMP, 'standalone', 'specs', 'test', 'spec.md'), [
      '# Test Spec',
      '## Purpose',
      'Testing.',
      '### Requirement: Run',
      '#### Scenario: Execute',
      '- **WHEN** run',
      '- **THEN** done',
    ].join('\n'));
  });

  after(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('should find specs in openspec/specs/ directory', () => {
    const results = walkOpenspec(join(TMP, 'openspec'));
    // There are 2 specs with domain 'auth': one in specs/, one in changes/
    const authResults = results.filter(r => r.domain === 'auth');
    assert.equal(authResults.length, 2, 'should find 2 auth specs (main + delta)');
    // Find the main one (without changeName)
    const mainAuth = authResults.find(r => !r.doc.changeName);
    assert.ok(mainAuth, 'should find main auth spec');
    assert.equal(mainAuth!.doc.domain, 'Auth');
  });

  it('should find multiple domains', () => {
    const results = walkOpenspec(join(TMP, 'openspec'));
    const domains = results.map(r => r.domain);
    assert.ok(domains.includes('auth'), 'should find auth');
    assert.ok(domains.includes('payments'), 'should find payments');
  });

  it('should find delta specs in changes/ directory', () => {
    const results = walkOpenspec(join(TMP, 'openspec'));
    const deltas = results.filter(r => r.doc.changeName);
    assert.equal(deltas.length, 1, 'should find 1 delta spec');
    assert.equal(deltas[0].doc.changeName, 'add-webhook');
    assert.equal(deltas[0].outputPath, 'add-webhook_auth.feature');
  });

  it('should generate correct output paths', () => {
    const results = walkOpenspec(join(TMP, 'openspec'));
    const paths = results.map(r => r.outputPath);
    assert.ok(paths.includes('auth.feature'), 'main spec: auth.feature');
    assert.ok(paths.includes('payments.feature'), 'main spec: payments.feature');
    assert.ok(paths.includes('add-webhook_auth.feature'), 'delta: add-webhook_auth.feature');
  });

  it('should handle standalone specs/ directory', () => {
    const results = walkOpenspec(join(TMP, 'standalone'));
    assert.equal(results.length, 1, 'should find standalone spec');
    assert.equal(results[0].domain, 'test');
  });

  it('should handle single spec.md file input', () => {
    const results = walkOpenspec(join(TMP, 'openspec', 'specs', 'auth', 'spec.md'));
    assert.equal(results.length, 1, 'should handle single file');
    assert.equal(results[0].doc.domain, 'Auth');
  });

  it('should return empty array for non-existent directory', () => {
    assert.throws(
      () => walkOpenspec(join(TMP, 'non-existent')),
      /No OpenSpec directory found/,
    );
  });
});
