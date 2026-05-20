import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AdminThemeContextType {
  isDark:      boolean;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  isDark:      false,
  toggleTheme: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

export const AdminThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("nexkart-admin-theme") === "dark"
  );

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("nexkart-admin-theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-admin-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);

  return (
    <AdminThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};