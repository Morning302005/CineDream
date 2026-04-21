import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBar({ initial = "" }: { initial?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
      }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search any movie…"
        className="w-full pl-14 pr-32 py-4 rounded-full bg-card border-2 border-border focus:border-primary focus:outline-none focus:shadow-[var(--shadow-glow)] transition-all text-base"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        Search
      </button>
    </form>
  );
}
