# Hospital Management System
## Flow Design Document

**Architecture:** Layered Monolith
**Stack:** Node.js · Express.js · PostgreSQL · Sequelize ORM · JWT · Amazon SQS
**Deployment:** AWS EC2 · PM2 · Nginx

---

## 1. Business Flow Diagrams

### 1.1 Patient Registration & Appointment Booking

This flow describes how a Receptionist registers a new patient and books an appointment. The system checks whether the patient already exists before creating a new record. Once a slot is confirmed, the appointment is stored and a notification is dispatched asynchronously.

### 1.1 Patient Registration & Appointment Booking

This flow describes how a Receptionist registers a new patient and books an appointment. The system checks whether the patient already exists before creating a new record. Once a slot is confirmed, the appointment is stored and a notification is dispatched asynchronously.

```mermaid
flowchart TD
    A([Receptionist Logs In]) --> B[Search Patient by Name or Phone]
    B --> C{Patient Exists?}
    C -- No --> D[Register New Patient]
    D --> E[Patient Record Created]
    C -- Yes --> E
    E --> F[Select Doctor]
    F --> G[View Doctor Availability]
    G --> H[Select Available Time Slot]
    H --> I{Slot Available?}
    I -- No --> H
    I -- Yes --> J[Create Appointment]
    J --> K[Appointment Status: Booked]
    K --> L[Publish Message to SQS]
    L --> M[Confirmation Email Sent to Patient]
    K --> N([Appointment Confirmed])
```

---

### 1.2 Doctor Consultation Flow

This flow describes how a Doctor views their assigned appointments, reviews patient details, records consultation notes, and marks the appointment as completed.

```mermaid
flowchart TD
    A([Doctor Logs In]) --> B[View Today's Appointments]
    B --> C[Select Appointment]
    C --> D[View Patient Details]
    D --> E[Add Consultation Notes]
    E --> F[Mark Appointment as Completed]
    F --> G[Appointment Status: Completed]
    G --> H([Consultation Recorded])
```

---

### 1.3 Appointment Cancellation Flow

This flow describes how a Receptionist cancels an existing appointment. The system enforces the business rule that only booked appointments can be cancelled. Cancelled and completed appointments cannot be modified.

```mermaid
flowchart TD
    A([Receptionist Selects Appointment]) --> B{Appointment Status?}
    B -- Completed --> C([Cannot Modify - Show Error])
    B -- Cancelled --> C
    B -- Booked --> D[Cancel Appointment]
    D --> E[Appointment Status: Cancelled]
    E --> F[Publish Message to SQS]
    F --> G[Cancellation Email Sent to Patient]
    E --> H([Appointment Cancelled])
```

---

## 2. Sequence Diagrams

### 2.1 Authentication Sequence

This diagram shows the end-to-end flow of a user login request. The system validates credentials against the database, generates a JWT on success, and returns it to the client. The token is used for all subsequent authenticated requests.

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant AuthController
    participant AuthService
    participant UserRepository
    participant DB as PostgreSQL

    User->>Client: Enter Email & Password
    Client->>AuthController: POST /api/v1/auth/login
    AuthController->>AuthService: login(email, password)
    AuthService->>UserRepository: findByEmail(email)
    UserRepository->>DB: Query User Record
    DB-->>UserRepository: User Record
    UserRepository-->>AuthService: User Object

    alt Invalid Credentials
        AuthService-->>AuthController: Credentials Invalid
        AuthController-->>Client: 401 Unauthorized
    else Valid Credentials
        AuthService->>AuthService: Validate Credentials
        AuthService->>AuthService: Generate JWT Token
        AuthService-->>AuthController: JWT Token
        AuthController-->>Client: 200 OK · { token }
    end
```

---

### 2.2 Appointment Booking Sequence

This diagram shows how a Receptionist books an appointment. The service layer checks for slot conflicts before persisting the appointment. On success, a message is published to SQS and the API response is returned immediately without waiting for the notification to be delivered.

```mermaid
sequenceDiagram
    actor Receptionist
    participant AppointmentController
    participant AppointmentService
    participant SlotRepository
    participant AppointmentRepository
    participant DB as PostgreSQL
    participant SQS as Amazon SQS

    Receptionist->>AppointmentController: POST /api/v1/appointments
    AppointmentController->>AppointmentService: bookAppointment(data)
    AppointmentService->>SlotRepository: findSlot(slotId)
    SlotRepository->>DB: Query Time Slot
    DB-->>SlotRepository: Slot Record
    SlotRepository-->>AppointmentService: Slot Object

    AppointmentService->>AppointmentRepository: checkConflict(doctorId, slotId)
    AppointmentRepository->>DB: Query Existing Appointments
    DB-->>AppointmentRepository: Result

    alt Slot Already Booked
        AppointmentService-->>AppointmentController: Conflict Detected
        AppointmentController-->>Receptionist: 409 Conflict · Slot Not Available
    else Slot Available
        AppointmentRepository->>DB: Create Appointment Record
        DB-->>AppointmentRepository: Appointment Created
        AppointmentRepository-->>AppointmentService: Appointment Object
        AppointmentService->>SQS: Publish Booking Notification
        AppointmentService-->>AppointmentController: Appointment Object
        AppointmentController-->>Receptionist: 201 Created · { appointment }
    end
