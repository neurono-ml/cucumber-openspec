# 开发指南

## 项目结构

```
├── scripts/
│   ├── openspec-parser.ts       # 状态机解析器（零依赖）
│   ├── gherkin-generator.ts     # AST → .feature + 本地化
│   ├── gherkin-languages.json   # 80 种 Gherkin 语言翻译
│   ├── openspec-walker.ts       # 目录扫描器
│   ├── index.ts                 # CLI 入口点
│   └── types.ts                 # 共享 TypeScript 接口
├── tests/
│   ├── advanced-features.test.ts # 背景、大纲、数据表格
│   ├── cli.test.ts               # CLI 集成测试
│   ├── features.test.ts          # 文档字符串、增量规范
│   ├── gaps.test.ts              # 间隙覆盖测试
│   ├── generator.test.ts         # 生成器单元测试
│   ├── parser.test.ts            # 解析器单元测试
│   ├── tags-and-validation.test.ts # 标签 + Gherkin 语法验证
│   └── walker.test.ts            # 扫描器/目录测试
├── book/
│   ├── scripts/                  # 文档构建/检查脚本
│   ├── en/                       # 英文 mdBook
│   ├── pt-BR/                    # 葡萄牙文 mdBook
│   └── zh-CN/                    # 简体中文 mdBook
└── fixtures/
    └── tests/fixtures/           # 测试夹具
```

## 运行测试

```bash
# 运行全部 92 个测试
npm test

# 运行带覆盖率
npm run test:coverage

# 运行特定测试文件
npx tsx --test tests/parser.test.ts
```

## 构建文档

```bash
# 构建所有语言文档
npm run docs:build

# 检查跨语言页面一致性
npm run docs:check

# 本地启动某语言文档服务
mdbook serve book/en --open
mdbook serve book/pt-BR --open
mdbook serve book/zh-CN --open
```

## 维护文档

**重要**：所有 3 种语言（英语、葡萄牙语、简体中文）必须保持**相同的页面结构**。添加或删除页面时：

1. 更新所有 3 种语言的 `src/` 目录
2. 更新所有 3 种语言的 `SUMMARY.md` 文件
3. 运行 `npm run docs:check` 验证一致性
4. CI/CD 管道会拒绝破坏一致性的变更

## 代码风格

- TypeScript 使用 `strict` 模式
- 无运行时依赖（核心脚本零依赖）
- 状态机解析器模式，实现确定性解析
- 所有函数为纯函数且可测试
- 使用 `node:test` 作为测试运行器

## 发布流程

1. 确保所有测试通过：`npm test`
2. 确保文档一致性：`npm run docs:check`
3. 构建所有文档：`npm run docs:build`
4. 创建版本标签：`git tag v1.0.0`
5. 推送标签：`git push origin v1.0.0`
6. CI/CD 创建带有发布说明的 GitHub Release
