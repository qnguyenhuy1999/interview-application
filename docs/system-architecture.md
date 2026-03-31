# 📱 AI Interview Trainer -- System Architecture Document

---

# 1\. High-Level System Overview

## Architecture Style

Client--Server Architecture (Modular Monolith Backend)

Optimized for:

- Simplicity
- Maintainability
- Free-tier deployment
- Single-user private usage

---

## Logical Architecture Diagram

[ Expo Mobile App ]\
 |\
 | HTTPS (REST API)\
 v\
[ NestJS Backend API ]\
 |\
 |-- Supabase (PostgreSQL)\
 |-- External LLM API (OpenAI)

---

## Core Components

### 1\. Mobile Client (Expo)

- Note creation and editing
- AI deep-dive trigger
- Quiz answering interface
- Knowledge gap review page
- Token-based authentication

### 2\. Backend (NestJS)

- REST API
- Authentication management
- AI orchestration
- Quiz generation
- Answer evaluation
- Knowledge gap extraction
- Business logic enforcement

### 3\. Database (Supabase - PostgreSQL only)

- Users
- Notes
- AI explanations
- Quizzes
- Quiz attempts
- Knowledge gaps

### 4\. AI Service

- OpenAI API
- Prompt templates managed in backend
- Deep dive generation
- Quiz generation
- Weakness analysis

---

# 2\. Technology Stack

## Frontend (Mobile)

| Layer            | Technology              | Reason                         |
| ---------------- | ----------------------- | ------------------------------ |
| Framework        | Expo (React Native)     | Fast development & OTA updates |
| State Management | Zustand / Redux Toolkit | Lightweight & predictable      |
| API Client       | Axios / Fetch           | Simple REST communication      |
| Secure Storage   | Expo SecureStore        | Store JWT securely             |

---

## Backend

| Layer          | Technology      | Reason                    |
| -------------- | --------------- | ------------------------- |
| Framework      | NestJS          | Structured & scalable     |
| ORM            | Prisma          | Type-safe schema          |
| Authentication | JWT             | Controlled authentication |
| Validation     | class-validator | Clean DTO validation      |
| AI SDK         | OpenAI Node SDK | Direct LLM integration    |

---

## Database

| Layer      | Technology           |
| ---------- | -------------------- |
| Primary DB | Supabase PostgreSQL  |
| Search     | PostgreSQL ILIKE     |
| Caching    | Not required for MVP |

---

## Deployment (Free Tier Friendly)

### Backend

- Render (Free tier) -- Recommended
- Railway (Alternative)

### Database

- Supabase Free Tier

### Mobile

- Expo + EAS Free Tier

---

# 3\. System Interfaces & APIs

## Authentication

POST /auth/register\
POST /auth/login

---

## Notes

POST /notes\
GET /notes\
GET /notes/:id\
PUT /notes/:id\
DELETE /notes/:id

---

## AI Deep Dive

POST /notes/:id/deep-dive

---

## Quiz

POST /notes/:id/generate-quiz\
GET /quizzes/:id\
POST /quizzes/:id/submit

---

## Knowledge Gap

GET /knowledge-gaps

---

# 4\. Data Model (Logical ER Diagram)

User\
 └── id\
 └── email\
 └── password_hash\
 └── created_at

Note\
 └── id\
 └── user_id (FK)\
 └── title\
 └── content\
 └── ai_explanation\
 └── created_at

Quiz\
 └── id\
 └── note_id (FK)\
 └── questions (JSON)\
 └── created_at

QuizAttempt\
 └── id\
 └── quiz_id (FK)\
 └── answers (JSON)\
 └── score\
 └── created_at

KnowledgeGap\
 └── id\
 └── note_id (FK)\
 └── topic\
 └── description\
 └── resolved (boolean)\
 └── created_at

---

# 5\. Scalability & Reliability Strategy

## MVP Scope

- Single backend instance
- No caching layer
- No message queue
- Vertical database scaling

---

## Future Scaling Options

| Concern           | Strategy                     |
| ----------------- | ---------------------------- |
| AI cost control   | Rate limiting                |
| Backend scaling   | Horizontal auto-scaling      |
| Database growth   | Supabase vertical scaling    |
| High traffic      | Add Redis + queue system     |
| Consistency model | CP (Consistency prioritized) |

---

# 6\. Security & Compliance

## Authentication

- JWT Access Token
- Password hashing using bcrypt

## Authorization

- All queries filtered by `user_id`
- Single-user isolation

## Data Protection

- HTTPS enforced
- API keys stored in backend environment variables
- No secrets stored in client

## Additional Protections

- Rate limiting on AI endpoints
- Input validation
- Basic OWASP best practices

---

# 7\. AI Processing Flow

## Deep Dive Flow

User creates note\
 ↓\
User clicks "Deep Dive"\
 ↓\
Backend builds structured prompt\
 ↓\
Send to OpenAI API\
 ↓\
Store explanation in DB\
 ↓\
Return response to client

---

## Quiz Generation Flow

Note + AI Explanation\
 ↓\
Backend generates structured quiz via AI\
 ↓\
Store quiz JSON\
 ↓\
Return to client

---

## Answer Evaluation

Two approaches:

- Deterministic comparison (for multiple choice)
- AI-based evaluation (for open-ended answers)

---

# 8\. Migration / Future Evolution Plan

If transitioning to SaaS:

- Multi-user role system
- Redis caching
- Background job queue (BullMQ)
- Vector search (pgvector)
- Semantic search
- Kubernetes deployment

---

# 9\. MVP Phased Roadmap

## Phase 1 -- Core Foundation (Week 1--2)

- Authentication (JWT)
- Notes CRUD
- Supabase integration
- Basic Expo UI

---

## Phase 2 -- AI Integration (Week 3)

- Deep dive endpoint
- Prompt template system
- Store AI explanation

---

## Phase 3 -- Quiz Engine (Week 4)

- AI-generated quizzes
- Quiz submission
- Scoring logic

---

## Phase 4 -- Knowledge Gap System (Week 5)

- Extract weak topics
- Review page
- Improve AI prompts

---

# 10\. Non-Functional Requirements (NFRs)

| Category         | Requirement                      |
| ---------------- | -------------------------------- |
| Performance      | < 2s API response (excluding AI) |
| AI Response Time | < 15s                            |
| Availability     | 99% acceptable                   |
| Security         | OWASP basic compliance           |
| Maintainability  | Modular NestJS                   |
| Cost             | $0 during MVP                    |
| Backup           | Supabase automatic backups       |

---

# Final MVP Architecture

[ Expo Mobile App ]\
 |\
 v\
[ NestJS API - Render ]\
 |\
 |---- Supabase (Postgres)\
 |\
 |---- OpenAI API

---

# Architectural Summary

This solution is:

- Minimal but scalable
- Cost-efficient
- Production-capable
- Not over-engineered
- Extendable to SaaS
- Ideal for a personal AI interview trainer
