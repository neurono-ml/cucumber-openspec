# cucumber-openspec

[![skills.sh](https://skills.sh/b/neurono-ml/cucumber-openspec)](https://skills.sh/neurono-ml/cucumber-openspec)
[![CI/CD](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml/badge.svg)](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml)
[![npm](https://img.shields.io/badge/npm-cucumber--openspec-blue)](https://github.com/neurono-ml/cucumber-openspec)

**cucumber-openspec** converte arquivos [OpenSpec](https://github.com/neurono-ml/openspec) `spec.md` em arquivos `.feature` [Cucumber](https://cucumber.io/) / Gherkin determinísticos.

Ele usa **scripts TypeScript determinísticos sem IA** — um parser de máquina de estados + gerador — para produzir arquivos `.feature` corretos em qualquer um dos [80 idiomas Gherkin](features/localization.md). Nenhuma dependência em tempo de execução além do Node.js.

## Início Rápido

```bash
# Instale a skill para seu agente de IA
npx skills add neurono-ml/cucumber-openspec

# Converta as especificações de um projeto para Gherkin
npx tsx scripts/index.ts -i ./openspec -o ./features
```

## Funcionalidades

- **Parser determinístico** — máquina de estados, 0 dependências
- **80 idiomas Gherkin** — português, inglês, chinês, árabe, japonês e mais 76
- **Tags** — `@smoke`, `@regression`, `@critical` nos níveis Funcionalidade, Regra e Cenário
- **Background** — etapas compartilhadas via seção `## Background`
- **Scenario Outline + Examples** — cenários parametrizados orientados a dados
- **DataTables** — tabelas pipe como argumentos de etapas
- **Doc Strings** — sub-itens convertidos em blocos `"""`
- **Delta specs** — seções ADICIONADO / MODIFICADO / REMOVIDO para gestão de mudanças
- **Validação gramatical Gherkin** — toda saída validada via `@cucumber/gherkin`
- **Localização** — palavras-chave em 80 idiomas via traduções oficiais do Gherkin
- **Skill para Agente** — instalável via `skills.sh`, compatível com Claude Code, Cursor, OpenCode, Codex

## Como Funciona

```markdown
OpenSpec spec.md                     →   Gherkin .feature
─────────────────────                    ─────────────────
# [@tag] Domínio                        [@tag]
## Propósito                            Funcionalidade: Domínio
## Background                              Background:
- **DADO** etapa                           Dado etapa
### [@tag] Requisito: Nome                  [@tag]
#### [@tag] Cenário: Nome                  Regra: Nome
- **DADO** texto                              [@tag]
  | col | col |                              Cenário: Nome
- **QUANDO** texto                            Dado texto
- **ENTÃO** texto                              | col | col |
                                                Quando texto
                                                Então texto
```
