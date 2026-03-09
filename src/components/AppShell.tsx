"use client";

import { usePathname } from "next/navigation";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LanguageToggle } from "./LanguageToggle";
import { GuestGate } from "./GuestGate";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
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
