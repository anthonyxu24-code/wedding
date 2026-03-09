"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "guest_authenticated";
const GUEST_PASSWORD = process.env.NEXT_PUBLIC_GUEST_PASSWORD;

export function GuestGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GUEST_PASSWORD) {
      setAuthenticated(true);
      return;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setAuthenticated(stored === "true");
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password === GUEST_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setAuthenticated(true);
    } else {
      setError("Incorrect password");
    }
  }

  if (authenticated === null) return null;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-xs text-center space-y-6">
          <div>
            <h1 className="font-serif text-2xl text-[var(--foreground)] mb-1">Cindy & Anthony</h1>
            <p className="text-sm text-[var(--muted)]">Please enter the password to continue</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-center text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-zinc-400"
            autoFocus
          />
          {error && <p className="text-sm text-red-600/90">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 text-sm border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
