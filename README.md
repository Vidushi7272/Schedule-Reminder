# 📅 Schedule Reminder

A full-stack personal scheduling and reminder application built using **Spring Boot and React**.

Schedule Reminder allows users to manage subjects, create weekly timetables, schedule deadline-based reminders, configure recurring reminders, and receive both **in-app and browser notifications** when reminders become due.

The project was built to understand how a real-world frontend and backend communicate through REST APIs, how data is persisted using JPA/Hibernate, and how scheduled backend processes can drive application behavior.

---

## ✨ Features

### 📚 Subject Management

- Create subjects with a custom color
- Edit subject details
- Delete individual subjects
- Delete all subjects
- Subject names are validated
- Subject names are unique

### 🗓️ Weekly Timetable

- Create timetable entries for different days
- Assign timetable entries to subjects
- Configure start and end times
- View timetable day-by-day
- Automatically sort entries by start time
- Edit and delete timetable entries

### ⏰ Smart Reminders

Each reminder can contain:

- Title
- Description
- Deadline
- Subject
- Repeat frequency
- Completion status

Users can create, edit, delete, and complete reminders.

### 🔁 Dynamic Repeat Rules

The application dynamically determines the available repeat frequencies based on the time remaining until the deadline.

| Time until deadline | Available repetition |
|---|---|
| ≤ 1 hour | ONCE |
| > 1 hour and ≤ 24 hours | ONCE, HOURLY |
| > 24 hours and ≤ 7 days | ONCE, HOURLY, DAILY |
| > 7 days | ONCE, HOURLY, DAILY, WEEKLY |

The frontend provides the user experience, while the backend performs the final validation of these rules.

### 🔔 Reminder Notifications

When a reminder becomes due, the application can display:

- In-app notification
- Browser/desktop notification

The notification system also tracks previously notified reminder occurrences to prevent repeated notifications.

### 📊 Dashboard

The dashboard provides an overview of:

- Total subjects
- Pending reminders
- Completed reminders
- Timetable entries
- Upcoming reminders

---

# 🛠️ Tech Stack

## Backend

- Java
- Spring Boot
- Spring MVC
- Spring Data JPA
- Hibernate
- MySQL
- Jakarta Validation
- Maven

## Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- Fetch API
- Browser Notification API
- localStorage

## Tools

- IntelliJ IDEA
- VS Code
- Postman
- Git
- GitHub

---

# 🏗️ Architecture

The application follows a layered backend architecture.

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │                     │
                    │ Dashboard           │
                    │ Subjects            │
                    │ Timetable           │
                    │ Reminders            │
                    └──────────┬──────────┘
                               │
                          HTTP / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │                     │
                    │    Controllers      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Services       │
                    │                     │
                    │ Business Logic      │
                    │ Validation          │
                    │ Reminder Scheduling │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Spring Data JPA     │
                    │    Repositories     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │                     │
                    │ Subjects            │
                    │ Timetable Entries   │
                    │ Reminders           │
                    └─────────────────────┘
```

---

# 🧠 Core Concepts

## 1. REST API

The React frontend communicates with the Spring Boot backend using HTTP and REST endpoints.

Examples:

```http
GET    /Subject
POST   /Subject
PUT    /Subject/{id}
DELETE /Subject/{id}
```

```http
GET    /Entry
POST   /Entry
PUT    /Entry/{id}
DELETE /Entry/{id}
```

```http
GET    /Reminder
POST   /Reminder
PUT    /Reminder/{id}
DELETE /Reminder/{id}
```

The frontend and backend remain separate applications and communicate through a defined API layer.

---

## 2. Layered Architecture

The backend separates responsibilities into three major layers:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

### Controller

Responsible for:

- Receiving HTTP requests
- Reading request parameters
- Returning responses
- Delegating operations to services

### Service

Responsible for:

- Business logic
- Validation
- Entity updates
- Reminder calculations
- Scheduling logic

### Repository

Responsible for:

- Database operations
- Saving entities
- Finding entities
- Updating entities
- Deleting entities

This separation keeps the application modular and easier to maintain.

---

# 🗄️ Database & JPA

The application uses **Spring Data JPA and Hibernate** for persistence.

Entities are mapped to database tables using JPA annotations.

Example:

```java
@Entity
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String color;
}
```

Repositories extend `JpaRepository` to provide common database operations:

```java
public interface SubjectRepo extends JpaRepository<Subject, Long> {
}
```

This provides methods such as:

```text
findAll()
findById()
save()
deleteById()
existsById()
```

Hibernate handles the translation between Java objects and relational database records.

---

# 🔗 Entity Relationships

The application models relationships between subjects, timetable entries, and reminders.

A timetable entry belongs to a subject:

```java
@ManyToOne
private Subject subject;
```

A reminder also belongs to a subject:

```java
@ManyToOne
@JoinColumn(name = "subject_id")
private Subject subject;
```

The `Subject` entity maintains the relationship with its reminders:

```java
@OneToMany(mappedBy = "subject")
private List<Reminder> reminders;
```

This demonstrates relational database modeling using JPA entity relationships.

---

# ✅ Validation

The application performs validation on the backend instead of relying only on frontend validation.

For example, subject names are validated using:

```java
@NotBlank(message = "title cannot be empty")
@Size(max = 20, message = "Title cannot exceed 20 characters")
@Column(unique = true)
private String title;
```

Timetable entries also validate that:

```text
start time < end time
```

Reminder repeat rules are validated again by the backend service.

This follows an important principle:

> Frontend validation improves user experience; backend validation protects application integrity.

---

# ⏰ Reminder Scheduling

The backend contains scheduled logic for processing reminders.

The general flow is:

```text
Reminder becomes due
        ↓
