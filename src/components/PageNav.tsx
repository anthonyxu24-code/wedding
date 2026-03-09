"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/rsvp", key: "rsvp" },
  { href: "/registry", key: "registry" },
  { href: "/details", key: "details" },
  { href: "/location", key: "location" },
] as const;

function NavIcon({ itemKey, size = 18 }: { itemKey: string; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (itemKey) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "rsvp":
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <polyline points="22 7 12 13 2 7" />
        </svg>
      );
    case "registry":
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="M12 8V21" />
          <path d="M3 13h18" />
          <path d="M7.5 8C7.5 8 7 2 12 2s4.5 6 4.5 6" />
        </svg>
      );
    case "details":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "location":
      return (
        <svg {...props}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    default:
      return null;
  }
}

export function PageNav() {
  const pathname = usePathname();
  const { lang } = useLocale();

  return (
    <>
      {/* Desktop — horizontal top bar */}
      <nav className="hidden md:flex items-center justify-center gap-1 py-4 px-4 bg-[#fafaf9]/95 backdrop-blur-sm sticky top-0 z-40">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-4 py-2 text-sm rounded-full transition-all duration-200
                ${
                  isActive
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-black/5"
                }
              `}
            >
              {lang[item.key]}
            </Link>
          );
        })}
      </nav>

      {/* Mobile — sticky bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-[50] bg-[#fafaf9] border-t border-[var(--border)]">
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors
                  ${
                    isActive
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted)]"
                  }
                `}
              >
                <NavIcon itemKey={item.key} size={20} />
                <span className={`text-[10px] ${isActive ? "font-medium" : ""}`}>
                  {lang[item.key]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
