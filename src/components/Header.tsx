import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme, type Theme } from "@/lib/theme";
import { Moon, Sun, Film } from "lucide-react";

export function Header() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Film className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-display text-2xl font-bold tracking-tight">
            Cine<span className="text-primary">Vault</span>
          </span>
        </Link>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="relative w-11 h-11 rounded-full border border-border bg-card hover:bg-secondary transition-all hover:shadow-[var(--shadow-glow)] flex items-center justify-center"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-primary" />
          ) : (
            <Moon className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>
    </header>
  );
}
