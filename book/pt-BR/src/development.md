# Desenvolvimento

## Estrutura do Projeto

```
├── scripts/
│   ├── openspec-parser.ts       # Parser de máquina de estados (0 deps)
│   ├── gherkin-generator.ts     # AST → .feature com localização
│   ├── gherkin-languages.json   # 80 traduções de idiomas Gherkin
│   ├── openspec-walker.ts       # Scanner de diretórios
│   ├── index.ts                 # Ponto de entrada da CLI
│   └── types.ts                 # Interfaces TypeScript compartilhadas
├── tests/
│   ├── advanced-features.test.ts # Background, Outline, DataTables
│   ├── cli.test.ts               # Testes de integração da CLI
│   ├── features.test.ts          # Doc Strings, delta specs
│   ├── gaps.test.ts              # Testes de cobertura de lacunas
│   ├── generator.test.ts         # Testes unitários do gerador
│   ├── parser.test.ts            # Testes unitários do parser
│   ├── tags-and-validation.test.ts # Tags + validação gramatical Gherkin
│   └── walker.test.ts            # Testes do walker/diretório
├── book/
│   ├── scripts/                  # Scripts de construção/verificação de docs
│   ├── en/                       # mdBook em inglês
│   ├── pt-BR/                    # mdBook em português
│   └── zh-CN/                    # mdBook em chinês simplificado
└── fixtures/
    └── tests/fixtures/           # Fixtures de teste
```

## Executando Testes

```bash
# Execute todos os 92 testes
npm test

# Execute com cobertura
npm run test:coverage

# Execute um arquivo de teste específico
npx tsx --test tests/parser.test.ts
```

## Construindo a Documentação

```bash
# Construa todos os livros de idiomas
npm run docs:build

# Verifique a paridade de páginas entre idiomas
npm run docs:check

# Sirva um livro de idiomas localmente
mdbook serve book/en --open
mdbook serve book/pt-BR --open
mdbook serve book/zh-CN --open
```

## Mantendo a Documentação

**IMPORTANTE**: Todos os 3 idiomas (inglês, português, chinês simplificado) devem manter **estrutura de páginas idêntica**. Ao adicionar ou remover uma página:

1. Atualize os 3 diretórios `src/` de idiomas
2. Atualize os 3 arquivos `SUMMARY.md`
3. Execute `npm run docs:check` para verificar a paridade
4. O pipeline CI/CD rejeitará alterações que quebrem a paridade

## Estilo de Código

- TypeScript com modo `strict`
- Sem dependências em tempo de execução (zero deps para os scripts principais)
- Padrão de parser de máquina de estados para análise determinística
- Todas as funções são puras e testáveis
- Use `node:test` para o executor de testes

## Processo de Release

1. Garanta que todos os testes passem: `npm test`
2. Garanta a paridade da documentação: `npm run docs:check`
3. Construa toda a documentação: `npm run docs:build`
4. Crie uma tag de versão: `git tag v1.0.0`
5. Envie a tag: `git push origin v1.0.0`
6. CI/CD cria um GitHub Release com notas de versão
