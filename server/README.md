# Phoenix API

The **Phoenix API** is a RESTful backend application built with Java Servlets. It manages business logic, authentication, data persistence, and communication with the database.

## Responsibilities

- REST API
- Authentication & Authorization
- Business logic
- Data validation
- Database access
- Project history management
- Statistics generation
- Centralized error handling

## Tech Stack

- Java
- Jakarta Servlets
- Apache Tomcat
- JDBC
- SQL Database
- JSON

## Project Structure

```text
api/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   └── utils/
├── WebContent/
├── WEB-INF/
└── README.md
```

## API Standards

- RESTful architecture
- JSON request and response format
- Versioned endpoints (`/api/v1/`)
- Standard HTTP status codes
- Consistent API response structure
- CORS enabled

## Notes

- The API is deployed on Apache Tomcat.
- Servlets expose REST endpoints consumed by the frontend.
- JDBC is used for database connectivity.
- Business rules and data processing are handled exclusively on the server.
