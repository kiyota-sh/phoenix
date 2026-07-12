# Phoenix

## Project Summary

**Phoenix** is a web app for managing personal projects, with a different approach than Trello/Notion: instead of just managing active projects, it **saves the complete history of abandoned projects** (why they were abandoned, how far along they were, when the last activity was) so that the user can easily resume them in the future, without losing context or starting from scratch.

**Key Features:**

- CRUD operations for projects (name, description, category, priority, dates)
- Chronological log of project progress
- Change status to "Abandoned" with reason
- Reopening/recovery of abandoned projects
- Dashboard with counts and recent activity
- Statistics with graphs (categories, reasons for abandonment, etc.)
- Search engine with filters
- Customizable categories
- Change history per project

---

## General Architecture

The system is divided into independent layers that communicate via a **REST API**:

Client (Frontend) → REST API (Controllers) → Business Logic (Services) → Data Access → Database

- **Frontend**: consumes the API, manages the interface and user experience. It does not access the database directly.

- **Backend**: exposes REST endpoints, contains the business logic, validates data, and communicates with the database.

- Exchange format: **JSON**.

- Authentication: via **token** (JWT is recommended, as it fits naturally with a REST architecture without server sessions).

### API Response Standard

To ensure consistent handling by the frontend, it is recommended that **all** backend responses follow the same general structure: a success/error indicator, a descriptive message, and the data (if applicable). This prevents each endpoint from returning a different format and facilitates consistent error display on the frontend.

### Recommended HTTP Status Codes

- 200 → Successful operation
- 201 → Resource created successfully
- 400 → Validation error / Incorrect data
- 401 → Not authenticated
- 403 → Unauthorized (No permissions for that resource)
- 404 → Resource not found
- 500 → Internal server error

### CORS

The backend should enable CORS, as the frontend will likely run on a different origin/port than the backend during development.

### API Versioning (Best Practice)

Prefix endpoints with `/api/v1/` to allow for future API evolution without breaking previous versions if more features are added.

---

## FRONTEND Responsibilities

1. User interface for all screens: login/registration, dashboard, project list, project details, progress form, statistics, search.

2. API consumption: requests to endpoints and data rendering.

3. Basic form validations (empty fields, formatting) before sending to the backend.

4. Handling visual states: loading, errors, success messages.

5. Rendering graphs with the data provided by the backend (the backend sends the processed data; the frontend only creates the graphs).

6. Client session management (save token, log out, redirect if not authenticated).

7. Navigation between different views/modules.

8. Responsive design, so it works correctly on different screen sizes.

**The frontend should NOT:**

- Calculate statistics or progress percentages (this is provided by the backend after processing).

- Include business logic (e.g., rules defining what constitutes an "abandoned project").

--

## Backend Responsibilities

1. Expose the REST API with all necessary endpoints.

2. Business logic: calculate progress percentage, time elapsed since the last update, and generate data for statistics.

3. Authentication and authorization (login, registration, route protection).

4. Validate data before saving.

5. Maintain database persistence.

6. Automatically log every time a project is modified.

7. Hash passwords before saving (never save passwords in plain text).

8. Centralize error handling to ensure consistent error response formats.

---

## Conceptual Data Model (Main Entities)

This is not code, just the conceptual structure for both parties to agree on before implementation:

- **User**: id, name, email, password (hashed), registration date
- **Project**: id, user_id, name, description, objective, category_id, priority, start_date, objective_date, status, reason for abandonment, last_progress_date
- **Progress**: id, project_id, date, description, notes, difficulties
- **Category**: id, user_id, name
- **ChangeHistory**: id, project_id, modified_field, previous_value, new_value, date
- **ReasonForAbandonment** (fixed catalog): id, name

**Relationships:**

- User 1:N Project
- Project 1:N Progress
- Project 1:N HistoryChange
- User 1:N Category
