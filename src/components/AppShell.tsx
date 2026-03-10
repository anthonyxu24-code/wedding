"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LanguageToggle } from "./LanguageToggle";
import { GuestGate } from "./GuestGate";

const OPEN_PATHS = ["/", "/rsvp"];

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const isAdmin = pathname.startsWith("/admin");
  const isRsvpWithToken = pathname === "/rsvp" && !!token;
  const isOpenPath = OPEN_PATHS.includes(pathname);

  const [hasRsvped, setHasRsvped] = useState<boolean | null>(null);

  useEffect(() => {
    if (token) {
      try { localStorage.setItem("rsvpToken", token); } catch {}
    }
  }, [token]);

  useEffect(() => {
    try {
      setHasRsvped(localStorage.getItem("hasRsvped") === "1");
    } catch {
      setHasRsvped(false);
    }
  }, []);

  useEffect(() => {
    if (hasRsvped === false && !isAdmin && !isOpenPath) {
      router.replace("/");
    }
  }, [hasRsvped, isAdmin, isOpenPath, router]);

  if (isAdmin) {
    return <>{children}</>;
  }

  if (!isOpenPath && hasRsvped === false) {
    return null;
  }

  if (isRsvpWithToken) {
    return (
      <LocaleProvider>
        <LanguageToggle />
        {children}
      </LocaleProvider>
    );
  }

  return (
    <GuestGate>
      <LocaleProvider>
        <LanguageToggle />
        {children}
      </LocaleProvider>
    </GuestGate>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
