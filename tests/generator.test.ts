import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSpec } from '../scripts/openspec-parser.js';
import { generateFeature } from '../scripts/gherkin-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIXTURES = join(__dirname, 'fixtures');
const EXPECTED = join(FIXTURES, 'expected');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf-8');
}

function loadExpected(name: string): string {
  return readFileSync(join(EXPECTED, name), 'utf-8');
}

describe('gherkin-generator', () => {
  it('should generate English feature from auth spec', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'en' });

    const expected = loadExpected('en_auth.feature');
    assert.equal(feature, expected);
  });

  it('should include language header for non-English', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'pt' });

    assert.ok(feature.startsWith('# language: pt'), 'should have Portuguese language header');
    assert.ok(feature.includes('Funcionalidade: Auth'), 'should use Portuguese "Funcionalidade" for Feature');
    assert.ok(feature.includes('Regra: Session Timeout'), 'should use Portuguese "Regra" for Rule');
    assert.ok(feature.includes('Cenário: Idle timeout'), 'should use Portuguese "Cenário" for Scenario');
    assert.ok(feature.includes('Dado an'), 'should use Portuguese "Dado" for Given');
    assert.ok(feature.includes('Quando 30'), 'should use Portuguese "Quando" for When');
    assert.ok(feature.includes('Então the session'), 'should use Portuguese "Então" for Then');
    assert.ok(feature.includes('E the user'), 'should use Portuguese "E" for And');
    assert.ok(!feature.includes('Exemplo'), 'should NOT use Portuguese "Exemplo" for Scenario');
  });

  it('should generate feature for French', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'fr' });

    assert.ok(feature.startsWith('# language: fr'), 'should have French language header');
    assert.ok(feature.includes('Fonctionnalité: Auth'), 'should use French "Fonctionnalité"');
    assert.ok(feature.includes('Règle: Session Timeout'), 'should use French "Règle"');
    assert.ok(feature.includes('Scénario: Idle timeout'), 'should use French "Scénario"');
    assert.ok(feature.includes('Soit an'), 'should use French "Soit" for Given');
  });

  it('should generate feature for German', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'de' });

    assert.ok(feature.startsWith('# language: de'), 'should have German language header');
    assert.ok(feature.includes('Funktionalität: Auth'), 'should use German "Funktionalität"');
    assert.ok(feature.includes('Rule: Session Timeout'), 'should use "Rule" for German rule');
    assert.ok(feature.includes('Szenario: Idle timeout'), 'should use German "Szenario" for Scenario');
    assert.ok(feature.includes('Angenommen an'), 'should use German "Angenommen" for Given');
  });

  it('should generate feature for Chinese (zh-CN) with CJK identifiers', () => {
    const content = [
      '# 认证规范',
      '## Purpose',
      '认证系统。',
      '### Requirement: 登录',
      '#### Scenario: 成功登录',
      '- **GIVEN** 有效凭据',
      '- **WHEN** 提交登录',
      '- **THEN** 获得令牌',
    ].join('\n');
    const doc = parseSpec(content);
    assert.strictEqual(doc.domain, '认证规范');
    assert.strictEqual(doc.requirements[0].name, '登录');
    assert.strictEqual(doc.requirements[0].scenarios[0].name, '成功登录');
    const feature = generateFeature(doc, { language: 'zh-CN' });
    assert.ok(feature.startsWith('# language: zh-CN'));
    assert.ok(feature.includes('功能: 认证规范'));
    // zh-CN scenario uses index-1 keyword (剧本 not 场景)
    assert.ok(feature.includes('剧本: 成功登录'));
    assert.ok(feature.includes('假如 有效凭据'));
    assert.ok(feature.includes('当 提交登录'));
    assert.ok(feature.includes('那么 获得令牌'));
  });

  it('should generate feature for Japanese', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'ja' });

    assert.ok(feature.startsWith('# language: ja'));
    assert.ok(feature.includes('フィーチャ: Auth'));
    assert.ok(feature.includes('シナリオ: Idle timeout'));
    assert.ok(feature.includes('前提 an'));
  });

  it('should generate feature for Arabic', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'ar' });

    assert.ok(feature.startsWith('# language: ar'));
    assert.ok(feature.includes('خاصية: Auth'));
    assert.ok(feature.includes('سيناريو: Idle timeout'));
  });

  it('should throw for unsupported language', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    assert.throws(
      () => generateFeature(doc, { language: 'zz' }),
      /Unsupported Gherkin language code/,
    );
  });

  it('should support all Gherkin languages without error', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    // Test a sample of languages across different families
    for (const lang of ['en', 'pt', 'fr', 'de', 'es', 'it', 'nl', 'ru', 'ja', 'ko', 'zh-CN', 'ar', 'he', 'hi']) {
      const feature = generateFeature(doc, { language: lang });
      assert.ok(feature.length > 50, `should generate feature for ${lang}`);
      if (lang !== 'en') {
        assert.ok(feature.startsWith(`# language: ${lang}`), `should have ${lang} header`);
      }
    }
  });

  it('should not include language header for English', () => {
    const content = loadFixture('auth-spec.md');
    const doc = parseSpec(content);
    const feature = generateFeature(doc, { language: 'en' });
    assert.ok(!feature.startsWith('# language:'), 'no language header needed for English');
  });
});
