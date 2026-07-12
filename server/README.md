# Phoenix API

The **Phoenix API** is the backend service responsible for exposing REST endpoints, handling business logic, authentication, and data persistence.

## Responsibilities

* REST API
* Authentication & Authorization (JWT)
* Business logic
* Data validation
* Database access
* Project history
* Statistics generation
* Centralized error handling

## Tech Stack

* ASP.NET Core
* C#
* Entity Framework Core
* SQL Server
* JWT Authentication

## Architecture

```text
API
 ├── Controllers
 ├── Services
 ├── Repositories
 ├── Domain
 └── Database
```

## Solution Structure

```text
api/
├── Phoenix.Api/
├── Phoenix.Application/
├── Phoenix.Domain/
├── Phoenix.Infrastructure/
├── Phoenix.Tests/
└── Phoenix.sln
```

## API Standards

* RESTful architecture
* JSON responses
* JWT authentication
* Versioned endpoints (`/api/v1/`)
* Standard HTTP status codes
* Consistent response format
* CORS enabled
