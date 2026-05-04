import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'trackorasen-theme';
export const THEMES = ['sakura', 'manga', 'nightink'];

export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return THEMES.includes(stored) ? stored : 'sakura';
    } catch {
      return 'sakura';
    }
  });

  useEffect(() => {
    document.body.className = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const setTheme = useCallback((t) => {
    if (THEMES.includes(t)) setThemeState(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState(prev => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  return { theme, setTheme, toggle };
};
