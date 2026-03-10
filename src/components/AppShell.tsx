"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LanguageToggle } from "./LanguageToggle";
import { GuestGate } from "./GuestGate";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname.startsWith("/admin");
  const isRsvpWithToken = pathname === "/rsvp" && !!searchParams.get("token");

  if (isAdmin) {
    return <>{children}</>;
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
