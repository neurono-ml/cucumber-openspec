# cucumber-openspec

[![skills.sh](https://skills.sh/b/neurono-ml/cucumber-openspec/cucumber-openspec)](https://skills.sh/neurono-ml/cucumber-openspec/cucumber-openspec)
[![CI/CD](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml/badge.svg)](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml)
[![npm](https://img.shields.io/badge/npm-cucumber--openspec-blue)](https://github.com/neurono-ml/cucumber-openspec)

**cucumber-openspec** bridges the two sides of [Behavior-Driven Development](https://cucumber.io/docs/bdd/) (BDD):

- **✍️ Write** behavior specs in [OpenSpec](https://github.com/neurono-ml/openspec) — a simple, human-readable Markdown format that product managers, QA, and developers can all contribute to
- **⚡ Convert** them deterministically into strict Cucumber/Gherkin `.feature` files — with **zero-AI, deterministic TypeScript** (state-machine parser + generator) in any of the [80 Gherkin languages](features/localization.md). No runtime dependencies beyond Node.js.

The result? **One BDD spec, two formats.** Teams write and review in clean Markdown; automation runs the generated Gherkin in Cucumber, SpecFlow, Behave, or any BDD framework.

## Quick Start

```bash
# Install the skill for your AI agent
npx skills add neurono-ml/cucumber-openspec

# Convert a project's specs to Gherkin
npx tsx scripts/index.ts -i ./openspec -o ./features
```

## Features

- **Deterministic parser** — state machine, 0 dependencies
- **80 Gherkin languages** — English, Portuguese, Chinese, Arabic, Japanese, and 76 more
- **Tags** — `@smoke`, `@regression`, `@critical` at Feature, Rule, and Scenario level
- **Background** — shared steps via `## Background` section
- **Scenario Outline + Examples** — data-driven parameterized scenarios
- **DataTables** — pipe tables as step arguments
- **Doc Strings** — sub-bullets converted to `"""` blocks
- **Delta specs** — ADDED / MODIFIED / REMOVED sections for change management
- **Gherkin grammar validation** — all output validated via `@cucumber/gherkin`
- **Localization** — keywords in 80 languages via official Gherkin translations
- **Agent Skill** — installable via `skills.sh`, works with Claude Code, Cursor, OpenCode, Codex

## How It Works

```markdown
OpenSpec spec.md                     →   Gherkin .feature
─────────────────────                    ─────────────────
# [@tag] Domain                           [@tag]
## Purpose                                Feature: Domain
## Background                                Background:
- **GIVEN** step                             Given step
### [@tag] Requirement: Name                  [@tag]
#### [@tag] Scenario: Name                    Rule: Name
- **GIVEN** text                                [@tag]
  | col | col |                                Scenario: Name
- **WHEN** text                                  Given text
- **THEN** text                                    | col | col |
                                                   When text
                                                   Then text
```
