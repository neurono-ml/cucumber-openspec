# 安装

## 作为智能体技能安装（推荐）

通过 [skills.sh](https://skills.sh/neurono-ml/cucumber-openspec) 为任何兼容 SKILL.md 的智能体安装：

```bash
npx skills add neurono-ml/cucumber-openspec
```

支持以下平台：

| 平台 | 技能目录 |
|---|---|
| [Claude Code](https://docs.anthropic.com/en/docs/claude-code) | `~/.claude/skills/` |
| [Cursor](https://cursor.sh/) | `~/.cursor/skills/` |
| [OpenCode](https://github.com/opencode-ai) | `~/.config/opencode/skills/` |
| [Codex](https://github.com/openai/codex) | `~/.agents/skills/` |

安装后，下次对话时即可使用该技能。

## 从 GitHub 克隆（手动方式）

```bash
git clone https://github.com/neurono-ml/cucumber-openspec.git ~/.agents/skills/cucumber-openspec
```

## 使用 npm / npx（直接使用）

无需全局安装。项目使用 `npx tsx` 直接运行 TypeScript：

```bash
# 克隆仓库
git clone https://github.com/neurono-ml/cucumber-openspec.git
cd cucumber-openspec

# 安装依赖
npm ci

# 使用
npx tsx scripts/index.ts -i ./openspec -o ./features
```

## 系统要求

| 需求 | 版本 | 说明 |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 18 | 运行脚本所需 |
| [npm](https://npmjs.com/) | ≥ 9 | 随 Node.js 安装 |
| [mdBook](https://rust-lang.github.io/mdBook/) | ≥ 0.5 | 仅构建文档时需要 |
