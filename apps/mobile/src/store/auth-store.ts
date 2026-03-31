import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../lib/api-client';
import type { AuthResponse, UserResponse } from '@interview/dto';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  init: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        apiClient.setToken(token);
        set({ token, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.login(email, password) as AuthResponse;
      await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
      apiClient.setToken(response.accessToken);
      set({ token: response.accessToken, user: response.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.register(email, password) as AuthResponse;
      await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
      apiClient.setToken(response.accessToken);
      set({ token: response.accessToken, user: response.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    apiClient.setToken(null);
    set({ token: null, user: null });
  },
}));
