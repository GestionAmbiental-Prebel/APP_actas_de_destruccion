"use client";

import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { toggleTheme, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="border-b-4 hover:border-current border-transparent flex gap-1 items-center"
    >
      {theme === "dark" ? "Claro ☀️" : "Oscuro 🌙"}
    </button>
  );
}
