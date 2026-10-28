# QueueX — Smart Campus Queue & Appointment Management System

QueueX is a web-based **Smart Campus Queue and Appointment Management System** designed to digitize and streamline queues for common campus services.

Instead of requiring students to physically wait at service counters, QueueX allows users to select a service, join a queue or book an appointment, receive a queue token, track their position, and view an estimated waiting time.

Service providers can manage active queues, call the next person, and mark completed services, while administrators have broader system-management access.

---

## ✨ Features

- 🔐 User authentication using JWT
- 👥 Role-based access control
  - USER
  - PROVIDER
  - ADMIN
- 🎟️ Digital queue token generation
- 📍 Queue position tracking
- 👤 People-ahead calculation
- ⏱️ Estimated waiting-time calculation
- ❌ Queue cancellation
- 📋 Provider queue management
- 📞 Call-next functionality
- ✅ Mark queue entries as served
- 📅 Appointment management
- 🏥 Multiple campus services
- 📊 Real-time queue-status visibility
- 🤖 Optional AI-based queue predictions/recommendations
- 🔔 Optional notifications

---

## 🎯 Problem Statement

Traditional campus queues are often:

- Long and unpredictable
- Crowded around service counters
- Difficult for students to monitor
- Dependent on manual queue handling
- Time-consuming for both students and service providers

QueueX addresses these issues by providing a centralized digital queue-management platform.

---

## 💡 Proposed Solution

QueueX digitizes the complete queue lifecycle:

```text
Login / Register
       ↓
Select Service
       ↓
Join Queue / Book Appointment
       ↓
Receive Token
       ↓
Track Queue Position
       ↓
Service Provider Calls Next
       ↓
Service Completed
       ↓
Queue Entry Marked as Served
```

---

## 🏗️ System Architecture

QueueX follows a three-tier web architecture:

```text
┌───────────────────────────────┐
│      PRESENTATION LAYER       │
│       React + Vite            │
│       User Interface          │
└───────────────┬───────────────┘
                │
             HTTP/REST
                │
                ↓
┌───────────────────────────────┐
│     APPLICATION LOGIC LAYER   │
│       Node.js + Express       │
│                               │
│ Authentication               │
│ Authorization                │
│ Queue Management             │
│ Business Logic               │
│ REST APIs                    │
└───────────────┬───────────────┘
                │
          Database Operations
                │
                ↓
┌───────────────────────────────┐
│          DATA LAYER           │
│      MongoDB + Mongoose       │
│                               │
│ Users                         │
│ Services                      │
│ Queue Entries                 │
│ Appointments                  │
│ Queue/Service History         │
└───────────────────────────────┘
```

### Optional External Services

The architecture can additionally integrate with:

- Gemini API — intelligent queue predictions/recommendations
- Email or in-app notification services

These services are enhancements and are not required for the core queue-management workflow.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose

### Authentication & Security

- JSON Web Tokens (JWT)
- Role-based authorization

### Development & Deployment

- Git
- GitHub
- Frontend/backend deployment platforms as configured by the project

---

## 👥 User Roles

### USER

A normal campus user can:

- Register and log in
- Select a service
- Join a queue
- View their queue status
- View queue position
- View estimated waiting time
- Cancel their own active queue entry

### PROVIDER

A service provider can:

- View an active service queue
- Call the next person
- Mark a called queue entry as served

### ADMIN

An administrator has elevated system-management permissions and can manage administrative aspects of the platform.

---

## 🔐 Authentication and Authorization

QueueX uses JWT-based authentication.

### Authentication Flow

```text
User Login
    ↓
Backend verifies credentials
    ↓
JWT generated
    ↓
Token returned to client
    ↓
Client sends token with protected requests
    ↓
Backend validates token
    ↓
User identity becomes available through req.user
```

Authentication answers:

> Who is the user?

Authorization answers:

> What is this user allowed to do?

Role-based middleware protects provider/admin endpoints.

---

## 🎟️ Queue Management

When a user joins a queue, the backend:

1. Authenticates the user.
2. Validates the service ID.
3. Checks that the service is active.
4. Checks whether the user already has an active queue entry.
5. Finds the latest token for the service and date.
6. Generates the next token number.
7. Creates the queue entry.
8. Returns the newly created entry.

### Token Generation

If there is no previous token:

```text
Token = 1
```

Otherwise:

```text
New Token = Last Token + 1
```

---

## 📍 Queue Position

For a waiting user:

```text
Queue Position = People Ahead + 1
```

For example:

```text
People Ahead = 2

Queue Position = 2 + 1
                = 3
```

---

## ⏱️ Estimated Waiting Time

QueueX estimates waiting time using:

```text
Estimated Wait
= People Ahead × Average Service Time
```

For example:

```text
People Ahead = 3
Average Service Time = 10 minutes

Estimated Wait = 3 × 10
               = 30 minutes
```

This is an estimate rather than an exact prediction because actual service durations may vary.

---

## 🔄 Queue Status

Queue entries can move through states such as:

```text
WAITING
   ↓
CALLED
   ↓
SERVED
```

