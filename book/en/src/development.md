# Development

## Project Structure

```
├── scripts/
│   ├── openspec-parser.ts       # State-machine parser (0 deps)
│   ├── gherkin-generator.ts     # AST → .feature with localization
│   ├── gherkin-languages.json   # 80 Gherkin language translations
│   ├── openspec-walker.ts       # Directory scanner
│   ├── index.ts                 # CLI entry point
│   └── types.ts                 # Shared TypeScript interfaces
├── tests/
│   ├── advanced-features.test.ts # Background, Outline, DataTables
│   ├── cli.test.ts               # CLI integration tests
│   ├── features.test.ts          # Doc Strings, delta specs
│   ├── gaps.test.ts              # Gap coverage tests
│   ├── generator.test.ts         # Generator unit tests
│   ├── parser.test.ts            # Parser unit tests
│   ├── tags-and-validation.test.ts # Tags + Gherkin grammar validation
│   └── walker.test.ts            # Walker/directory tests
├── book/
│   ├── scripts/                  # Doc build/check scripts
│   ├── en/                       # English mdBook
│   ├── pt-BR/                    # Portuguese mdBook
│   └── zh-CN/                    # Simplified Chinese mdBook
└── fixtures/
    └── tests/fixtures/           # Test fixtures
```

## Running Tests

```bash
# Run all 92 tests
npm test

# Run with coverage
npm run test:coverage

# Run a specific test file
npx tsx --test tests/parser.test.ts
```

## Building Documentation

```bash
# Build all language books
npm run docs:build

# Check page parity across languages
npm run docs:check

# Serve a language book locally
mdbook serve book/en --open
mdbook serve book/pt-BR --open
mdbook serve book/zh-CN --open
```

## Maintaining Documentation

**IMPORTANT**: All 3 languages (English, Portuguese, Simplified Chinese) must maintain **identical page structure**. When adding or removing a page:

1. Update all 3 language `src/` directories
2. Update all 3 `SUMMARY.md` files
3. Run `npm run docs:check` to verify parity
4. The CI/CD pipeline will reject changes that break parity

## Code Style

- TypeScript with `strict` mode
- No runtime dependencies (zero deps for the core scripts)
- State-machine parser pattern for deterministic parsing
- All functions are pure and testable
- Use `node:test` for the test runner

## Release Process

1. Ensure all tests pass: `npm test`
2. Ensure documentation parity: `npm run docs:check`
3. Build all docs: `npm run docs:build`
4. Create a version tag: `git tag v1.0.0`
5. Push the tag: `git push origin v1.0.0`
6. CI/CD creates a GitHub Release with release notes