Check repeat type
        ↓
       ONCE?
      /     \
    YES      NO
     ↓        ↓
Complete   Calculate next occurrence
              ↓
       Update nextReminderTime
```

For recurring reminders, the application calculates the next occurrence and updates `nextReminderTime`.

This allows the reminder to continue according to its configured repeat frequency.

---

# 🔁 Time-Based Business Logic

Reminder scheduling uses Java's date/time APIs:

```java
LocalDateTime
Duration
```

The application calculates the time remaining until the deadline and uses that information to determine which repeat options are valid.

For example:

```text
Deadline in 30 minutes
        ↓
      ONCE
```

while:

```text
Deadline in 3 days
        ↓
ONCE
HOURLY
DAILY
```

This demonstrates handling real-world time-based business rules in the backend.

---

# ⚛️ React State Management

The frontend uses React state to manage application data.

Examples:

```jsx
const [subjects, setSubjects] = useState([]);
const [reminders, setReminders] = useState([]);
const [entries, setEntries] = useState([]);
```

React state is used for:

- Subjects
- Reminders
- Timetable entries
- Selected timetable day
- Form data
- Notifications
- UI state

`useEffect` is used for operations such as:

- Loading data from the backend
- Requesting browser notification permission
- Periodically checking reminders

---

# 🔄 Frontend ↔ Backend Communication

The frontend communicates with the backend through a reusable API helper.

The general request lifecycle is:

```text
React Component
      ↓
API Helper
      ↓
HTTP Request
      ↓
Spring Boot Controller
      ↓
Service Layer
      ↓
Repository
      ↓
MySQL
      ↓
Response
      ↓
React State
      ↓
UI Update
```

This separation allows the frontend to focus on presentation and interaction while the backend handles persistence and business logic.

---

# 🌐 CORS

During development, the frontend and backend run on different origins:

```text
Frontend
http://localhost:5173

Backend
http://localhost:8081
```

The backend therefore uses CORS configuration to allow requests from the React development server.

---

# 🔔 Notification System

The project implements two types of notifications.

### In-App Notification

React maintains notification state and displays a notification component inside the application when a reminder becomes due.

```text
Reminder becomes due
        ↓
React detects it
        ↓
Update notification state
        ↓
Render notification
```

### Browser Notification

The application also uses the browser Notification API:

```javascript
new Notification(`Reminder: ${reminder.title}`, {
    body: reminder.description
});
```

The browser asks the user for notification permission before notifications can be displayed.

---

# 🧠 Preventing Duplicate Notifications

A reminder checker runs periodically on the frontend.

Without protection, the same reminder could generate notifications repeatedly:

```text
19:30:00 → 🔔
19:30:30 → 🔔
19:31:00 → 🔔
19:31:30 → 🔔
```

To prevent this, the application creates a unique notification key using:

```text
reminder ID + nextReminderTime
```

Example:

```text
12-2026-09-29T19:30:00
```

The key is stored in `localStorage`.

The result is:

```text
19:30 → 🔔 Notify
19:30:30 → Already notified
19:31 → Already notified
```

When a recurring reminder receives a new `nextReminderTime`, it becomes a new notification occurrence.

---

# 📁 Project Structure

```text
Schedule-Reminder/
│
├── README.md
├── pom.xml
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/vidushi/schedulereminder/
│       │       │
│       │       ├── Config/
│       │       │   └── CorsConfig.java
│       │       │
│       │       ├── Controller/
│       │       │   ├── ReminderController.java
│       │       │   ├── SubjectController.java
│       │       │   └── timeTableEntryController.java
│       │       │
│       │       ├── Module/
│       │       │   ├── Reminder.java
│       │       │   ├── RepeatType.java
│       │       │   ├── Subject.java
│       │       │   └── timeTableEntry.java
│       │       │
│       │       ├── Repository/
│       │       │   ├── ReminderRepository.java
│       │       │   ├── SubjectRepo.java
│       │       │   └── timeTableEntryRepo.java
│       │       │
│       │       └── Service/
│       │           ├── EntryService.java
│       │           ├── ReminderScheduler.java
│       │           ├── ReminderService.java
│       │           └── SubjectService.java
│       │
│       └── resources/
│           └── application.properties
│
└── frontend/
    └── schedule-reminder-frontend/
        ├── src/
        │   ├── main.jsx
        │   └── ...
        ├── package.json
        └── vite.config.js
