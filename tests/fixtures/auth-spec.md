# Auth Specification

## Purpose
The system SHALL authenticate users and manage sessions securely.

## Requirements

### Requirement: Session Timeout
The system SHALL expire a session after 30 minutes of inactivity.

#### Scenario: Idle timeout
- **GIVEN** an authenticated session
- **WHEN** 30 minutes pass with no activity
- **THEN** the session is invalidated
- **AND** the user must re-authenticate

#### Scenario: Activity resets timer
- **GIVEN** an authenticated session
- **WHEN** the user performs an action before 30 minutes
- **THEN** the session timer resets

### Requirement: Login Validation
The system SHALL validate credentials on login.

#### Scenario: Successful login
- **WHEN** the user submits valid credentials
- **THEN** the system returns a session token
- **AND** the user is redirected to the dashboard

#### Scenario: Invalid credentials
- **GIVEN** a registered user
- **WHEN** the user submits invalid credentials
- **THEN** the system returns 401
- **AND** the error is logged
