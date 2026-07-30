# Exemplos

## Exemplo 1: Spec de Autenticação Básica

**Entrada** (`openspec/specs/auth/spec.md`):
```markdown
# @smoke Especificação de Autenticação
## Propósito
Sistema de autenticação para a plataforma.

### Requisito: Login
#### Cenário: Login Bem-sucedido
- **DADO** um usuário registrado com credenciais válidas
- **QUANDO** ele enviar seu email e senha
- **ENTÃO** ele recebe um token JWT
- **E** o token expira em 3600 segundos

#### Cenário: Login Falho
- **DADO** um usuário registrado
- **QUANDO** ele enviar uma senha inválida
- **ENTÃO** ele recebe um erro 401
- **E** a mensagem de erro diz "Credenciais inválidas"
```

**Saída** (`features/auth.feature`):
```gherkin
@smoke
Funcionalidade: Autenticação

  Sistema de autenticação para a plataforma.

  Regra: Login

    Cenário: Login Bem-sucedido
      Dado um usuário registrado com credenciais válidas
      Quando ele enviar seu email e senha
      Então ele recebe um token JWT
      E o token expira em 3600 segundos

    Cenário: Login Falho
      Dado um usuário registrado
      Quando ele enviar uma senha inválida
      Então ele recebe um erro 401
      E a mensagem de erro diz "Credenciais inválidas"
```

## Exemplo 2: Background + Tags + DataTable

**Entrada** (`openspec/specs/admin/spec.md`):
```markdown
# @regression Especificação de Administrador
## Propósito
Controle de acesso ao painel administrativo.

## Background
- **DADO** um usuário admin autenticado
- **E** o usuário tem privilégios de administrador

### @critical Requisito: Gerenciamento de Usuários
#### Esquema do Cenário: Gerenciar Usuários
- **DADO** a página de gerenciamento de usuários
- **QUANDO** <ação> for executada
- **ENTÃO** o sistema <resultado>

##### Exemplos:
| ação       | resultado              |
| criar      | cria um novo usuário   |
| desativar  | desativa o usuário     |
| excluir    | remove o usuário       |

#### Cenário: Importação em Massa
- **DADO** os seguintes usuários para importar:
  | nome  | email             | perfil |
  | Alice | alice@exemplo.com | admin  |
  | Bob   | bob@exemplo.com   | visualizador |
- **QUANDO** a importação em massa for executada
- **ENTÃO** todos os usuários são criados
- **E** os logs de importação são gerados
```

**Saída** (`features/admin.feature`):
```gherkin
# language: pt
@regression
Funcionalidade: Administrador

  Controle de acesso ao painel administrativo.

  Contexto:
    Dado um usuário admin autenticado
    E o usuário tem privilégios de administrador

  @critical
  Regra: Gerenciamento de Usuários

    Esquema do Cenário: Gerenciar Usuários
      Dado a página de gerenciamento de usuários
      Quando <ação> for executada
      Então o sistema <resultado>

    Exemplos:
      | ação      | resultado              |
      | criar     | cria um novo usuário   |
      | desativar | desativa o usuário     |
      | excluir   | remove o usuário       |

    Cenário: Importação em Massa
      Dado os seguintes usuários para importar:
        | nome  | email             | perfil |
        | Alice | alice@exemplo.com | admin  |
        | Bob   | bob@exemplo.com   | visualizador |
      Quando a importação em massa for executada
      Então todos os usuários são criados
      E os logs de importação são gerados
```

## Exemplo 3: Spec de Mudança Delta

**Entrada** (`openspec/changes/add-biometric/specs/auth/spec.md`):
```markdown
# Especificação de Autenticação
## Propósito
Autenticação atualizada.

## REQUISITOS ADICIONADOS
### Requisito: Login Biométrico
#### Cenário: Autenticação por Impressão Digital
- **DADO** uma impressão digital registrada
- **QUANDO** o usuário escanear sua impressão digital
- **ENTÃO** o acesso é concedido

## REQUISITOS REMOVIDOS
### Requisito: SMS OTP
Descontinuado em favor da autenticação biométrica.
```

**Saída** (`features/add-biometric_auth.feature`):
```gherkin
Funcionalidade: Autenticação

  Autenticação atualizada.

  Regra: Login Biométrico

    Cenário: Autenticação por Impressão Digital
      # ADICIONADO
      Dado uma impressão digital registrada
      Quando o usuário escanear sua impressão digital
      Então o acesso é concedido

  Regra: SMS OTP
    Descontinuado em favor da autenticação biométrica.
    # REMOVIDO: SMS OTP — Descontinuado em favor da autenticação biométrica.
```

## Exemplo 4: Localização em Português

```bash
npx tsx scripts/index.ts -i ./openspec -o ./features -l pt
```

```gherkin
# language: pt
Funcionalidade: Autenticação

  Contexto:
    Dado que o usuário está logado

  Regra: Login
    Cenário: Login bem-sucedido
      Dado um usuário registrado com credenciais válidas
      Quando ele enviar email e senha
      Então recebe um token JWT
```

## Exemplo 5: Cenário sem DADO (Given)

OpenSpec suporta cenários começando com QUANDO:

```markdown
#### Cenário: Health Check
- **QUANDO** o endpoint de saúde for chamado
- **ENTÃO** a resposta é 200
```

Produz Gherkin válido:

```gherkin
    Cenário: Health Check
      Quando o endpoint de saúde for chamado
      Então a resposta é 200
```
