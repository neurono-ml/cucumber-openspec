# Usage

## CLI Reference

```bash
npx tsx scripts/index.ts [options]
```

### Options

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--input` | `-i` | Path to spec file or openspec directory | **(required)** |
| `--output` | `-o` | Output directory for `.feature` files | `./features` |
| `--language` | `-l` | Gherkin language code | `en` |

### Output Paths

| Input | Output |
|---|---|
| `openspec/specs/auth/spec.md` | `features/auth.feature` |
| `openspec/changes/add-auth/specs/auth/spec.md` | `features/add-auth_auth.feature` |

## Examples

### Convert a single spec file

```bash
npx tsx scripts/index.ts -i openspec/specs/auth/spec.md -o features
```

Generates `features/auth.feature`.

### Convert an entire OpenSpec directory

```bash
npx tsx scripts/index.ts -i ./openspec -o ./features
```

Walks `openspec/specs/<domain>/spec.md` and all `openspec/changes/<change>/specs/<domain>/spec.md` files.

### Convert to a different language

```bash
# Portuguese
npx tsx scripts/index.ts -i ./openspec -o ./features -l pt

# Simplified Chinese
npx tsx scripts/index.ts -i ./openspec -o ./features -l zh-CN

# Arabic (right-to-left)
npx tsx scripts/index.ts -i ./openspec -o ./features -l ar
```

### Convert a delta change

```bash
npx tsx scripts/index.ts -i openspec/changes/add-auth/specs/auth/spec.md -o features
```

This generates `features/add-auth_auth.feature` with ADDED/MODIFIED/REMOVED annotations.

## Working Directory Structure

```
project/
├── openspec/
│   ├── specs/
│   │   ├── auth/
│   │   │   └── spec.md
│   │   └── billing/
│   │       └── spec.md
│   └── changes/
│       └── add-auth/
│           └── specs/
│               └── auth/
│                   └── spec.md
└── features/              # ← generated
    ├── auth.feature
    ├── billing.feature
    └── add-auth_auth.feature
```