An active queue entry may also be:

```text
WAITING / CALLED
        ↓
    CANCELLED
```

---

## 🔌 API Endpoints

### Authentication

```text
POST /api/auth/register
```

Registers a new user.

---

### Services

```text
GET /api/services
```

Retrieves available services.

---

### Join Queue

```text
POST /api/queue/join/:serviceId
```

Requires an authenticated user.

Creates a queue entry for the selected service.

Possible responses include:

- `201 Created`
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

---

### Get My Queue

```text
GET /api/queue/my
```

Requires authentication.

Returns the logged-in user's queue entries, including calculated queue information.

---

### Get Service Queue

```text
GET /api/queue/service/:serviceId
```

Requires:

- Authentication
- PROVIDER or ADMIN role

Returns the active queue for a service.

---

### Cancel Queue Entry

```text
PATCH /api/queue/:id/cancel
```

Requires authentication.

A user can cancel only their own active queue entry.

---

### Call Next

```text
PATCH /api/queue/service/:serviceId/next
```

Requires:

- Authentication
- PROVIDER or ADMIN role

Finds the earliest waiting entry and changes its status to `CALLED`.

---

### Mark Served

```text
PATCH /api/queue/:id/status
```

Requires:

- Authentication
- PROVIDER or ADMIN role

Marks a called queue entry as `SERVED`.

---

## 🛡️ Security Model

QueueX applies several important security principles:

### JWT Authentication

Protected endpoints require a valid authentication token.

### Role-Based Authorization

Provider/admin functionality is protected using role checks.

### User Ownership

Queue cancellation verifies both:

```text
Queue Entry ID
+
Authenticated User ID
```

This prevents users from cancelling another user's queue entry.

### Input Validation

Object IDs are validated before database operations.

### Duplicate Prevention

Users cannot create multiple active queue entries for the same service and date.

---

## 🧪 API Testing

The backend was tested using API requests to verify expected behavior.

Important test cases include:

| Test | Expected Result |
|---|---|
| Join queue | `201 Created` |
| Duplicate active queue join | `409 Conflict` |
| USER accessing provider-only endpoint | `403 Forbidden` |
| Successful queue cancellation | `200 OK` |
| Invalid request data | `400 Bad Request` |
| Missing resource | `404 Not Found` |

---

## 📊 Example Queue Response

A queue response can contain information such as:

```json
{
  "tokenNumber": 4,
  "status": "WAITING",
  "peopleAhead": 1,
  "queuePosition": 2,
  "estimatedWaitMinutes": 10
}
```

This allows the frontend to display the user's current queue status.

---

## 📁 Suggested Project Structure

A typical full-stack organization is:

```text
QueueX/
├── client/                 # React frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── server/                 # Node.js / Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── ...
│
├── .gitignore
└── README.md
```

Use the actual repository structure as the source of truth if it differs from this overview.

---

## 🚀 Local Development

### Prerequisites

Install:

- Node.js
- npm
- MongoDB / MongoDB Atlas access

### Installation

Clone the repository and install the dependencies according to the package configuration in the frontend and backend.

Create the required environment configuration for the backend, including the database connection and JWT configuration used by the project.

Then start the frontend and backend using the scripts defined in their respective `package.json` files.

> Do not commit `.env` files or secret API keys to GitHub.

---

## 🔒 Environment Variables

Sensitive configuration should be stored in environment variables rather than committed to source control.

Typical configuration includes:

```text
MongoDB connection
JWT secret
Server configuration
Optional external API keys
```

Use the exact variable names defined in the project's `.env` / configuration files.

---

## 🌱 Future Improvements

Possible future improvements include:

- Restrict providers to only their assigned services
- More accurate wait-time prediction using historical queue data
- Real-time updates using WebSockets or Server-Sent Events
- Push/email notifications
- Advanced admin analytics
- Queue history and performance reports
- Better appointment scheduling
- Multiple service counters
- Improved concurrency handling for simultaneous queue joins

---

## ⚠️ Current Limitations

### Provider Service Ownership

The current role-based authorization allows an authorized provider to access permitted queue-management routes without an additional check confirming that the provider is assigned to that specific service.

A future version can add service-level authorization.

### Estimated Waiting Time

The current estimate is based on:

```text
People Ahead × Average Service Time
```

It is therefore an estimate and may differ from the actual waiting time.

---

## 🎓 Project Objective

QueueX aims to provide a:

> **Simple, secure and efficient digital queue-management system for campus services.**

The system reduces physical waiting, improves queue visibility, and provides service providers with centralized queue-management capabilities.

---

## 📌 Project Summary

QueueX transforms traditional physical campus queues into a centralized digital workflow:

```text
Student
   ↓
Login
   ↓
Select Service
   ↓
Join Queue / Book Appointment
   ↓
Receive Token
   ↓
Track Queue
   ↓
Provider Calls Next
   ↓
Service Completed
   ↓
Queue Marked Served
```

The system combines a modern web frontend, RESTful backend APIs, JWT-based security, role-based authorization, and MongoDB-based persistent storage to provide a structured campus queue-management solution.
