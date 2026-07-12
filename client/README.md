# Phoenix Client

The **Phoenix Client** is the frontend application responsible for providing the user interface and interacting with the REST API.

## Responsibilities

* User authentication
* Project management
* Dashboard
* Progress tracking
* Statistics and charts
* Search and filtering
* Session management
* Responsive user interface

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Chart.js

## Project Structure

```text
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── routes/
│   ├── hooks/
│   ├── contexts/
│   ├── types/
│   ├── utils/
│   └── styles/
├── package.json
└── README.md
```

## Notes

* The client communicates exclusively through the REST API.
* Business logic must remain on the backend.
* API responses are expected in JSON format.
* Progress calculations and statistics are provided by the API.