```

---

### 2.3 Doctor Views Appointments Sequence

This diagram shows how a Doctor retrieves their assigned appointments. The authentication middleware validates the JWT and attaches the user identity to the request before it reaches the controller.

```mermaid
sequenceDiagram
    actor Doctor
    participant AuthMiddleware
    participant AppointmentController
    participant AppointmentService
    participant AppointmentRepository
    participant DB as PostgreSQL

    Doctor->>AuthMiddleware: GET /api/v1/appointments/my
    AuthMiddleware->>AuthMiddleware: Verify JWT Token

    alt Token Invalid or Expired
        AuthMiddleware-->>Doctor: 401 Unauthorized
    else Token Valid
        AuthMiddleware->>AppointmentController: Forward Request · req.user attached
        AppointmentController->>AppointmentService: getDoctorAppointments(doctorId)
        AppointmentService->>AppointmentRepository: findByDoctorId(doctorId)
        AppointmentRepository->>DB: Query Appointments
        DB-->>AppointmentRepository: Appointment Records
        AppointmentRepository-->>AppointmentService: Appointment List
        AppointmentService-->>AppointmentController: Appointment List
        AppointmentController-->>Doctor: 200 OK · { appointments }
    end
```

---

## 3. Request Lifecycle

Every API request passes through a consistent set of layers before reaching business logic. This ensures that authentication, authorization, and validation concerns are handled uniformly across all routes.

```mermaid
flowchart TD
    A([Browser]) --> B[Nginx\nReverse Proxy]
    B --> C[Express Route\nRoute Matching]
    C --> D[Authentication Middleware\nVerify JWT Token]
    D --> E{Token Valid?}
    E -- No --> F([401 Unauthorized])
    E -- Yes --> G[Authorization Middleware\nRBAC Role Check]
    G --> H{Role Permitted?}
    H -- No --> I([403 Forbidden])
    H -- Yes --> J[Validation Middleware\nValidate Request Payload]
    J --> K{Payload Valid?}
    K -- No --> L([422 Unprocessable Entity])
    K -- Yes --> M[Controller\nHandle Request]
    M --> N[Service\nBusiness Logic]
    N --> O[Repository\nData Access]
    O --> P[Sequelize ORM\nQuery Builder]
    P --> Q[(PostgreSQL)]
    Q --> P
    P --> O
    O --> N
    N --> M
    M --> R([JSON Response])
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Nginx** | Accepts incoming HTTP requests and forwards them to the Node.js application. Acts as a reverse proxy. |
| **Express Route** | Matches the incoming URL and HTTP method to the correct controller handler. |
| **Authentication Middleware** | Verifies the JWT token on every protected route. Attaches the decoded user identity to the request. |
| **Authorization Middleware** | Checks whether the authenticated user's role is permitted to access the requested route. |
| **Validation Middleware** | Validates the structure and content of the request body before it reaches business logic. |
| **Controller** | Receives the validated request, delegates to the service layer, and returns the formatted response. |
| **Service** | Contains all business logic. Enforces business rules such as slot conflict checks and status transitions. |
| **Repository** | Abstracts all database interactions. The service layer never queries the database directly. |
| **Sequelize ORM** | Translates repository calls into database queries. Handles soft delete filtering automatically. |
| **PostgreSQL** | Stores and retrieves all persistent data. |

---

## 4. AWS Component Flow

The system is deployed on a single AWS EC2 instance. Nginx acts as the entry point, PM2 manages the Node.js process, and Amazon SQS decouples notification delivery from the API response.

```mermaid
flowchart TD
    A([Browser]) --> B[Nginx\nReverse Proxy]

    subgraph EC2 Instance
        B --> C[PM2\nProcess Manager]
        C --> D[Node.js Application]
        D --> E[(PostgreSQL\nDatabase)]
        D --> F[Amazon SQS\nNotification Queue]
        F --> G[Notification Worker\nLong Polling]
    end

    G --> H[SMTP Server]
    H --> I([Patient Email])
```

### Component Communication

| Component | Role | Why It Exists |
|---|---|---|
| **Nginx** | Receives all incoming HTTP requests and forwards them to the Node.js application. | Provides a stable entry point and isolates the application from direct internet exposure. |
| **PM2** | Manages the Node.js process. Restarts the application automatically if it crashes. | Ensures the application remains running without manual intervention. |
| **Node.js Application** | Handles all API requests, applies business logic, and interacts with the database. | The core of the system. All modules are served from this single process. |
| **PostgreSQL** | Stores all persistent data including users, doctors, patients, appointments, and time slots. | Runs on the same EC2 instance to keep the architecture simple for the current scope. |
| **Amazon SQS** | Receives notification messages published by the application after appointment events. | Decouples notification delivery from the API response. The application does not wait for the email to be sent before returning a response. |
| **Notification Worker** | A background process that polls SQS for messages and triggers email delivery. | Runs as a separate PM2-managed process on the same instance. |
| **SMTP Server** | Delivers the email to the patient. | Simple and cost-effective mechanism for sending transactional emails. |

