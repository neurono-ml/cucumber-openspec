#!/usr/bin/env node
/**
 * openspec-to-gherkin — CLI for converting OpenSpec spec files to Cucumber/Gherkin .feature files.
 *
 * Usage:
 *   npx tsx scripts/index.ts --input <path> [--output <dir>] [--language <code>]
 *
 *   --input, -i    Path to openspec/ directory or a single spec.md file
 *   --output, -o   Output directory for .feature files (default: ./features)
 *   --language, -l Gherkin language code (default: en)
 *   --help, -h     Show this help message
 *
 * Examples:
 *   npx tsx scripts/index.ts -i ./openspec/specs/auth/spec.md -o ./features -l pt
 *   npx tsx scripts/index.ts -i ./openspec -o ./features -l fr
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { walkOpenspec, type WalkResult } from './openspec-walker.js';
import { generateFeature } from './gherkin-generator.js';
import { parseSpec } from './openspec-parser.js';
import { readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): { input: string; output: string; language: string } {
  const args = process.argv.slice(2);
  const result = { input: '', output: 'features', language: 'en' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input': case '-i':
        result.input = args[++i] ?? '';
        break;
      case '--output': case '-o':
        result.output = args[++i] ?? 'features';
        break;
      case '--language': case '-l':
        result.language = args[++i] ?? 'en';
        break;
      case '--help': case '-h':
        printHelp();
        process.exit(0);
    }
  }

  if (!result.input) {
    console.error('Error: --input is required');
    printHelp();
    process.exit(1);
  }

  return result;
}

function printHelp(): void {
  console.log(`
openspec-to-gherkin — Convert OpenSpec specs to Cucumber/Gherkin .feature files

Usage:
  npx tsx scripts/index.ts --input <path> [options]

Options:
  --input, -i    Path to openspec/ directory or a spec.md file  [required]
  --output, -o   Output directory for .feature files   [default: ./features]
  --language, -l Gherkin language code                  [default: en]
  --help, -h     Show this help message

Examples:
  npx tsx scripts/index.ts -i ./openspec -o ./features -l pt
  npx tsx scripts/index.ts -i ./openspec/specs/auth/spec.md -o ./features
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const opts = parseArgs();
  const inputPath = resolve(opts.input);
  const outputDir = resolve(opts.output);
  const stat = statSync(inputPath, { throwIfNoEntry: false });

  if (!stat) {
    console.error(`Error: Path not found: ${inputPath}`);
    process.exit(1);
  }

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  let results: WalkResult[] = [];

  if (stat.isFile()) {
    // Single file mode
    const content = readFileSync(inputPath, 'utf-8');
    const domain = basename(dirname(inputPath));
    const changeName = detectChangeName(inputPath);
    try {
      const doc = parseSpec(content, changeName);
      const outputName = changeName
        ? `${changeName}_${domain}.feature`
        : `${domain}.feature`;
      results = [{ doc, sourcePath: inputPath, outputPath: outputName, domain }];
    } catch (err) {
      console.error(`Error parsing ${inputPath}:`, (err as Error).message);
      process.exit(1);
    }
  } else if (stat.isDirectory()) {
    // Directory mode
    try {
      results = walkOpenspec(inputPath);
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  }

  if (results.length === 0) {
    console.warn('No spec.md files found.');
    return;
  }

  let converted = 0;
  for (const result of results) {
    const featureContent = generateFeature(result.doc, { language: opts.language });
    const outPath = join(outputDir, result.outputPath);

    // Create subdirectories if needed
    mkdirSync(dirname(outPath), { recursive: true });

    writeFileSync(outPath, featureContent, 'utf-8');
    console.log(`✓ ${result.sourcePath}  →  ${outPath}`);
    converted++;
  }

  console.log(`\nConverted ${converted} spec${converted !== 1 ? 's' : ''} to ${opts.language} Gherkin.`);
}

/**
 * Try to detect a change name from a file path.
 * Pattern: .../changes/<change-name>/specs/<domain>/spec.md
 */
function detectChangeName(filePath: string): string | undefined {
  const normalized = filePath.replace(/\\/g, '/');
  const changesMatch = normalized.match(/\/changes\/([^/]+)\/specs\//);
  return changesMatch?.[1];
}

main();
