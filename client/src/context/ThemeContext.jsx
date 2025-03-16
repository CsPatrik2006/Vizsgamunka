import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const ThemeContext = createContext(null);

// Create the hook first as a named function
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Create the provider component as a named function
function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  
  // Load theme preference on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
    setThemeLoaded(true);
  }, []);

  // Save theme preference whenever it changes
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

// Export both as named exports
export { ThemeProvider, useTheme };