---

## 5. Notification Flow

Notifications are sent asynchronously. The API response is returned to the client immediately after the appointment is stored. The notification is delivered independently through SQS and SMTP, ensuring that email delivery does not affect API performance or reliability.

```mermaid
sequenceDiagram
    participant AppService as Appointment Service
    participant DB as PostgreSQL
    participant SQS as Amazon SQS
    participant Worker as Notification Worker
    participant SMTP as SMTP Server
    participant Patient

    AppService->>DB: Store Appointment
    DB-->>AppService: Appointment Confirmed
    AppService->>SQS: Publish Notification Message
    Note over SQS: Message queued independently of API response

    loop Long Polling
        Worker->>SQS: Poll for Messages
        SQS-->>Worker: Notification Message Received
        Worker->>Worker: Determine Notification Type
        alt Appointment Booked
            Worker->>SMTP: Send Booking Confirmation
        else Appointment Cancelled
            Worker->>SMTP: Send Cancellation Notice
        end
        SMTP->>Patient: Email Delivered
        Worker->>SQS: Acknowledge and Remove Message
    end
```

---

## 6. Doctor Availability Flow

An Admin defines when a Doctor is available. The system uses that availability record to generate predefined time slots. Receptionists can only book appointments against these predefined slots, which prevents double-booking at the data level.

```mermaid
flowchart TD
    A([Admin Sets Doctor Availability]) --> B[POST /api/v1/doctors/:id/availability]
    B --> C[DoctorAvailability Created]
    C --> D[System Generates Time Slots]
    D --> E[TimeSlot Records Stored]

    E --> F([Receptionist Books Appointment])
    F --> G[GET Available Slots]
    G --> H[Backend Filters Out Already Booked Slots]
    H --> I[Display Available Slots]
    I --> J[Receptionist Selects Slot]
    J --> K[POST /api/v1/appointments]
    K --> L[Backend Rechecks Slot Availability]
    L --> M{Still Available?}
    M -- Yes --> N([Appointment Created])
    M -- No --> O([409 Conflict · Select Another Slot])
```

---

## 7. Soft Delete Flow

The system uses soft delete across all entities. Records are never permanently removed from the database. Instead, a `deleted_at` timestamp is set on the record. All standard queries automatically exclude soft-deleted records.

```mermaid
flowchart TD
    A([Delete Request Received]) --> B{Entity Type}
    B -- Doctor --> C[Set deleted_at on Doctor Record]
    B -- Patient --> D[Set deleted_at on Patient Record]
    B -- Appointment --> E[Set deleted_at on Appointment Record]

    C --> F[Record Excluded from All Standard Queries]
    D --> F
    E --> F

    F --> G{Query Type}
    G -- Standard Query --> H([Records with deleted_at are Invisible])
    G -- Admin Restore --> I[Fetch Record Including Soft Deleted]
    I --> J[Clear deleted_at Timestamp]
    J --> K([Record Restored and Visible Again])
```

---

## 8. Authentication & RBAC Flow

Every protected request is validated in two stages. First, the JWT token is verified to confirm the user's identity. Second, the user's role is checked against the permitted roles for the requested route.

```mermaid
flowchart TD
    A([Incoming Request]) --> B[Extract JWT from Authorization Header]
    B --> C{Token Present?}
    C -- No --> D([401 Unauthorized])
    C -- Yes --> E[Verify Token Signature and Expiry]
    E --> F{Token Valid?}
    F -- No --> G([401 Unauthorized])
    F -- Yes --> H[Decode User Identity and Role]
    H --> I[RBAC Middleware]
    I --> J{Role Permitted for This Route?}
    J -- No --> K([403 Forbidden])
    J -- Yes --> L([Proceed to Controller])
```

### RBAC Matrix

| Action | Admin | Receptionist | Doctor |
|---|---|---|---|
| Login | ✅ | ✅ | ✅ |
| Manage Doctors | ✅ | ❌ | ❌ |
| Set Doctor Availability | ✅ | ❌ | ❌ |
| Register Patients | ✅ | ✅ | ❌ |
| Book Appointment | ❌ | ✅ | ❌ |
| Reschedule Appointment | ❌ | ✅ | ❌ |
| Cancel Appointment | ❌ | ✅ | ❌ |
| View All Appointments | ✅ | ✅ | ❌ |
| View Own Appointments | ❌ | ❌ | ✅ |
| View Patient Details | ❌ | ❌ | ✅ |
| Add Consultation Notes | ❌ | ❌ | ✅ |
| Mark Appointment Completed | ❌ | ❌ | ✅ |
| View Dashboard | ✅ | ❌ | ❌ |

---

