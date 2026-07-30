/**
 * openspec-walker.ts — Scans directories for OpenSpec spec.md files.
 *
 * Handles two directory structures:
 *   1. openspec/specs/<domain>/spec.md           (main specs)
 *   2. openspec/changes/<change>/specs/<domain>/spec.md  (delta specs)
 *
 * Returns a list of OpenSpecDoc instances ready for conversion.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import { parseSpec } from './openspec-parser.js';
import type { OpenSpecDoc } from './types.js';

export interface WalkOptions {
  /** The root directory to scan (e.g., "openspec" or "."). */
  root: string;
  /** Output directory for .feature files. */
  output?: string;
  /** Target Gherkin language code. */
  language?: string;
}

export interface WalkResult {
  /** Parsed OpenSpec document. */
  doc: OpenSpecDoc;
  /** Source file path. */
  sourcePath: string;
  /** Suggested output path (relative to output dir). */
  outputPath: string;
  /** The subdirectory name (domain). */
  domain: string;
}

/**
 * Walk an openspec/ directory tree and find all spec.md files.
 * Returns structured results ready for conversion.
 */
export function walkOpenspec(root: string): WalkResult[] {
  const results: WalkResult[] = [];
  const specsDir = findSpecsDir(root);

  if (!specsDir) {
    throw new Error(
      `No OpenSpec directory found at "${root}". ` +
      'Expected either openspec/specs/<domain>/spec.md or openspec/changes/<change>/specs/<domain>/spec.md'
    );
  }

  collectSpecs(specsDir, results, root);
  return results;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Find the actual specs directory. Prefers "openspec/specs" but also
 * accepts being called directly on a specs directory or a single spec file.
 */
function findSpecsDir(root: string): string | null {
  // If root is a single file, return it directly
  try {
    const rootStat = statSync(root, { throwIfNoEntry: false });
    if (rootStat?.isFile() && basename(root) === 'spec.md') {
      return root;
    }
  } catch {
    // statSync might throw for paths that try to traverse through files
    // fall through to candidate checking
  }

  const candidates = [
    join(root, 'openspec', 'specs'),           // openspec/specs/
    join(root, 'openspec', 'changes'),          // openspec/changes/
    root,                                        // root itself (might be specs/ or a file)
  ];

  for (const candidate of candidates) {
    let stat: ReturnType<typeof statSync> | undefined;
    try {
      stat = statSync(candidate, { throwIfNoEntry: false });
    } catch {
      continue; // skip invalid paths (e.g. file + subdirectory)
    }

    // Is it a file?
    if (stat?.isFile() && basename(candidate) === 'spec.md') {
      return candidate;
    }
    // Is it a directory?
    if (stat?.isDirectory()) {
      if (basename(candidate) === 'changes') {
        return candidate;
      }
      return candidate;
    }
  }

  return null;
}

function collectSpecs(path: string, results: WalkResult[], root: string): void {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) return;

  if (stat.isFile() && basename(path) === 'spec.md') {
    // Single file
    const doc = parseSpecFile(path, root);
    if (doc) results.push(doc);
    return;
  }

  if (!stat.isDirectory()) return;

  // Check if this is a changes/ directory
  const isChangesDir = basename(path) === 'changes';

  // Walk the directory
  const entries = readdirSync(path);
  for (const entry of entries) {
    const fullPath = join(path, entry);
    const entryStat = statSync(fullPath, { throwIfNoEntry: false });
    if (!entryStat) continue;

    if (entryStat.isDirectory()) {
      if (isChangesDir) {
        // changes/<change-name>/specs/<domain>/spec.md
        const specsPath = join(fullPath, 'specs');
        if (statSync(specsPath, { throwIfNoEntry: false })?.isDirectory()) {
          collectSpecs(specsPath, results, root);
        }
      } else {
        // specs/<domain>/spec.md or deeper nesting
        const specPath = join(fullPath, 'spec.md');
        if (statSync(specPath, { throwIfNoEntry: false })?.isFile()) {
          const doc = parseSpecFile(specPath, root);
          if (doc) results.push(doc);
        } else {
          // Recurse
          collectSpecs(fullPath, results, root);
        }
      }
    } else if (entryStat.isFile() && entry === 'spec.md') {
      const doc = parseSpecFile(fullPath, root);
      if (doc) results.push(doc);
    }
  }
}

function parseSpecFile(filePath: string, root: string): WalkResult | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const relPath = relative(root, filePath);

    // Determine change name and domain from path
    const pathParts = relPath.replace(/\\/g, '/').split('/');
    let changeName: string | undefined;
    let domain = '';

    // Path patterns:
    //   openspec/specs/<domain>/spec.md         → domain = <domain>
    //   openspec/changes/<change>/specs/<domain>/spec.md  → domain = <domain>, changeName = <change>
    const changesIdx = pathParts.indexOf('changes');
    const specsIdx = pathParts.indexOf('specs');

    if (changesIdx >= 0 && specsIdx >= 0 && specsIdx === changesIdx + 2) {
      // openspec/changes/<change>/specs/<domain>/spec.md
      changeName = pathParts[changesIdx + 1];
      domain = pathParts[specsIdx + 1] ?? '';
    } else if (specsIdx >= 0) {
      // openspec/specs/<domain>/spec.md
      // Or some other specs/ layout
      domain = pathParts[specsIdx + 1] ?? pathParts[pathParts.length - 2] ?? '';
    } else {
      // Fallback: parent directory name
      domain = basename(dirname(filePath));
    }

    const doc = parseSpec(content, changeName);

    // Create output filename: <change-name>_<domain>.feature or <domain>.feature
    const outputName = changeName
      ? `${changeName}_${domain}.feature`
      : `${domain}.feature`;

    return {
      doc,
      sourcePath: filePath,
      outputPath: outputName,
      domain,
    };
  } catch (err) {
    console.error(`Error parsing ${filePath}:`, (err as Error).message);
    return null;
  }
}
