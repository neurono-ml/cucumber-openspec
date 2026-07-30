# Examples

## Example 1: Basic Auth Spec

**Input** (`openspec/specs/auth/spec.md`):
```markdown
# @smoke Auth Specification
## Purpose
Authentication system for the platform.

### Requirement: Login
#### Scenario: Successful Login
- **GIVEN** a registered user with valid credentials
- **WHEN** they submit their email and password
- **THEN** they receive a JWT token
- **AND** the token expires in 3600 seconds

#### Scenario: Failed Login
- **GIVEN** a registered user
- **WHEN** they submit an invalid password
- **THEN** they receive a 401 error
- **AND** the error message says "Invalid credentials"
```

**Output** (`features/auth.feature`):
```gherkin
@smoke
Feature: Auth

  Authentication system for the platform.

  Rule: Login

    Scenario: Successful Login
      Given a registered user with valid credentials
      When they submit their email and password
      Then they receive a JWT token
      And the token expires in 3600 seconds

    Scenario: Failed Login
      Given a registered user
      When they submit an invalid password
      Then they receive a 401 error
      And the error message says "Invalid credentials"
```

## Example 2: Background + Tags + DataTable

**Input** (`openspec/specs/admin/spec.md`):
```markdown
# @regression Admin Specification
## Purpose
Admin panel access control.

## Background
- **GIVEN** an authenticated admin user
- **AND** the user has admin privileges

### @critical Requirement: User Management
#### Scenario Outline: Manage Users
- **GIVEN** the user management page
- **WHEN** <action> is performed
- **THEN** the system <result>

##### Examples:
| action     | result              |
| create     | creates a new user  |
| deactivate | deactivates the user|
| delete     | removes the user    |

#### Scenario: Bulk Import
- **GIVEN** the following users to import:
  | name  | email             | role   |
  | Alice | alice@example.com | admin  |
  | Bob   | bob@example.com   | viewer |
- **WHEN** bulk import is executed
- **THEN** all users are created
- **AND** import logs are generated
```

**Output** (`features/admin.feature`):
```gherkin
@regression
Feature: Admin

  Admin panel access control.

  Background:
    Given an authenticated admin user
    And the user has admin privileges

  @critical
  Rule: User Management

    Scenario Outline: Manage Users
      Given the user management page
      When <action> is performed
      Then the system <result>

      Examples:
        | action     | result              |
        | create     | creates a new user  |
        | deactivate | deactivates the user |
        | delete     | removes the user    |

    Scenario: Bulk Import
      Given the following users to import:
        | name  | email             | role   |
        | Alice | alice@example.com | admin  |
        | Bob   | bob@example.com   | viewer |
      When bulk import is executed
      Then all users are created
      And import logs are generated
```

## Example 3: Delta Change Spec

**Input** (`openspec/changes/add-biometric/specs/auth/spec.md`):
```markdown
# Auth Specification
## Purpose
Updated authentication.

## ADDED Requirements
### Requirement: Biometric Login
#### Scenario: Fingerprint Auth
- **GIVEN** a registered fingerprint
- **WHEN** the user scans their fingerprint
- **THEN** access is granted

## REMOVED Requirements
### Requirement: SMS OTP
Deprecated in favor of biometric authentication.
```

**Output** (`features/add-biometric_auth.feature`):
```gherkin
Feature: Auth

  Updated authentication.

  Rule: Biometric Login

    Scenario: Fingerprint Auth
      # ADDED
      Given a registered fingerprint
      When the user scans their fingerprint
      Then access is granted

  Rule: SMS OTP
    Deprecated in favor of biometric authentication.
    # REMOVED: SMS OTP — Deprecated in favor of biometric authentication.
```

## Example 4: Portuguese Localization

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

## Example 5: Scenario without GIVEN

OpenSpec supports scenarios starting with WHEN:

```markdown
#### Scenario: Health Check
- **WHEN** the health endpoint is called
- **THEN** the response is 200
```

Produces valid Gherkin:

```gherkin
    Scenario: Health Check
      When the health endpoint is called
      Then the response is 200
```
