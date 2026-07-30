import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(__dirname, '..', 'scripts');
const TMP = join(__dirname, '..', 'tmp-test-cli');

const CLI = `npx tsx ${join(SCRIPTS, 'index.ts')}`;

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf-8');
}

describe('CLI integration', () => {
  before(() => {
    rmSync(TMP, { recursive: true, force: true });
    // Create a simple OpenSpec file
    write(join(TMP, 'openspec', 'specs', 'api', 'spec.md'), [
      '# API Specification',
      '## Purpose',
      'API endpoints.',
      '### Requirement: Rate Limit',
      '#### Scenario: Exceeded',
      '- **GIVEN** a client',
      '- **WHEN** they exceed 100 req/min',
      '- **THEN** they get 429',
    ].join('\n'));
  });

  after(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it('should convert a spec file to a feature file', () => {
    const outDir = join(TMP, 'features');
    const cmd = `${CLI} -i ${join(TMP, 'openspec', 'specs', 'api', 'spec.md')} -o ${outDir}`;
    const output = execSync(cmd, { cwd: join(TMP), encoding: 'utf-8' });

    const featurePath = join(outDir, 'api.feature');
    assert.ok(existsSync(featurePath), `feature file should exist at ${featurePath}`);
    const content = readFileSync(featurePath, 'utf-8');
    assert.ok(content.includes('Feature: API'), `should contain Feature line. Content: ${content.slice(0, 200)}`);
    assert.ok(content.includes('Scenario: Exceeded'));
  });

  it('should convert with Portuguese language', () => {
    const outDir = join(TMP, 'features-pt');
    const cmd = `${CLI} -i ${join(TMP, 'openspec', 'specs', 'api', 'spec.md')} -o ${outDir} -l pt`;
    try {
      const output = execSync(cmd, { cwd: join(TMP), encoding: 'utf-8' });
    } catch (e: unknown) {
      const err = e as { stderr?: string; stdout?: string; status?: number };
      console.error('CLI error:', err.stderr || 'no stderr', 'stdout:', err.stdout || 'no stdout');
      throw e;
    }

    const featurePath = join(outDir, 'api.feature');
    assert.ok(existsSync(featurePath), `feature file should exist at ${featurePath}`);
    const content = readFileSync(featurePath, 'utf-8');
    assert.ok(content.startsWith('# language: pt'));
    assert.ok(content.includes('Funcionalidade: API'));
  });

  it('should convert a whole directory', () => {
    const outDir = join(TMP, 'features-dir');
    const cmd = `${CLI} -i ${join(TMP, 'openspec')} -o ${outDir}`;
    execSync(cmd, { cwd: join(TMP), encoding: 'utf-8' });

    const featurePath = join(outDir, 'api.feature');
    assert.ok(existsSync(featurePath), 'feature file should exist in directory output');
  });

  it('should exit with error when input is missing', () => {
    try {
      execSync(`${CLI} -o ${join(TMP, 'void')}`, { cwd: join(TMP), encoding: 'utf-8' });
      assert.fail('should have thrown');
    } catch (err: unknown) {
      const error = err as { stderr?: string; status?: number };
      assert.ok(error.status !== 0, 'should exit with non-zero status');
    }
  });
});
