import { create } from "zustand";
import { User } from "../types";
import { saveAuthToken, removeAuthToken, saveUserData, getUserData, clearStorage } from "../utils/storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (token: string, user: User) => {
    await saveAuthToken(token);
    await saveUserData(user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await clearStorage();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const storedUser = await getUserData();
      if (storedUser) {
        set({ user: storedUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
