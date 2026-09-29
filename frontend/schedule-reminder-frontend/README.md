# Schedule Reminder Frontend

React + Vite frontend for the current Spring Boot backend.

Backend: `http://localhost:8081`

Used endpoints:
- GET/POST `/Subject`
- DELETE `/Subject/{id}`
- GET/POST `/Reminder`
- PUT/GET `/Reminder/{id}`
- DELETE `/Reminder/{id}`
- GET `/timeTableEntry`

Run:
```bash
npm install
npm run dev
```

The reminder form keeps IDs internal and sends the selected subject as `{ "subject": { "id": ... } }`. Repeat choices are suggested from the deadline, while the backend remains the final validator.
