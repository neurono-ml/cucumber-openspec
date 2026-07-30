# 各语言 Cucumber 工具

Cucumber / Gherkin 已被多种语言实现。以下是官方和社区支持的工具。

## 官方 Cucumber 实现

| 语言 | 工具 | 描述 |
|---|---|---|
| **Ruby** | [cucumber-ruby](https://github.com/cucumber/cucumber-ruby) | 最早的 Cucumber 实现。读取 `.feature` 文件并执行用 Ruby 编写的步骤定义。 |
| **Java / JVM** | [cucumber-jvm](https://github.com/cucumber/cucumber-jvm) | 官方 JVM 实现，支持 Java、Kotlin、Scala 和 Groovy。集成了 JUnit、TestNG 和 Spring。 |
| **JavaScript / TypeScript** | [@cucumber/cucumber](https://github.com/cucumber/cucumber-js) | 官方 JS 实现。运行于 Node.js，集成了 Mocha、Jest 和 Playwright。 |
| **Go** | [godog](https://github.com/cucumber/godog) | 官方 Go 实现。使用原生 Go 测试运行器，无外部依赖。 |
| **.NET** | [SpecFlow](https://specflow.org/) | 官方 .NET 实现。集成了 NUnit、xUnit 和 MSTest。支持 C# 和 F#。 |

## 社区实现

| 语言 | 工具 | 描述 |
|---|---|---|
| **Python** | [behave](https://github.com/behave/behave) | 流行的 Python BDD 框架。使用 `environment.py` 提供钩子，支持 `*_steps.py` 步骤定义。 |
| **Python** | [pytest-bdd](https://github.com/pytest-dev/pytest-bdd) | pytest 的 BDD 集成。场景是带有 Gherkin 装饰器的常规 pytest 测试。 |
| **Rust** | [cucumber-rust](https://github.com/cucumber-rs/cucumber) | 原生 Rust Cucumber 实现。支持异步步骤、并行执行和自定义钩子。 |
| **Kotlin** | [kotlin-cucumber](https://github.com/cucumber/cucumber-jvm) | cucumber-jvm 的一部分，提供一流的 Kotlin 支持，包括 lambda 步骤定义。 |
| **PHP** | [Behat](https://github.com/Behat/Behat) | PHP BDD 框架。支持 Symfony、Laravel 和其他 PHP 框架。 |
| **Elixir** | [ex_cucumber](https://github.com/curiosum-dev/ex_cucumber) | Elixir 实现，集成了 Ecto 并支持并行场景执行。 |
| **Scala** | [cucumber-scala](https://github.com/cucumber/cucumber-jvm) | 通过 cucumber-jvm 提供 Scala 支持，集成了 ScalaTest。 |
| **Swift** | [cucumber-swift](https://github.com/typhoon-swift/cucumber-swift) | 原生 Swift 实现，用于 iOS/macOS 测试。 |
| **Dart** | [dart_cucumber](https://pub.dev/packages/dart_cucumber) | Dart/Flutter 实现，用于移动端和 Web 测试。 |

## 生成步骤定义

cucumber-openspec 生成 `.feature` 文件。这些文件需要**步骤定义**（也称为步骤实现）才能在你选择的语言中执行。上述每个工具都提供了自己的步骤定义 API。

cucumber-openspec 内置的 Gherkin 语法验证（通过 `@cucumber/gherkin`）确保生成的 `.feature` 文件对任何 Gherkin 解析器来说都是语法正确的。

## 链接

- [Cucumber 官方文档](https://cucumber.io/docs/)
- [Gherkin 参考](https://cucumber.io/docs/gherkin/reference/)
- [Gherkin 语言支持](https://cucumber.io/docs/gherkin/languages/)
- [Cucumber GitHub 组织](https://github.com/cucumber)
- [cucumber-openspec GitHub](https://github.com/neurono-ml/cucumber-openspec)
