// ============================================================
// Auth
// ============================================================

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
}

// ============================================================
// Notes
// ============================================================

export interface CreateNoteRequest {
  topic: string;
  rawNote: string;
}

export interface UpdateNoteRequest {
  topic?: string;
  rawNote?: string;
}

export interface NoteResponse {
  id: string;
  topic: string;
  rawNote: string;
  hasExpansion: boolean;
  hasQuiz: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDetailResponse extends NoteResponse {
  expansion?: ExpansionResponse;
}

export interface ExpansionResponse {
  id: string;
  structuredContent: StructuredContent;
  schemaVersion: string;
  createdAt: string;
}

export interface StructuredContent {
  definition: string;
  whyItExists: string;
  coreConcepts: string[];
  internalMechanics: string;
  codeExample: string;
  performanceConsiderations: string;
  tradeoffs: string[];
  commonInterviewQuestions: string[];
  realWorldExample: string;
  commonMistakes: string[];
}

// ============================================================
// Deep Dive (AI Expansion)
// ============================================================

export interface GenerateDeepDiveRequest {
  noteId: string;
}

export interface DeepDiveResponse {
  expansion: ExpansionResponse;
}

// ============================================================
// Quiz
// ============================================================

export interface GenerateQuizRequest {
  noteId: string;
}

export interface QuizResponse {
  id: string;
  noteId: string;
  questions: QuizQuestion[];
  schemaVersion: string;
  createdAt: string;
}

export interface QuizQuestion {
  type: 'multiple_choice' | 'open_ended';
  question: string;
  options?: string[];
  correctAnswer?: string;
  expectedKeyPoints?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SubmitQuizAnswerRequest {
  quizId: string;
  answers: QuizAnswerSubmission[];
}

export interface QuizAnswerSubmission {
  questionIndex: number;
  answer: string;
}

export interface QuizGradeResponse {
  quizId: string;
  results: QuestionResult[];
  overallScore: number;
  createdAt: string;
}

export interface QuestionResult {
  questionIndex: number;
  score: number;
  missingConcepts: string[];
  feedback: string;
}

// ============================================================
// Knowledge Gap / Review
// ============================================================

export interface KnowledgeGapResponse {
  id: string;
  noteId: string;
  topic: string;
  missingConcepts: string[];
  weaknessLevel: number;
  nextReviewAt: string;
  status: string;
}

export interface ReviewQueueResponse {
  items: KnowledgeGapResponse[];
}

// ============================================================
// Common
// ============================================================

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
