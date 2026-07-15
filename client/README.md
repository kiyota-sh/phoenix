# Phoenix Client

The **Phoenix Client** is the frontend application responsible for providing the user interface and consuming the Phoenix REST API.

## Responsibilities

- User authentication
- Project management
- Dashboard
- Progress tracking
- Statistics visualization
- Search and filtering
- Session management
- Responsive user interface

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5
- Fetch API

## Project Structure

```text
client/
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── pages/
├── components/
├── index.html
└── README.md
```

## Notes

- The client communicates exclusively with the REST API.
- All requests are performed using the Fetch API.
- Business logic and data processing are handled by the backend.
- The frontend is responsible only for rendering data and handling the user experience.
