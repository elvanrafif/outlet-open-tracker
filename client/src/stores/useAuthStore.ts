import { create } from 'zustand';
import type { User } from '@/types/index';
import { pb } from '@/lib/pb';

interface AuthStore {
  user: User | null;
  isValid: boolean;
  setUser: (user: User | null) => void;
  setIsValid: (isValid: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isValid: pb.authStore.isValid, // Ambil status awal langsung dari PocketBase
  setUser: (user) => set({ user }),
  setIsValid: (isValid) => set({ isValid }),
}));
