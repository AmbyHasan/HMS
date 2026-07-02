# 🏥 Hospital Management System (Backend)

A scalable Hospital Management System backend built with **Node.js**, **Express.js**, **PostgreSQL**, and **AWS**. The application follows a layered architecture and uses **Amazon SQS** with background workers for asynchronous notification processing.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Login & Logout
- Forgot Password via Email

### 👨‍⚕️ Doctor Management
- CRUD Operations
- Weekly Doctor Availability
- Automatic Time Slot Generation

### 👤 Patient Management
- CRUD Operations
- Patient Registration

### 📅 Appointment Management
- Book Appointment
- Cancel Appointment
- Reschedule Appointment
- View Available Slots
- Double Booking Prevention

### 📝 Consultation Management
- Create Consultation Notes
- One Consultation per Appointment

### 📧 Notification Service
- Amazon SQS Integration
- PM2 Background Worker
- Long Polling
- Email Notifications using Nodemailer

---

# 🏗️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- Amazon SQS
- AWS EC2
- PM2
- Nginx
- Nodemailer

---

# 📂 Architecture

The project follows a layered architecture:

```text
Routes
   │
Middleware
   │
Controllers
   │
Services
   │
Repositories
   │
PostgreSQL
```

Notification processing is decoupled from the request lifecycle using **Amazon SQS** and a dedicated background worker.

---

# 📦 Core Modules

- Authentication
- Doctor Management
- Patient Management
- Doctor Availability
- Time Slot Management
- Appointment Management
- Consultation Management
- Notification Service

---

# 📊 Database Entities

- Hospital
- User
- Doctor
- Patient
- Doctor Availability
- Time Slot
- Appointment
- Consultation

---

# 🔄 Notification Flow

```text
Appointment Event
        │
        ▼
Amazon SQS
        │
        ▼
Notification Worker
        │
        ▼
SMTP Provider
        │
        ▼
Patient Email
```

---

# 🛡️ Key Architectural Features

- Layered Architecture
- Repository Pattern
- Soft Deletes (Paranoid Tables)
- UUID-based Primary Keys
- RESTful APIs
- Dynamic Time Slot Generation
- Amazon SQS-based Asynchronous Processing
- PM2-managed Background Worker
- Long Polling
- Database-level Double Booking Prevention
- Multi-Hospital Ready Database Design

---

# ⚙️ Getting Started

## Clone the Repository

```bash
git clone <repository-url>
cd hospital-management-system-backend
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file:

```env
PORT=

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

JWT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SQS_QUEUE_URL=
```

## Run the API Server

```bash
npm run dev
```

## Run the Notification Worker

```bash
npm run worker
```

---
## Author
Amber Hasan
