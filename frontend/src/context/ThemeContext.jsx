import { createContext, useState, useEffect, useContext } from 'react';

// 3 modes: 'system' | 'light' | 'dark'
export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('sc-theme-mode') || 'system';
  });

  // Derived dark boolean based on mode
  const isDark = (m) => {
    if (m === 'dark') return true;
    if (m === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [dark, setDark] = useState(() => isDark(localStorage.getItem('sc-theme-mode') || 'system'));

  // Apply dark class to <html> whenever mode changes
  useEffect(() => {
    const applyTheme = (currentMode) => {
      const shouldBeDark = isDark(currentMode);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setDark(shouldBeDark);
    };

    applyTheme(mode);

    // If system mode — listen for OS preference changes
    if (mode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
  }, [mode]);

  // Cycle: system → light → dark → system
  const cycleMode = () => {
    setMode(prev => {
      const next = prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
      if (next === 'system') {
        localStorage.removeItem('sc-theme-mode');
      } else {
        localStorage.setItem('sc-theme-mode', next);
      }
      return next;
    });
  };

  // Direct set — for dropdown/menu selection
  const setThemeMode = (newMode) => {
    if (newMode === 'system') {
      localStorage.removeItem('sc-theme-mode');
    } else {
      localStorage.setItem('sc-theme-mode', newMode);
    }
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ dark, mode, cycleMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
