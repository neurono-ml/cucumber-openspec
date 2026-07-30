# Ferramentas Cucumber por Linguagem

Cucumber / Gherkin é implementado em muitas linguagens. Abaixo estão as ferramentas oficiais e apoiadas pela comunidade.

## Implementações Oficiais do Cucumber

| Linguagem | Ferramenta | Descrição |
|---|---|---|
| **Ruby** | [cucumber-ruby](https://github.com/cucumber/cucumber-ruby) | A implementação original do Cucumber. Lê arquivos `.feature` e executa definições de etapas escritas em Ruby. |
| **Java / JVM** | [cucumber-jvm](https://github.com/cucumber/cucumber-jvm) | Implementação oficial para JVM compatível com Java, Kotlin, Scala e Groovy. Integra-se com JUnit, TestNG e Spring. |
| **JavaScript / TypeScript** | [@cucumber/cucumber](https://github.com/cucumber/cucumber-js) | Implementação oficial JS. Executa em Node.js, integra-se com Mocha, Jest e Playwright. |
| **Go** | [godog](https://github.com/cucumber/godog) | Implementação oficial para Go. Usa o executor de testes nativo do Go e não tem dependências externas. |
| **.NET** | [SpecFlow](https://specflow.org/) | Implementação oficial para .NET. Integra-se com NUnit, xUnit e MSTest. Suporta C# e F#. |

## Implementações da Comunidade

| Linguagem | Ferramenta | Descrição |
|---|---|---|
| **Python** | [behave](https://github.com/behave/behave) | Framework BDD popular em Python. Usa `environment.py` para hooks e suporta `*_steps.py` para definições de etapas. |
| **Python** | [pytest-bdd](https://github.com/pytest-dev/pytest-bdd) | Integração BDD para pytest. Cenários são testes pytest regulares com decoradores Gherkin. |
| **Rust** | [cucumber-rust](https://github.com/cucumber-rs/cucumber) | Implementação nativa em Rust para Cucumber. Suporta etapas assíncronas, execução paralela e hooks personalizados. |
| **Kotlin** | [kotlin-cucumber](https://github.com/cucumber/cucumber-jvm) | Parte do cucumber-jvm com suporte de primeira classe para Kotlin, incluindo definições de etapas lambda. |
| **PHP** | [Behat](https://github.com/Behat/Behat) | Framework BDD para PHP. Suporta Symfony, Laravel e outros frameworks PHP. |
| **Elixir** | [ex_cucumber](https://github.com/curiosum-dev/ex_cucumber) | Implementação em Elixir com integração Ecto e execução paralela de cenários. |
| **Scala** | [cucumber-scala](https://github.com/cucumber/cucumber-jvm) | Suporte a Scala via cucumber-jvm com integração ScalaTest. |
| **Swift** | [cucumber-swift](https://github.com/typhoon-swift/cucumber-swift) | Implementação nativa em Swift para testes iOS/macOS. |
| **Dart** | [dart_cucumber](https://pub.dev/packages/dart_cucumber) | Implementação em Dart/Flutter para testes mobile e web. |

## Gerando Definições de Etapas

O cucumber-openspec gera arquivos `.feature`. Esses arquivos precisam de **definições de etapas** (também chamadas de implementações de etapas) na linguagem escolhida para serem executáveis. Cada ferramenta acima fornece sua própria API de definição de etapas.

A validação gramatical Gherkin incorporada no cucumber-openspec (via `@cucumber/gherkin`) garante que os arquivos `.feature` gerados estejam sintaticamente corretos para qualquer parser Gherkin.

## Links

- [Documentação Oficial do Cucumber](https://cucumber.io/docs/)
- [Referência Gherkin](https://cucumber.io/docs/gherkin/reference/)
- [Idiomas Gherkin](https://cucumber.io/docs/gherkin/languages/)
- [Organização Cucumber no GitHub](https://github.com/cucumber)
- [cucumber-openspec no GitHub](https://github.com/neurono-ml/cucumber-openspec)
