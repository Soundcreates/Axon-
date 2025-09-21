"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = theme === "system" ? systemTheme : theme;
  if (!mounted) return null;
  return (
    <button
      aria-label="Toggle theme"
      className="rounded-xl px-3 py-2 border border-border bg-card/70 hover:bg-card/90 focusable"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
    >
      <span className="inline-flex items-center gap-2 text-sm">
        {current === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        {current === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
