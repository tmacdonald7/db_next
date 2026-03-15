import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Oswald } from "next/font/google";
import Link from "next/link";
import {
  bandName,
  brandTagline,
  socialLinks,
} from "@/lib/brand";
import { themeTokens } from "@/app/style-guide/page";
import { FooterMemberLinks } from "@/components/FooterMemberLinks";
import { MemberNavStatus } from "@/components/MemberNavStatus";
import { SiteNavLink } from "@/components/SiteNavLink";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: ["400"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://thefeedbackcommittee.netlify.app/",
  ),
  title: {
    default: `${bandName} | Classic Rock for Montgomery, Conroe, and Houston`,
    template: `%s | ${bandName}`,
  },
  description: `${bandName} delivers polished classic rock entertainment for upscale patios, country clubs, corporate gatherings, and private events across Montgomery, Conroe, and Houston.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footerNavigationItems = [
    { href: "/", label: "Home" },
    { href: "/media", label: "Media" },
    { href: "/shows", label: "Shows" },
    { href: "/contact", label: "Contact" },
    { href: "/epk", label: "EPK" },
    { href: "/blog", label: "Blog" },
  ];

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

  const rootCss = `:root {
  --font-display-primary: ${themeTokens.typography.displayPrimary};
  --font-display-secondary: ${themeTokens.typography.displaySecondary};
  --font-body: ${themeTokens.typography.body};
  --color-bg: ${themeTokens.colors.background};
  --color-bg-elevated: ${themeTokens.colors.backgroundSoft};
  --color-panel: ${themeTokens.colors.surface};
  --color-panel-soft: ${themeTokens.colors.surfaceMuted};
  --color-border: ${themeTokens.colors.border};
  --color-border-strong: ${themeTokens.colors.borderSoft};
  --color-text: ${themeTokens.colors.foreground};
  --color-text-soft: rgba(244, 239, 230, 0.82);
  --color-text-muted: ${themeTokens.colors.foregroundMuted};
  --color-accent: ${themeTokens.colors.accent};
  --color-accent-hover: ${themeTokens.colors.accentHover};
  --color-accent-deep: ${themeTokens.colors.accentDeep};
  --color-gold: ${themeTokens.colors.secondary};
  --color-glow: ${themeTokens.colors.glow};
  --color-shadow: ${themeTokens.colors.shadow};
  --background: ${themeTokens.colors.background};
  --background-soft: ${themeTokens.colors.backgroundSoft};
  --background-raised: ${themeTokens.colors.backgroundRaised};
  --foreground: ${themeTokens.colors.foreground};
  --foreground-muted: ${themeTokens.colors.foregroundMuted};
  --surface: ${themeTokens.colors.surface};
  --surface-muted: ${themeTokens.colors.surfaceMuted};
  --border: ${themeTokens.colors.border};
  --border-soft: ${themeTokens.colors.borderSoft};
  --accent: ${themeTokens.colors.accent};
  --accent-hover: ${themeTokens.colors.accentHover};
  --accent-deep: ${themeTokens.colors.accentDeep};
  --secondary: ${themeTokens.colors.secondary};
  --secondary-soft: ${themeTokens.colors.secondarySoft};
  --highlight: ${themeTokens.colors.highlight};
  --highlight-soft: ${themeTokens.colors.highlightSoft};
  --success: ${themeTokens.colors.success};
  --error: ${themeTokens.colors.error};
  --glow-color: ${themeTokens.colors.glow};
  --shadow-color: ${themeTokens.colors.shadow};
  --gradient-page: ${themeTokens.gradients.page};
  --gradient-hero: ${themeTokens.gradients.hero};
  --gradient-panel: ${themeTokens.gradients.panel};
  --shadow-panel: ${themeTokens.shadow.panel};
  --shadow-glow: ${themeTokens.shadow.glow};
  --max-width: ${themeTokens.maxWidth};
}`;

  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${bebasNeue.variable} ${montserrat.variable}`}
      >
        <style dangerouslySetInnerHTML={{ __html: rootCss }} />
        <div className="site-shell">
          <div className="site-atmosphere" aria-hidden="true" />
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
              <nav className="site-nav" aria-label="Main navigation">
                {navigationItems.map((item) => (
                  <SiteNavLink key={item.href} href={item.href}>
                    {item.label}
                  </SiteNavLink>
                ))}
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <div className="container footer-wrap">
              <div className="footer-brand-panel">
                <div className="footer-brand-group">
                  <p className="footer-kicker">The Feedback Committee</p>
                  <h2 className="footer-brand-heading">{bandName}</h2>
                  <p className="footer-brand-copy">
                    Classic rock with a polished stage presence for private
                    events, patios, venue nights, and upscale live-room sets.
                  </p>
                </div>
                <div className="footer-socials" aria-label="Footer social links">
                  {socialLinks.map((item) => (
                    <Link
                      key={`footer-${item.label}`}
                      href={item.href}
                      className="footer-social-link"
                      aria-label={item.label}
                    >
                      {socialIcons[item.icon]}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="footer-links-column">
                <p className="footer-heading">Explore</p>
                <div className="footer-links-list">
                  {footerNavigationItems.map((item) => (
                    <Link key={`footer-nav-${item.href}`} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="footer-links-column">
                <p className="footer-heading">Booking</p>
                <div className="footer-links-list">
                  <Link href="/contact">Contact The Band</Link>
                  <Link href="/epk">View EPK</Link>
                  <Link href="/shows">Upcoming Shows</Link>
                </div>
              </div>
              <div className="footer-links-column footer-meta-column">
                <p className="footer-heading">Service Area</p>
                <p className="footer-meta-copy">
                  Serving the Greater Houston Area event venues.
                </p>
                <FooterMemberLinks />
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
