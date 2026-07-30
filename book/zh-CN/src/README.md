# cucumber-openspec

[![skills.sh](https://skills.sh/b/neurono-ml/cucumber-openspec)](https://skills.sh/neurono-ml/cucumber-openspec)
[![CI/CD](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml/badge.svg)](https://github.com/neurono-ml/cucumber-openspec/actions/workflows/ci.yml)
[![npm](https://img.shields.io/badge/npm-cucumber--openspec-blue)](https://github.com/neurono-ml/cucumber-openspec)

**cucumber-openspec** 将 [OpenSpec](https://github.com/neurono-ml/openspec) 的 `spec.md` 文件转换为确定性的 [Cucumber](https://cucumber.io/) / Gherkin `.feature` 文件。

它使用**零 AI、确定性的 TypeScript 脚本**——一个状态机解析器与生成器——来生成正确的 `.feature` 文件，支持全部 [80 种 Gherkin 语言](features/localization.md)。除了 Node.js 外没有其他运行时依赖。

## 快速开始

```bash
# 为你的 AI 代理安装此技能
npx skills add neurono-ml/cucumber-openspec

# 将项目的规范转换为 Gherkin
npx tsx scripts/index.ts -i ./openspec -o ./features
```

## 功能特性

- **确定性解析器**——状态机，零依赖
- **80 种 Gherkin 语言**——英语、葡萄牙语、简体中文、阿拉伯语、日语等 76 种语言
- **标签**——`@smoke`、`@regression`、`@critical`，支持功能层、规则层和场景层
- **背景（Background）**——通过 `## Background` 章节共享步骤
- **场景大纲 + 示例（Scenario Outline + Examples）**——数据驱动的参数化场景
- **数据表格（DataTables）**——管道表格作为步骤参数
- **文档字符串（Doc Strings）**——子项目符号转换为 `"""` 代码块
- **增量规范（Delta specs）**——ADDED / MODIFIED / REMOVED 章节用于变更管理
- **Gherkin 语法验证**——所有输出通过 `@cucumber/gherkin` 验证
- **本地化**——通过官方 Gherkin 翻译支持 80 种语言的关键词
- **智能体技能**——可通过 `skills.sh` 安装，支持 Claude Code、Cursor、OpenCode、Codex

## 工作原理

```markdown
OpenSpec spec.md                     →   Gherkin .feature
─────────────────────                    ─────────────────
# [@tag] 领域名称                           [@tag]
## Purpose                                功能：领域名称
## Background                               背景：
- **GIVEN** 步骤                            假如 步骤
### [@tag] Requirement: 名称                  [@tag]
#### [@tag] Scenario: 名称                    规则：名称
- **GIVEN** 文本                                [@tag]
  | 列 | 列 |                                场景：名称
- **WHEN** 文本                                 假如 文本
- **THEN** 文本                                    | 列 | 列 |
                                                   当 文本
                                                   那么 文本
```
