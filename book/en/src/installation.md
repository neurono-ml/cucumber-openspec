# Installation

## As an Agent Skill (recommended)

Install via [skills.sh](https://skills.sh/neurono-ml/cucumber-openspec) for any SKILL.md-compatible agent:

```bash
npx skills add neurono-ml/cucumber-openspec
```

This works with:

| Platform | Skill Directory |
|---|---|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `~/.claude/skills/` |
| [Cursor](https://cursor.sh/) | `~/.cursor/skills/` |
| [OpenCode](https://github.com/opencode-ai) | `~/.config/opencode/skills/` |
| [Codex](https://github.com/openai/codex) | `~/.agents/skills/` |

After installation, the skill is available on your next conversation turn.

## From GitHub (manual clone)

```bash
git clone https://github.com/neurono-ml/cucumber-openspec.git ~/.agents/skills/cucumber-openspec
```

## Using npm / npx (direct usage)

No global install is required. The project uses `npx tsx` to run TypeScript directly:

```bash
# Clone the repo
git clone https://github.com/neurono-ml/cucumber-openspec.git
cd cucumber-openspec

# Install dependencies
npm ci

# Use it
npx tsx scripts/index.ts -i ./openspec -o ./features
```

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 18 | Required for running the scripts |
| [npm](https://npmjs.com/) | ≥ 9 | Ships with Node.js |
| [mdBook](https://rust-lang.github.io/mdBook/) | ≥ 0.5 | Only needed to build documentation |
