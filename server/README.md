# Phoenix API

The **Phoenix API** is the backend application responsible for exposing REST endpoints, implementing business logic, handling authentication, and managing data persistence.

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
- JSP (JavaServer Pages)
- Apache Tomcat
- JDBC
- SQL Database
- JSON

## Project Structure

```text
api/
├── src/
├── WebContent/
├── WEB-INF/
├── controllers/
├── services/
├── repositories/
├── models/
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
- Business rules are implemented on the server.
- The client must access data only through the exposed REST endpoints.
