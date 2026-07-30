Feature: Auth
  The system SHALL authenticate users and manage sessions securely.

  Rule: Session Timeout
    The system SHALL expire a session after 30 minutes of inactivity.

    Scenario: Idle timeout
      Given an authenticated session
      When 30 minutes pass with no activity
      Then the session is invalidated
      And the user must re-authenticate

    Scenario: Activity resets timer
      Given an authenticated session
      When the user performs an action before 30 minutes
      Then the session timer resets

  Rule: Login Validation
    The system SHALL validate credentials on login.

    Scenario: Successful login
      When the user submits valid credentials
      Then the system returns a session token
      And the user is redirected to the dashboard

    Scenario: Invalid credentials
      Given a registered user
      When the user submits invalid credentials
      Then the system returns 401
      And the error is logged
