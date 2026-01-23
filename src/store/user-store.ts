import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Api } from '@/lib/api';

interface User {
  id?: string;
  name?: string;
  email?: string;
  team?: string;
  [key: string]: any;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      fetchUser: async () => {
        const currentUser = get().user;

        set({ isLoading: true, error: null });
        try {
          const response = await Api.get('user');
          if (response?.data) {
            set({ user: response.data, isLoading: false });
          } else {
            throw new Error('Invalid response');
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          const message =
            err instanceof Error
              ? err.message
              : typeof err === 'string'
              ? err
              : 'Failed to fetch user data';
          set({ error: message, isLoading: false });
        }
      },
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, error: null }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }), // persist only user
    }
  )
);
