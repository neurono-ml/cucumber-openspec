# Auth Specification

## Purpose
The system SHALL authenticate users and manage sessions.

## ADDED Requirements

### Requirement: Password Reset
The system SHALL allow users to reset their password via email.

#### Scenario: Successful password reset
- **GIVEN** a registered user
- **WHEN** they request a password reset
- **THEN** a reset email is sent
- **AND** the reset link expires in 1 hour

## MODIFIED Requirements

### Requirement: Session Timeout (Reduced from 30 to 15 minutes)
The system SHALL expire a session after 15 minutes of inactivity.

#### Scenario: Idle timeout
- **GIVEN** an authenticated session
- **WHEN** 15 minutes pass with no activity
- **THEN** the session is invalidated

## REMOVED Requirements

### Requirement: Legacy Token Support
(Feature removed — all tokens now use JWT format)
