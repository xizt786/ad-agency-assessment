import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Read saved preference from localStorage on first load
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : true; // default is dark
  });

  useEffect(() => {
    // Save preference to localStorage every time it changes
    localStorage.setItem("darkMode", JSON.stringify(isDark));

    // Add or remove 'dark' class on the root <html> element
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return { isDark, toggleDark };
}