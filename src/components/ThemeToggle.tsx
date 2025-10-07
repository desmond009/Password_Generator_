"use client";

import { useEffect, useState } from "react";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored === "light" || stored === "dark" ? (stored as "light" | "dark") : (getSystemPrefersDark() ? "dark" : "light");
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <button
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggle}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      {theme === "dark" ? (
        // sun icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 18a6 6 0 100-12 6 6 0 000 12z"/><path d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zm0 16.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V19.5a.75.75 0 01.75-.75zM4.81 4.81a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06L4.81 5.87a.75.75 0 010-1.06zm12.27 12.27a.75.75 0 011.06 0l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM1.5 12a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H2.25A.75.75 0 011.5 12zm16.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM4.81 19.19a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06L5.87 19.19a.75.75 0 01-1.06 0zm12.27-12.27a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06L18.14 7.92a.75.75 0 01-1.06 0z"/>
        </svg>
      ) : (
        // moon icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M21.752 15.002A9 9 0 1111.25 2.248a.75.75 0 01.86.994 7.5 7.5 0 009.648 9.648.75.75 0 01.994.86z" />
        </svg>
      )}
    </button>
  );
}


