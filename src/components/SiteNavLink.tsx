"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type SiteNavLinkProps = {
  href: string;
  children: ReactNode;
};

export function SiteNavLink({ href, children }: SiteNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className="nav-link"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive ? "true" : "false"}
    >
      {children}
    </Link>
  );
}
