# Uso

## Referência da CLI

```bash
npx tsx scripts/index.ts [opções]
```

### Opções

| Flag | Alias | Descrição | Padrão |
|------|-------|-----------|--------|
| `--input` | `-i` | Caminho para o arquivo de especificação ou diretório openspec | **(obrigatório)** |
| `--output` | `-o` | Diretório de saída para arquivos `.feature` | `./features` |
| `--language` | `-l` | Código do idioma Gherkin | `en` |

### Caminhos de Saída

| Entrada | Saída |
|---|---|
| `openspec/specs/auth/spec.md` | `features/auth.feature` |
| `openspec/changes/add-auth/specs/auth/spec.md` | `features/add-auth_auth.feature` |

## Exemplos

### Converter um único arquivo de especificação

```bash
npx tsx scripts/index.ts -i openspec/specs/auth/spec.md -o features
```

Gera `features/auth.feature`.

### Converter um diretório OpenSpec inteiro

```bash
npx tsx scripts/index.ts -i ./openspec -o ./features
```

Percorre `openspec/specs/<dominio>/spec.md` e todos os arquivos `openspec/changes/<mudanca>/specs/<dominio>/spec.md`.

### Converter para um idioma diferente

```bash
# Português
npx tsx scripts/index.ts -i ./openspec -o ./features -l pt

# Chinês Simplificado
npx tsx scripts/index.ts -i ./openspec -o ./features -l zh-CN

# Árabe (direita para esquerda)
npx tsx scripts/index.ts -i ./openspec -o ./features -l ar
```

### Converter uma delta change

```bash
npx tsx scripts/index.ts -i openspec/changes/add-auth/specs/auth/spec.md -o features
```

Isso gera `features/add-auth_auth.feature` com anotações de ADICIONADO/MODIFICADO/REMOVIDO.

## Estrutura do Diretório de Trabalho

```
projeto/
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
└── features/              # ← gerado
    ├── auth.feature
    ├── billing.feature
    └── add-auth_auth.feature
```
