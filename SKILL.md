---
name: cucumber-openspec
description: >
  Converts OpenSpec specs (spec.md files from openspec/specs/<domain>/ and
  openspec/changes/<change>/specs/<domain>/) into deterministic Cucumber/Gherkin
  .feature files. Supports all 80 Gherkin languages. Use when the user asks to
  translate, convert, or migrate OpenSpec behavior specs to Gherkin/Cucumber
  format, or when generating .feature files from existing .opespec/ specs.
license: MIT
metadata:
  version: "1.1.0"
  languages: "80 Gherkin languages supported"
---

# cucumber-openspec

Converts OpenSpec `spec.md` files (Given/When/Then in Markdown bullet points)
into strict Cucumber/Gherkin `.feature` files with proper localized keywords,
Doc Strings for sub-bullets, tags, Background, Scenario Outline + Examples,
DataTables, and delta section support.

## When to use

- User mentions "convert openspec to cucumber", "generate .feature files",
  "translate specs to gherkin", or similar
- User asks to create Gherkin feature files from an existing `openspec/` directory
- User needs localized .feature files in a specific language

## How it works

The skill uses **deterministic TypeScript scripts** (no AI dependency) to parse
and convert specs:

```
OpenSpec spec.md                     Gherkin .feature
─────────────────────                ─────────────────
# [@tag] Domain Specification        [@tag]
                                     Feature: Domain
## Purpose                           free-form description
## Background                        Background:
- **GIVEN** shared step                Given shared step
### [@tag] Requirement: Name    →   [@tag]
                                     Rule: Name
#### [@tag] Scenario: Name           [@tag]
- **GIVEN** text (with table)        Scenario: Name
  | col | col |                       Given text (localized)
- **WHEN** text                        | col | col |
- **THEN** text                       When text (localized)
  - sub-item                          Then text (localized)
                                       """ Doc String """
#### Scenario Outline: Name           Scenario Outline: Name
- **GIVEN** <var>                     Given <var>
##### Examples:                      Examples:
| var | result |                      | var | result |
| a   | pass   |                      | a   | pass   |
## ADDED Requirements                Rule + # ADDED comment
## MODIFIED Requirements             Rule + # MODIFIED note
## REMOVED Requirements              Rule + removal body text
```

### Feature-level tags

Tags are parsed from `# @tag1 @tag2 Domain Name` and rendered on the line
before `Feature:`:

```gherkin
@smoke @regression
Feature: Auth
```

### Background steps

`## Background` at the spec level renders as a `Background:` block after the
Feature description and before any Rules/Scenarios. Background steps use the
same `- **GIVEN** text` syntax.

### Scenario Outline + Examples

Use `#### Scenario Outline: Name` for parameterized scenarios, followed by
`##### Examples:` with a pipe table:

```markdown
#### Scenario Outline: Login with roles
- **GIVEN** user <role>
- **WHEN** login
- **THEN** <status>

##### Examples:
| role  | status  |
| admin | success |
| guest | denied  |
```

### DataTables (pipe tables under steps)

Pipe tables indented under a step are rendered as Gherkin DataTables:

```markdown
- **GIVEN** the following users exist:
  | name  | role  |
  | Alice | admin |
  | Bob   | guest |
```

## Usage

```bash
# Convert a single spec file
npx tsx scripts/index.ts -i openspec/specs/auth/spec.md -o features

# Convert an entire openspec/ directory
npx tsx scripts/index.ts -i ./openspec -o ./features

# Convert to Portuguese (keywords localized)
npx tsx scripts/index.ts -i ./openspec -o ./features -l pt

# Convert a delta change spec
npx tsx scripts/index.ts -i openspec/changes/add-auth/specs/auth/spec.md -o features
```

### Output paths

| Input | Output |
|---|---|
| `openspec/specs/auth/spec.md` | `features/auth.feature` |
| `openspec/changes/add-auth/specs/auth/spec.md` | `features/add-auth_auth.feature` |

### Options

| Flag | Description | Default |
|---|---|---|
| `-i, --input` | Path to openspec dir or spec.md file | **(required)** |
| `-o, --output` | Output directory | `./features` |
| `-l, --language` | Gherkin language code | `en` |

## Supported languages

All **80 Gherkin languages** are supported out of the box, including:
`en`, `pt`, `fr`, `de`, `es`, `it`, `nl`, `ru`, `ja`, `ko`, `zh-CN`, `zh-TW`,
`ar`, `he`, `fa`, `ur` (RTL), and many more.

The `# language: <code>` header is automatically added for non-English output.
Keywords are translated using the official Gherkin language data.

## Script reference

| File | Purpose |
|---|---|
| `scripts/openspec-parser.ts` | Deterministic state-machine parser (0 deps) |
| `scripts/gherkin-generator.ts` | AST → .feature with keyword localization |
| `scripts/openspec-walker.ts` | Directory scanning for openspec/ layouts |
| `scripts/index.ts` | CLI entry point |
| `scripts/gherkin-languages.json` | Official Gherkin keyword translations (80 langs) |
| `scripts/types.ts` | Shared TypeScript interfaces |

## Edge cases handled

- **No Purpose section**: Feature description omitted, valid Gherkin generated
- **Scenario without GIVEN**: Starts with WHEN — valid in OpenSpec, valid in Gherkin
- **Sub-bullets under steps**: Converted to Gherkin Doc Strings (`"""`)
- **Inline code**: Preserved as-is in step text
- **Delta specs** (ADDED/MODIFIED/REMOVED): Properly parsed and annotated
- **Non-ASCII languages**: Arabic, Hebrew, Japanese, Chinese, Korean, etc.
- **Multiple domains**: All requirements and scenarios from the spec are included
- **RTL languages**: Language header ensures correct parser behavior
- **Feature-level tags**: `@smoke @regression` on `# Domain` line
- **Scenario Outline + Examples**: Parameterized scenarios with data tables
- **DataTables**: Pipe tables as step arguments
- **Background**: Shared steps at the spec level
- **Gherkin grammar validation**: Using official `@cucumber/gherkin` parser
- **Markdown table separators**: `|---|---|` rows are skipped in Examples

## Testing

```bash
# Run all tests (92 tests, 15 suites)
npx tsx --test tests/*.test.ts

# With coverage
node --experimental-test-coverage --test tests/*.test.ts
```
