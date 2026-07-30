# Cucumber Tools by Language

Cucumber / Gherkin is implemented in many languages. Below are the official and community-supported tools.

## Official Cucumber Implementations

| Language | Tool | Description |
|----------|------|-------------|
| **Ruby** | [cucumber-ruby](https://github.com/cucumber/cucumber-ruby) | The original Cucumber implementation. Reads `.feature` files and executes step definitions written in Ruby. |
| **Java / JVM** | [cucumber-jvm](https://github.com/cucumber/cucumber-jvm) | Official JVM implementation supporting Java, Kotlin, Scala, and Groovy. Integrates with JUnit, TestNG, and Spring. |
| **JavaScript / TypeScript** | [@cucumber/cucumber](https://github.com/cucumber/cucumber-js) | Official JS implementation. Runs on Node.js, integrates with Mocha, Jest, and Playwright. |
| **Go** | [godog](https://github.com/cucumber/godog) | Official Go implementation. Uses native Go test runner and has no external dependencies. |
| **.NET** | [SpecFlow](https://specflow.org/) | Official .NET implementation. Integrates with NUnit, xUnit, and MSTest. Supports C# and F#. |

## Community Implementations

| Language | Tool | Description |
|----------|------|-------------|
| **Python** | [behave](https://github.com/behave/behave) | Popular Python BDD framework. Uses `environment.py` for hooks and supports `*_steps.py` for step definitions. |
| **Python** | [pytest-bdd](https://github.com/pytest-dev/pytest-bdd) | BDD integration for pytest. Scenarios are regular pytest tests with Gherkin decorators. |
| **Rust** | [cucumber-rust](https://github.com/cucumber-rs/cucumber) | Native Rust Cucumber implementation. Supports async steps, parallel execution, and custom hooks. |
| **Kotlin** | [kotlin-cucumber](https://github.com/cucumber/cucumber-jvm) | Part of cucumber-jvm with first-class Kotlin support including lambda step definitions. |
| **PHP** | [Behat](https://github.com/Behat/Behat) | PHP BDD framework. Supports Symfony, Laravel, and other PHP frameworks. |
| **Elixir** | [ex_cucumber](https://github.com/curiosum-dev/ex_cucumber) | Elixir implementation with Ecto integration and parallel scenario execution. |
| **Scala** | [cucumber-scala](https://github.com/cucumber/cucumber-jvm) | Scala support via cucumber-jvm with ScalaTest integration. |
| **Swift** | [cucumber-swift](https://github.com/typhoon-swift/cucumber-swift) | Native Swift implementation for iOS/macOS testing. |
| **Dart** | [dart_cucumber](https://pub.dev/packages/dart_cucumber) | Dart/Flutter implementation for mobile and web testing. |

## Generating Step Definitions

cucumber-openspec generates `.feature` files. These files need **step definitions** (also called step implementations) in your chosen language to be executable. Each tool above provides its own step definition API.

The Gherkin grammar validation built into cucumber-openspec (via `@cucumber/gherkin`) ensures the generated `.feature` files are syntactically correct for any Gherkin parser.

## Links

- [Cucumber Official Documentation](https://cucumber.io/docs/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [Gherkin Languages](https://cucumber.io/docs/gherkin/languages/)
- [Cucumber GitHub Organization](https://github.com/cucumber)
- [cucumber-openspec GitHub](https://github.com/neurono-ml/cucumber-openspec)
