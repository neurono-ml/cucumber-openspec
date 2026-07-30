# User Management Specification

## Purpose
The system SHALL manage user accounts with role-based access control.

## Requirements

### Requirement: Admin User Creation
The system SHALL allow administrators to create user accounts with specific roles.

#### Scenario: Creating an admin user
- **GIVEN** an authenticated admin user
  - With role "superadmin"
  - With 2FA enabled
- **WHEN** they create a new user with admin role
- **THEN** the new user is created
  - With admin privileges
  - With access to all modules
- **AND** an audit log entry is created
  - With timestamp
  - With admin ID
  - With action type "user.create"
