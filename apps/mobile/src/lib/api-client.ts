const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;
  private onUnauthorized?: () => void;

  setToken(token: string | null) {
    this.token = token;
  }

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.onUnauthorized) {
      this.onUnauthorized();
      throw new ApiError(401, 'Unauthorized');
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new ApiError(response.status, body.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth
  login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Notes
  createNote(topic: string, rawNote: string) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify({ topic, rawNote }),
    });
  }

  getNotes() {
    return this.request('/notes');
  }

  getNote(id: string) {
    return this.request(`/notes/${id}`);
  }

  updateNote(id: string, data: { topic?: string; rawNote?: string }) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteNote(id: string) {
    return this.request(`/notes/${id}`, { method: 'DELETE' });
  }

  generateDeepDive(noteId: string) {
    return this.request(`/notes/${noteId}/deep-dive`, { method: 'POST' });
  }

  // Quiz
  generateQuiz(noteId: string) {
    return this.request('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify({ noteId }),
    });
  }

  getQuiz(id: string) {
    return this.request(`/quizzes/${id}`);
  }

  submitQuiz(id: string, answers: { questionIndex: number; answer: string }[]) {
    return this.request(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // Review
  getReviewQueue() {
    return this.request('/review/queue');
  }
}

export const apiClient = new ApiClient();
