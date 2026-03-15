"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bandName, brandTagline, socialLinks } from "@/lib/brand";
import { MemberNavStatus } from "@/components/MemberNavStatus";
import { SiteNavLink } from "@/components/SiteNavLink";

const socialIcons = {
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.6-1.6H16.7V3.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10H8v3h2.5v8h3z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9zm9.45 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1zM12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2zm0 1.8A3 3 0 1 0 15 12a3 3 0 0 0-3-3z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.2 7.2a2.8 2.8 0 0 0-2-2c-1.8-.5-7.2-.5-7.2-.5s-5.4 0-7.2.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.3 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.8 29 29 0 0 0-.5-4.8zM10.2 15.6V8.4l6 3.6-6 3.6z" />
    </svg>
  ),
} as const;

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/media", label: "Media" },
  { href: "/shows", label: "Shows" },
  { href: "/contact", label: "Contact" },
  { href: "/epk", label: "EPK" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="site-utility-bar">
        <div className="container utility-wrap">
          <div className="utility-actions">
            <div className="utility-socials" aria-label="Social links">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="utility-social-link"
                  aria-label={item.label}
                >
                  {socialIcons[item.icon]}
                </Link>
              ))}
            </div>
            <MemberNavStatus />
          </div>
        </div>
      </div>
      <div className="container nav-wrap">
        <div className="brand-lockup">
          <Link href="/" className="brand-link">
            {bandName}
          </Link>
          <p className="brand-tagline">{brandTagline}</p>
        </div>
        <button
          type="button"
          className={`site-menu-toggle${menuOpen ? " is-open" : ""}`}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          id="site-nav"
          className={`site-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => (
            <SiteNavLink key={item.href} href={item.href}>
              {item.label}
            </SiteNavLink>
          ))}
          <div className="site-nav-mobile-tools">
            <div className="utility-socials" aria-label="Social links">
              {socialLinks.map((item) => (
                <Link
                  key={`mobile-${item.label}`}
                  href={item.href}
                  className="utility-social-link"
                  aria-label={item.label}
                >
                  {socialIcons[item.icon]}
                </Link>
              ))}
            </div>
            <MemberNavStatus />
          </div>
        </nav>
      </div>
    </header>
  );
}
