# Hospital Management System (HMS) — Scaling Architecture

## 1. Current Architecture

Today, the entire system runs on a **single EC2 instance**. PM2 manages two independent Node.js processes, and PostgreSQL runs locally on the same box.

```mermaid
flowchart TB
    User([User]) --> Nginx[Nginx]

    subgraph EC2["Single EC2 Instance"]

        Nginx --> PM2Processes["PM2"]

        subgraph PM2Processes["PM2"]
            API["Process 1:<br/>API Server"]
            Worker["Process 2:<br/>Notification Worker"]
        end

        PG[(PostgreSQL)]

        API -->|Read / Write| PG
    end

    API -->|Publish Event| SQS[(Amazon SQS)]
    Worker -->|Long Poll| SQS
    Worker -->|Send Email| SMTP[SMTP Provider]
```

**Limitation:** All components share one machine's CPU, memory, and network — API traffic, background worker load, and the database all compete for the same resources.

---

## 2. Horizontal Scaling

Instead of one EC2 instance, we deploy **multiple EC2 instances behind a Load Balancer**. Each instance runs the same PM2 process layout 

```mermaid
flowchart TB
    User([User]) --> LB[Load Balancer]

    LB --> EC2A["EC2 Instance A (PM2)"]
    LB --> EC2B["EC2 Instance B (PM2)"]
    LB --> EC2C["EC2 Instance C (PM2)"]

    EC2A --> PG[(Shared PostgreSQL)]
    EC2B --> PG
    EC2C --> PG
```

**Key point:** PostgreSQL remains a single shared instance; only the API/Worker layer scales horizontally.

---

## 3. PM2 Process Layout

On **every** EC2 instance, PM2 manages the same two processes as today. They are fully **independent** — one does not depend on the other's runtime state.

```mermaid
flowchart TB
    subgraph EC2["Each EC2 Instance"]
        PM2[PM2 Process Manager]
        PM2 --> P1["Process 1: API Server"]
        PM2 --> P2["Process 2: Notification Worker"]
    end

```

- **Process 1 (API Server):** handles HTTP requests from the Load Balancer.
- **Process 2 (Notification Worker):** long-polls SQS independently, regardless of API load.

---

## 4. Shared Amazon SQS

All API Server processes — across all EC2 instances — publish notification events into **one shared SQS queue**. There is no per-instance or per-EC2 queue.

```mermaid
flowchart LR
    API_A["API Server (EC2 A)"] --> SQS[(Shared Amazon SQS Queue)]
    API_B["API Server (EC2 B)"] --> SQS
    API_C["API Server (EC2 C)"] --> SQS
```

**Why one shared queue:** it decouples notification production from consumption and lets any worker on any instance pick up any message — this is what enables the worker fleet to scale independently of the API fleet.

---

## 5. Message Distribution

Multiple Notification Workers, running on different EC2 instances, all long-poll the **same** shared queue. SQS distributes messages across the available workers.

```mermaid
flowchart LR
    SQS[(Shared Amazon SQS Queue)]

    SQS -- Message 1 --> WA["Worker A (EC2 A)"]
    SQS -- Message 2 --> WB["Worker B (EC2 B)"]
    SQS -- Message 3 --> WC["Worker C (EC2 C)"]
```

SQS guarantees **At-Least-Once Delivery** — a message may occasionally be delivered more than once, but it will never be silently dropped.

---

## 6. Worker Failure

If a Notification Worker crashes after receiving a message but **before calling `DeleteMessage()`**, Amazon SQS does not remove the message from the queue. Instead, the message remains hidden for the duration of the **Visibility Timeout**. Once the timeout expires, the message becomes visible again and can be processed by another worker.

```mermaid
sequenceDiagram
    participant SQS as Amazon SQS
    participant W1 as Worker A
    participant W2 as Worker B

    SQS-->>W1: Deliver Message
    Note over W1: Processes notification
    Note over W1: Worker crashes before calling DeleteMessage()

    Note over SQS: Visibility Timeout expires
    SQS-->>W2: Redeliver Message

    W2->>SQS: DeleteMessage()
```

**Result:** The same notification may be delivered to another worker, potentially resulting in a duplicate email.

This behavior is expected because Amazon SQS provides **At-Least-Once Delivery**. The next section explains how **eventId-based idempotency** prevents duplicate notification processing.

---

## 7. Idempotent Notification Processing

Because SQS provides At-Least-Once Delivery, and multiple workers now poll the same queue, the **same notification event could be processed more than once**. To prevent duplicate emails, every event carries an `eventId`, and a new table tracks processed events.

### New Table: `notification_logs`

| Column           | Description                        |
|------------------|-------------------------------------|
| `id`             | Primary key                        |
| `event_id`       | Unique identifier from the event   |
| `event_type`     | Type of notification               |
| `recipient_email`| Target email address                |
| `status`         | Processing status                  |
| `processed_at`   | Timestamp of processing            |
| `created_at`     | Record creation timestamp          |

### Worker Processing Flow

```mermaid
flowchart TD
    A[Receive Message] --> B[Check notification_logs for eventId]
    B --> C{eventId already exists?}
    C -- Yes --> D[Delete SQS Message]
    C -- No --> E[Send Email via SMTP]
    E --> F[Insert event into notification_logs]
    F --> G[Delete SQS Message]
```

This makes notification processing **idempotent**: regardless of how many times a message is redelivered, the recipient receives the email only once.

---

## 8. End-to-End Scaled Architecture

Combining all the above, this is the complete scaled HMS architecture.

```mermaid
flowchart TB
    User([User]) --> LB[Load Balancer]

    LB --> EC2A
    LB --> EC2B

    subgraph EC2A["EC2 Instance A"]
        PM2A[PM2]
        PM2A --> API_A["Process 1: API Server"]
        PM2A --> WORKER_A["Process 2: Notification Worker"]
    end

    subgraph EC2B["EC2 Instance B"]
        PM2B[PM2]
        PM2B --> API_B["Process 1: API Server"]
        PM2B --> WORKER_B["Process 2: Notification Worker"]
    end

    API_A --> PG[(Shared PostgreSQL)]
    API_B --> PG

    API_A --> SQS[(Shared Amazon SQS)]
    API_B --> SQS

    WORKER_A --> SQS
    WORKER_B --> SQS

    WORKER_A --> SMTP[SMTP Provider]
    WORKER_B --> SMTP

    WORKER_A --> PG
    WORKER_B --> PG
```

**Summary of scaling changes:**

| Component            | Before             | After                                      |
|-----------------------|---------------------|---------------------------------------------|
| EC2                   | Single instance     | Multiple instances behind a Load Balancer   |
| API Server             | One process         | One process per EC2 instance                |
| Notification Worker    | One process         | One process per EC2 instance                |
| PostgreSQL             | Local, single       | Shared, single (unchanged)                  |
| Amazon SQS              | Single queue        | Same single shared queue (unchanged)        |
| Duplicate handling      | None                | `notification_logs` + `eventId` idempotency |

