import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Oswald } from "next/font/google";
import Link from "next/link";
import { bandName, brandTagline } from "@/lib/brand";
import { themeTokens } from "@/app/style-guide/page";
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
  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/media", label: "Media" },
    { href: "/songs", label: "Song List" },
    { href: "/shows", label: "Shows" },
    { href: "/contact", label: "Contact" },
    { href: "/book", label: "Booking" },
    { href: "/epk", label: "EPK" },
    { href: "/blog", label: "Blog" },
    { href: "/style-guide", label: "Style Guide" },
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
            <div className="container nav-wrap">
              <div>
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
                <MemberNavStatus />
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <div className="container footer-wrap">
              <p>{bandName}</p>
              <p>Serving Montgomery, Conroe, and Houston event venues.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
