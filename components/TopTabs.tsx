"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/", label: "Hub" },
  { href: "/claim", label: "Claim" },
  { href: "/my", label: "My Username" },
  { href: "/registry", label: "Registry" },
];

export function TopTabs() {
  const pathname = usePathname();

  return (
    <nav className="top-tabs" aria-label="Primary">
      {tabs.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

        return (
          <Link key={tab.href} href={tab.href} className={clsx("tab-link", active && "active")}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
