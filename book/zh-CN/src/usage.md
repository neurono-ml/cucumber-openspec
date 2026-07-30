# 使用方法

## CLI 参考

```bash
npx tsx scripts/index.ts [options]
```

### 选项

| 标志 | 别名 | 描述 | 默认值 |
|---|---|---|---|
| `--input` | `-i` | 规范文件或 openspec 目录的路径 | **（必填）** |
| `--output` | `-o` | `.feature` 文件的输出目录 | `./features` |
| `--language` | `-l` | Gherkin 语言代码 | `en` |

### 输出路径

| 输入 | 输出 |
|---|---|
| `openspec/specs/auth/spec.md` | `features/auth.feature` |
| `openspec/changes/add-auth/specs/auth/spec.md` | `features/add-auth_auth.feature` |

## 示例

### 转换单个规范文件

```bash
npx tsx scripts/index.ts -i openspec/specs/auth/spec.md -o features
```

生成 `features/auth.feature`。

### 转换整个 OpenSpec 目录

```bash
npx tsx scripts/index.ts -i ./openspec -o ./features
```

遍历 `openspec/specs/<domain>/spec.md` 以及所有 `openspec/changes/<change>/specs/<domain>/spec.md` 文件。

### 转换为其他语言

```bash
# 葡萄牙语
npx tsx scripts/index.ts -i ./openspec -o ./features -l pt

# 简体中文
npx tsx scripts/index.ts -i ./openspec -o ./features -l zh-CN

# 阿拉伯语（从右到左）
npx tsx scripts/index.ts -i ./openspec -o ./features -l ar
```

### 转换增量变更

```bash
npx tsx scripts/index.ts -i openspec/changes/add-auth/specs/auth/spec.md -o features
```

生成带有 ADDED/MODIFIED/REMOVED 注释的 `features/add-auth_auth.feature`。

## 工作目录结构

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
└── features/              # ← 生成目录
    ├── auth.feature
    ├── billing.feature
    └── add-auth_auth.feature
```
