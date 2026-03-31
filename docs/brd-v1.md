# Business Requirement Document (BRD)

## Private AI Senior Interview Trainer

Version: 1.0 (MVP – Private Use)
Date: March 2026
Owner: Private Developer (Single User)

---

# 1. Executive Summary

The Private AI Senior Interview Trainer is a mobile application designed to help a senior fullstack developer prepare for technical interviews using their own notes.

The system expands short technical notes into structured, senior-level deep dives, generates interview-style quizzes, evaluates answers, identifies knowledge gaps, and schedules weak topics for review.

This is a private, single-user tool with no commercial or multi-user scope in the MVP phase.

---

# 2. Business Objectives

## 2.1 Primary Objective

Improve interview readiness by strengthening:

- Technical depth
- Trade-off reasoning
- Architecture decision clarity
- Failure-case awareness
- Security thinking
- Articulation under pressure
- Active recall

## 2.2 Success Criteria (MVP Complete When)

1. User can create and persist a technical note.
2. AI expands the note into structured deep content.
3. AI generates a senior-level quiz.
4. User receives structured grading and feedback.
5. Weak topics automatically appear in next-day review.

---

# 3. Problem Statement

Senior-level interviews evaluate:

- Depth of understanding
- Trade-offs and architectural decisions
- Real-world production reasoning
- Clear structured explanations

Generic interview prep tools do not adapt to personal weaknesses or reinforce missed concepts.

There is a need for a personalized learning loop driven by:

- User-owned notes
- AI-generated depth
- Adaptive review scheduling

---

# 4. Scope Definition

## 4.1 In Scope (MVP)

- Create short technical notes
- Expand notes with AI
- Generate 3–5 senior-level quiz questions
- Submit answers and receive structured grading
- Store weak concepts
- Rule-based review scheduling
- Display next-day review list

## 4.2 Out of Scope (MVP)

- Multi-user support
- Team collaboration
- Community content
- Voice interview simulation
- Advanced spaced repetition (FSRS)
- Vector search or embeddings
- Monetization
- Analytics dashboards

---

# 5. Stakeholders

| Stakeholder       | Role                |
| ----------------- | ------------------- |
| Product Owner     | Private Developer   |
| Developer         | Private Developer   |
| AI Provider       | External LLM API    |
| Database Provider | Supabase (Postgres) |

---

# 6. High-Level Architecture

## 6.1 Technology Stack

- Mobile App: React Native (Expo)
- Backend: NestJS (Monolith)
- Database: PostgreSQL (Supabase-hosted)
- AI: Single hosted LLM API
- Auth: Optional (may begin single local user)

## 6.2 Architecture Diagram

[React Native App]
↓
[NestJS Backend API]
↓
[Supabase PostgreSQL]
↓
[LLM API Provider]

## 6.3 Architectural Principles

- Backend controls all AI interactions.
- Mobile app never accesses LLM directly.
- Supabase used only for database hosting.
- Business logic resides entirely in NestJS.
- Minimal architecture, no microservices.

---

# 7. Functional Requirements

## FR-01: Create Note

User must be able to:

- Enter short technical note text.
- Assign a topic/category.
- Save note persistently.

Acceptance Criteria:

- Note persists after reload.
- Unique ID generated.
- Timestamp recorded.

---

## FR-02: Expand Note with AI

System must:

- Send note to backend.
- Generate structured expansion including:
  - Core explanation
  - Trade-offs
  - Failure scenarios
  - Security considerations
  - Performance implications
  - Real-world example
  - Interview traps

Acceptance Criteria:

- Output validated against schema.
- Expansion stored in database.
- Viewable in Note Detail screen.

---

## FR-03: Generate Quiz

System must:

- Generate 3–5 questions:
  - Conceptual
  - Trade-off scenario
  - Failure/debugging scenario
- Include:
  - Expected answer
  - Key scoring points
  - Difficulty (1–5)

Acceptance Criteria:

- Questions stored in database.
- User can navigate and answer.

---

## FR-04: Grade Answer

User submits free-text answer.

System must:

- Score answer (0–10).
- Identify missing concepts.
- Provide concise feedback.
- Update review queue.

Acceptance Criteria:

- Feedback shown immediately.
- Result stored.
- Weakness logic triggered.

---

## FR-05: Review Scheduling (Rule-Based)

Scheduling Logic:

- Score ≥ 8 → Review in 4 days
- Score 5–7 → Review tomorrow
- Score < 5 → Review tomorrow + increase weakness level
- 2 consecutive high scores → Extend interval (7 days)

Acceptance Criteria:

- Topics appear in daily review list.
- Weakness level tracked.

---

# 8. Non-Functional Requirements

## 8.1 Performance

- AI response time < 10 seconds
- App load time < 3 seconds

## 8.2 Security

- LLM API key stored in backend only
- Secure environment variable usage
- CORS configuration enabled

## 8.3 Reliability

- AI JSON schema validation required
- Graceful error handling
- Retry logic limited to 1 retry

## 8.4 Usability

- Maximum 5 screens in MVP
- Study loop < 15 minutes per topic

---

# 9. Data Requirements

## 9.1 Tables

### notes

- id
- topic
- raw_note
- created_at

### note_expansions

- id
- note_id
- structured_content_json
- schema_version
- created_at

### quizzes

- id
- note_id
- questions_json
- schema_version
- created_at

### quiz_answers

- id
- quiz_id
- user_answer
- score
- missing_concepts_json
- created_at

### review_queue

- note_id
- next_review_at
- weakness_level
- streak
- status

---

# 10. Assumptions

- Single-user system
- Internet required
- AI provider stable
- Daily usage expected (5–20 minutes)

---

# 11. Risks & Mitigation

| Risk                   | Impact | Mitigation                   |
| ---------------------- | ------ | ---------------------------- |
| AI inconsistent output | Medium | Enforce strict JSON schema   |
| High API cost          | Medium | Cache expansions and quizzes |
| Overengineering        | High   | Enforce MVP boundaries       |
| Low daily engagement   | High   | Keep loop minimal            |

---

# 12. MVP Development Roadmap

## Week 1

- Setup Expo app
- Setup NestJS backend
- Setup Supabase DB
- Implement Create Note

## Week 2

- Implement Expand Note endpoint
- Store structured expansion
- Build Note Detail screen

## Week 3

- Implement Quiz generation
- Build Quiz screen
- Implement grading endpoint

## Week 4

- Implement review scheduling
- Build Review screen
- Prompt tuning
- UI polish

---

# 13. Completion Criteria

MVP is complete when:

- End-to-end study loop works.
- AI expansion is structured and useful.
- Quiz generation is senior-level.
- Grading provides actionable feedback.
- Weak topics reappear in review queue.
- Daily usage feels frictionless.

---

# 14. Future Phase Considerations (Post-MVP)

- Smarter spaced repetition (FSRS)
- Weak concept micro-reviews
- Interview articulation mode
- Topic linking
- Advanced prompt tuning

---

End of BRD.
