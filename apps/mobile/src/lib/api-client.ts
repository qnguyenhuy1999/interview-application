const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  register(email: string, password: string) {
    return this.request('/auth/register', { method: 'POST', body: { email, password } });
  }

  login(email: string, password: string) {
    return this.request('/auth/login', { method: 'POST', body: { email, password } });
  }

  // Notes
  createNote(topic: string, rawNote: string) {
    return this.request('/notes', { method: 'POST', body: { topic, rawNote } });
  }

  getNotes() {
    return this.request('/notes');
  }

  getNote(id: string) {
    return this.request(`/notes/${id}`);
  }

  updateNote(id: string, data: { topic?: string; rawNote?: string }) {
    return this.request(`/notes/${id}`, { method: 'PUT', body: data });
  }

  deleteNote(id: string) {
    return this.request(`/notes/${id}`, { method: 'DELETE' });
  }

  generateDeepDive(noteId: string) {
    return this.request(`/notes/${noteId}/deep-dive`, { method: 'POST' });
  }

  // Quiz
  generateQuiz(noteId: string) {
    return this.request('/quizzes/generate', { method: 'POST', body: { noteId } });
  }

  getQuiz(id: string) {
    return this.request(`/quizzes/${id}`);
  }

  submitQuiz(id: string, answers: { questionIndex: number; answer: string }[]) {
    return this.request(`/quizzes/${id}/submit`, { method: 'POST', body: { answers } });
  }

  // Review
  getReviewQueue() {
    return this.request('/review/queue');
  }
}

export const apiClient = new ApiClient();
