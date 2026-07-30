# Instalação

## Como Skill para Agente (recomendado)

Instale via [skills.sh](https://skills.sh/neurono-ml/cucumber-openspec) para qualquer agente compatível com SKILL.md:

```bash
npx skills add neurono-ml/cucumber-openspec
```

Funciona com:

| Plataforma | Diretório da Skill |
|---|---|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `~/.claude/skills/` |
| [Cursor](https://cursor.sh/) | `~/.cursor/skills/` |
| [OpenCode](https://github.com/opencode-ai) | `~/.config/opencode/skills/` |
| [Codex](https://github.com/openai/codex) | `~/.agents/skills/` |

Após a instalação, a skill estará disponível na sua próxima conversa.

## Pelo GitHub (clone manual)

```bash
git clone https://github.com/neurono-ml/cucumber-openspec.git ~/.agents/skills/cucumber-openspec
```

## Usando npm / npx (uso direto)

Nenhuma instalação global é necessária. O projeto usa `npx tsx` para executar TypeScript diretamente:

```bash
# Clone o repositório
git clone https://github.com/neurono-ml/cucumber-openspec.git
cd cucumber-openspec

# Instale as dependências
npm ci

# Use
npx tsx scripts/index.ts -i ./openspec -o ./features
```

## Pré-requisitos

| Requisito | Versão | Observações |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 18 | Necessário para executar os scripts |
| [npm](https://npmjs.com/) | ≥ 9 | Acompanha o Node.js |
| [mdBook](https://rust-lang.github.io/mdBook/) | ≥ 0.5 | Necessário apenas para construir a documentação |
