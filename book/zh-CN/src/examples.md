# 示例

## 示例 1：基本认证规范

**输入**（`openspec/specs/auth/spec.md`）：
```markdown
# @smoke 认证规范
## Purpose
平台的认证系统。

### Requirement: 登录
#### Scenario: 成功登录
- **GIVEN** 已注册的有效凭据用户
- **WHEN** 提交邮箱和密码
- **THEN** 收到 JWT 令牌
- **AND** 令牌在 3600 秒后过期

#### Scenario: 登录失败
- **GIVEN** 已注册的用户
- **WHEN** 提交错误密码
- **THEN** 收到 401 错误
- **AND** 错误消息显示"无效凭据"
```

**输出**（`features/auth.feature`）：
```gherkin
@smoke
功能：认证

  平台的认证系统。

  规则：登录

    场景：成功登录
      假如 已注册的有效凭据用户
      当 提交邮箱和密码
      那么 收到 JWT 令牌
      并且 令牌在 3600 秒后过期

    场景：登录失败
      假如 已注册的用户
      当 提交错误密码
      那么 收到 401 错误
      并且 错误消息显示"无效凭据"
```

## 示例 2：背景 + 标签 + 数据表格

**输入**（`openspec/specs/admin/spec.md`）：
```markdown
# @regression 管理规范
## Purpose
管理后台访问控制。

## Background
- **GIVEN** 已认证的管理员用户
- **AND** 用户拥有管理员权限

### @critical Requirement: 用户管理
#### Scenario Outline: 管理用户
- **GIVEN** 用户管理页面
- **WHEN** 执行 <action> 操作
- **THEN** 系统 <result>

##### Examples:
| action     | result              |
| 创建       | 创建新用户           |
| 停用       | 停用该用户           |
| 删除       | 移除该用户           |

#### Scenario: 批量导入
- **GIVEN** 需要导入以下用户：
  | 姓名  | 邮箱             | 角色   |
  | Alice | alice@example.com | admin  |
  | Bob   | bob@example.com   | viewer |
- **WHEN** 执行批量导入
- **THEN** 所有用户被创建
- **AND** 生成导入日志
```

**输出**（`features/admin.feature`）：
```gherkin
@regression
功能：管理

  管理后台访问控制。

  背景：
    假如 已认证的管理员用户
    并且 用户拥有管理员权限

  @critical
  规则：用户管理

    场景大纲：管理用户
      假如 用户管理页面
      当 执行 <action> 操作
      那么 系统 <result>

      示例：
        | action | result      |
        | 创建   | 创建新用户   |
        | 停用   | 停用该用户   |
        | 删除   | 移除该用户   |

    场景：批量导入
      假如 需要导入以下用户：
        | 姓名  | 邮箱             | 角色   |
        | Alice | alice@example.com | admin  |
        | Bob   | bob@example.com   | viewer |
      当 执行批量导入
      那么 所有用户被创建
      并且 生成导入日志
```

## 示例 3：增量变更规范

**输入**（`openspec/changes/add-biometric/specs/auth/spec.md`）：
```markdown
# 认证规范
## Purpose
更新后的认证系统。

## ADDED Requirements
### Requirement: 生物识别登录
#### Scenario: 指纹认证
- **GIVEN** 已注册的指纹
- **WHEN** 用户扫描指纹
- **THEN** 授予访问权限

## REMOVED Requirements
### Requirement: 短信验证码
已弃用，改用生物识别认证。
```

**输出**（`features/add-biometric_auth.feature`）：
```gherkin
功能：认证

  更新后的认证系统。

  规则：生物识别登录

    场景：指纹认证
      # ADDED
      假如 已注册的指纹
      当 用户扫描指纹
      那么 授予访问权限

  规则：短信验证码
    已弃用，改用生物识别认证。
    # REMOVED：短信验证码——已弃用，改用生物识别认证。
```

## 示例 4：简体中文本地化

```bash
npx tsx scripts/index.ts -i ./openspec -o ./features -l zh-CN
```

```gherkin
# language: zh-CN
功能：认证

  背景：
    假如 用户已登录

  规则：登录
    场景：成功登录
      假如 已注册的有效凭据用户
      当 提交邮箱和密码
      那么 收到 JWT 令牌
```

## 示例 5：无 GIVEN 的场景

OpenSpec 支持以 WHEN 开头的场景：

```markdown
#### Scenario: 健康检查
- **WHEN** 调用健康检查端点
- **THEN** 响应状态为 200
```

生成有效的 Gherkin：

```gherkin
    场景：健康检查
      当 调用健康检查端点
      那么 响应状态为 200
```
