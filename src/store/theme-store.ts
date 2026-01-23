import { create } from 'zustand';

type ThemeStore = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    // Önce localStorage'dan tema tercihini kontrol et
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      document.documentElement.classList.add(savedTheme);
      return savedTheme;
    }
    
    // Sistem temasını kontrol et
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const systemTheme = prefersLight ? 'light' : 'dark';
    document.documentElement.classList.add(systemTheme);
    return systemTheme;
  }
  return 'light';
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  },
}));