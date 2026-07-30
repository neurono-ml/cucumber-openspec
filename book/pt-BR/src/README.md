# cucumber-openspec

<p align="center">
  <a href="https://neurono-ml.github.io/cucumber-openspec/en/"><img src="https://img.shields.io/badge/EN-English-blue?style=for-the-badge" alt="English"></a>
  <a href="https://neurono-ml.github.io/cucumber-openspec/pt-BR/"><img src="https://img.shields.io/badge/PT--BR-Portugu%C3%AAs-green?style=for-the-badge" alt="Português"></a>
  <a href="https://neurono-ml.github.io/cucumber-openspec/zh-CN/"><img src="https://img.shields.io/badge/ZH--CN-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-red?style=for-the-badge" alt="简体中文"></a>
</p>

[![skills.sh](https://skills.sh/b/neurono-ml/cucumber-openspec/cucumber-openspec)](https://skills.sh/neurono-ml/cucumber-openspec/cucumber-openspec)
[![CI/CD](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml/badge.svg)](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml)
[![npm](https://img.shields.io/badge/npm-cucumber--openspec-blue)](https://github.com/neurono-ml/cucumber-openspec)

**cucumber-openspec** conecta os dois lados do [Behavior-Driven Development](https://cucumber.io/docs/bdd/) (BDD):

- **🖊️ Escreva** especificações de comportamento em [OpenSpec](https://github.com/neurono-ml/openspec) — um formato Markdown simples e legível que product managers, QA e desenvolvedores podem usar juntos
- **⚡ Converta** deterministicamente em arquivos `.feature` [Cucumber](https://cucumber.io/)/Gherkin válidos — com **scripts TypeScript determinísticos sem IA** (parser de máquina de estados + gerador) em qualquer um dos [80 idiomas Gherkin](features/localization.md). Nenhuma dependência em tempo de execução além do Node.js.

O resultado? **Uma especificação BDD, dois formatos.** Equipes escrevem e revisam em Markdown limpo; a automação executa o Gherkin gerado no Cucumber, SpecFlow, Behave ou qualquer framework BDD.

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
