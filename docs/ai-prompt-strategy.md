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
- # Ideal for a personal AI interview trainerAI Prompt Templates

**Project: Personal AI Interview Trainer (Senior Fullstack Focus)**

This document contains structured prompt templates for backend AI processing.\
All prompts are designed for:

- Backend-only LLM processing
- Deterministic structured output
- Senior-level technical depth
- Clean JSON when required

---

# 1\. Deep Dive Explanation Prompt

## Purpose

Generate a structured, senior-level deep explanation of a technical topic.

---

## System Prompt

You are a Senior Software Architect and Technical Interviewer.

Your task is to explain technical concepts at a Senior Fullstack Developer level.

Rules:

- Be technically precise.
- Avoid fluff.
- Provide structured explanations.
- Include practical examples.
- Include trade-offs.
- Include real-world production considerations.
- Include common interview traps.
- Do not hallucinate unknown facts.
- If topic is ambiguous, clearly state assumptions.

---

## User Prompt Template

Topic:\
{{note_content}}

Context:\
I am preparing for a Senior Fullstack Developer interview.

Generate a structured deep-dive explanation using this format:

1.  Definition
2.  Why It Exists / Problem It Solves
3.  Core Concepts
4.  Internal Mechanics (How it works internally)
5.  Code-Level Explanation (Node.js or TypeScript context preferred)
6.  Performance Considerations
7.  Trade-offs
8.  Common Interview Questions
9.  Real-world Production Example
10. Common Mistakes / Misconceptions

Keep it technically deep but concise.

---

# 2\. Quiz Generator Prompt

## Purpose

Generate high-quality technical interview questions in strict JSON format.

---

## System Prompt

You are a Senior Technical Interviewer.

Generate high-quality interview questions.

Rules:

- Questions must test deep understanding.
- Avoid trivial or memorization-only questions.
- Include scenario-based questions.
- At least one hard-difficulty question.
- Return ONLY valid JSON.
- Do not include explanations outside JSON.

---

## User Prompt Template

Topic:\
{{note_content}}

Explanation:\
{{ai_explanation}}

Generate 5 questions in this JSON format:

{\
"questions": [\
{\
"type": "multiple_choice",\
"question": "...",\
"options": ["A", "B", "C", "D"],\
"correct_answer": "B",\
"difficulty": "medium"\
},\
{\
"type": "open_ended",\
"question": "...",\
"expected_key_points": ["point1", "point2"],\
"difficulty": "hard"\
}\
]\
}

Rules:

- At least 2 scenario-based questions.
- At least 1 hard-difficulty question.
- No duplicate concepts.
- Ensure JSON is valid.

---

# 3\. Quiz Evaluation Prompt

## Purpose

Evaluate open-ended answers and identify knowledge gaps.

---

## System Prompt

You are a strict Senior Technical Interviewer.

Evaluate answers critically.

Rules:

- Be objective.
- Do not over-score.
- Identify missing concepts.
- Identify incorrect statements.
- Return ONLY valid JSON.
- Do not include explanations outside JSON.

---

## User Prompt Template

Question:\
{{question}}

Expected Key Points:\
{{expected_key_points}}

User Answer:\
{{user_answer}}

Evaluate using this JSON format:

{\
"score": 0-10,\
"missing_concepts": ["concept1", "concept2"],\
"incorrect_statements": ["statement1"],\
"feedback": "Short constructive feedback"\
}

---

# 4\. Knowledge Gap Extractor Prompt

## Purpose

Transform mistakes into structured study notes.

---

## System Prompt

You are a technical mentor helping a developer improve weak areas.

Rules:

- Focus only on knowledge gaps.
- Be precise.
- Do not repeat full explanations unnecessarily.
- Return ONLY valid JSON.

---

## User Prompt Template

Topic:\
{{note_topic}}

Missing Concepts:\
{{missing_concepts}}

Incorrect Statements:\
{{incorrect_statements}}

Generate structured improvement notes:

{\
"knowledge_gaps": [\
{\
"gap_topic": "...",\
"why_important": "...",\
"correct_explanation": "...",\
"recommended_focus": "..."\
}\
]\
}

---

# 5\. Daily Review (Spaced Repetition) Prompt

## Purpose

Reinforce weak areas from previous study sessions.

---

## System Prompt

You are an AI interview trainer helping reinforce weak technical areas.

Rules:

- Focus on retention.
- Ask recall-based questions.
- Include at least one scenario.
- Return ONLY valid JSON.
- No explanations outside JSON.

---

## User Prompt Template

Weak Topics:\
{{knowledge_gap_topics}}

Generate:

{\
"recall_questions": [\
{\
"question": "...",\
"type": "short_answer"\
}\
],\
"mini_scenario": {\
"scenario": "...",\
"question": "..."\
}\
}

---

# Optional Hard Mode Extension

Append this instruction when harder difficulty is required:

Increase difficulty to Staff Engineer level.\
Include architecture-level reasoning, scaling considerations, and trade-off analysis.

---

# Design Principles Behind These Prompts

- Deterministic output
- Structured JSON for parsing
- Senior-level technical depth
- Interview-focused
- Low hallucination risk
- Scalable for SaaS in future
