import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import { bandName, brandTagline } from "@/lib/brand";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thedecibels.thomasgrantmacdonald.com"),
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
  ];

  return (
    <html lang="en">
      <body className={`${playfairDisplay.variable} ${sourceSans3.variable}`}>
        <div className="site-shell">
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
                  <Link key={item.href} href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                ))}
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
