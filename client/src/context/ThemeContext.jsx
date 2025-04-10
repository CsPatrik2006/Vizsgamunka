import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (themeLoaded) {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
  }, [darkMode, themeLoaded]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const value = {
    darkMode,
    toggleTheme,
    themeLoaded
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeProvider, useTheme };