```

---

# 🔄 Example: Creating a Reminder

When a user creates a reminder:

```text
User fills reminder form
        ↓
React creates request body
        ↓
POST /Reminder
        ↓
ReminderController
        ↓
ReminderService
        ↓
Validate reminder
        ↓
Calculate nextReminderTime
        ↓
ReminderRepository
        ↓
Hibernate
        ↓
MySQL
        ↓
Saved reminder returned
        ↓
React updates UI
```

---

# 🔔 Example: Notification Flow

```text
                     MySQL
                       │
                       ▼
             Spring Boot Scheduler
                       │
                       ▼
             Reminder state updated
                       │
                       ▼
                React fetches
                  reminders
                       │
                       ▼
             Compare with current time
                       │
                       ▼
                  Reminder due
                       │
                ┌──────┴──────┐
                ▼             ▼
          In-app alert    Browser alert
                │             │
                └──────┬──────┘
                       ▼
                  localStorage
                prevents duplicate
                notifications
```

---

# 🚀 Running the Project

## Prerequisites

Make sure you have:

- Java
- Maven
- MySQL
- Node.js
- npm

---

## 1. Configure MySQL

Create the required MySQL database and configure the connection in:

```text
src/main/resources/application.properties
```

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskdb
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

Use your own local database credentials.

---

## 2. Start the Backend

Run the Spring Boot application from IntelliJ IDEA or using Maven.

The backend runs on:

```text
http://localhost:8081
```

---

## 3. Start the Frontend

Navigate to:

```bash
cd frontend/schedule-reminder-frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

# 🧪 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/Subject` | Get all subjects |
| POST | `/Subject` | Create subject |
| PUT | `/Subject/{id}` | Update subject |
| DELETE | `/Subject/{id}` | Delete subject |
| DELETE | `/Subject/all` | Delete all subjects |
| GET | `/Entry` | Get timetable entries |
| POST | `/Entry` | Create timetable entry |
| PUT | `/Entry/{id}` | Update timetable entry |
| DELETE | `/Entry/{id}` | Delete timetable entry |
| DELETE | `/Entry/all` | Delete all timetable entries |
| GET | `/Reminder` | Get reminders |
| POST | `/Reminder` | Create reminder |
| PUT | `/Reminder/{id}` | Update reminder |
| DELETE | `/Reminder/{id}` | Delete reminder |

---

# 📚 What I Learned

Building this project helped me understand how the individual components of a full-stack application work together.

### Backend

- Spring Boot application structure
- Spring MVC
- REST API design
- Dependency Injection
- Service and repository layers
- Spring Data JPA
- Hibernate ORM
- MySQL persistence
- Entity relationships
- Backend validation
- Java `LocalDateTime`
- Java `Duration`
- Scheduled backend processing
- Recurring reminder logic

### Frontend

- React components
- React state management
- `useState`
- `useEffect`
- Form handling
- API integration
- Conditional rendering
- Browser Notification API
- `localStorage`
- Client-side notification handling

### Full Stack

- Frontend/backend communication
- CORS
- REST-based architecture
- Debugging across application layers
- Database-backed application design
- Git and GitHub workflow

---

# 🔮 Future Improvements

Possible future improvements include:

- User authentication and authorization
- Persistent notification history
- Calendar-based timetable interface
- Drag-and-drop timetable scheduling
- Mobile-responsive improvements
- Push notifications using service workers
- WebSocket/SSE-based real-time notifications
- Reminder analytics
- Missed reminder tracking
- Search and filtering
- Cloud deployment

---

# 🎯 Project Goal

The main goal of this project was to understand the **end-to-end lifecycle of a full-stack application** rather than building only a CRUD application.

```text
User Interaction
       ↓
React
       ↓
REST API
       ↓
Spring MVC
       ↓
Service Layer
       ↓
JPA / Hibernate
       ↓
MySQL
       ↓
Scheduled Backend Logic
       ↓
React State
       ↓
User Notification
```

The project demonstrates how a Java/Spring Boot backend can be connected to a React frontend to create a complete, database-backed application with real business logic and notification behavior.

---

# 👩‍💻 Author

**Vidushi Mishra**

B.Tech — Computer Science & Engineering

### Technologies

`Java` `Spring Boot` `Spring MVC` `Spring Data JPA` `Hibernate` `MySQL` `React` `JavaScript` `Vite` `REST APIs` `Git` `GitHub`