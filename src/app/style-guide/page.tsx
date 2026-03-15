import Link from "next/link";

export const themeTokens = {
  typography: {
    displayPrimary: 'var(--font-oswald), Arial, sans-serif',
    displaySecondary: 'var(--font-bebas-neue), Impact, sans-serif',
    body: 'var(--font-montserrat), "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  colors: {
    background: "#0b0d10",
    backgroundSoft: "#12161d",
    backgroundRaised: "#171c24",
    foreground: "#f4efe6",
    foregroundMuted: "rgba(244, 239, 230, 0.62)",
    surface: "#171c24",
    surfaceMuted: "#1d2430",
    border: "rgba(212, 163, 115, 0.22)",
    borderSoft: "rgba(212, 163, 115, 0.4)",
    accent: "#c85a11",
    accentHover: "#de6a1a",
    accentDeep: "#8f3d0a",
    secondary: "#d4a373",
    secondarySoft: "#e2b98f",
    highlight: "#6c757d",
    highlightSoft: "#93a0aa",
    success: "#8ea66a",
    error: "#d17a5c",
    glow: "rgba(200, 90, 17, 0.28)",
    shadow: "rgba(0, 0, 0, 0.55)",
  },
  gradients: {
    hero:
      "radial-gradient(circle at top left, rgba(212, 163, 115, 0.14) 0, transparent 34%), radial-gradient(circle at 82% 18%, rgba(200, 90, 17, 0.16) 0, transparent 28%), linear-gradient(145deg, rgba(29, 36, 48, 0.9) 0%, rgba(18, 22, 29, 0.94) 48%, rgba(11, 13, 16, 1) 100%)",
    page:
      "radial-gradient(circle at 12% 8%, rgba(212, 163, 115, 0.08) 0, transparent 26%), radial-gradient(circle at 85% 12%, rgba(200, 90, 17, 0.1) 0, transparent 24%), radial-gradient(circle at 50% 32%, rgba(108, 117, 125, 0.08) 0, transparent 34%), linear-gradient(180deg, #171c24 0%, #0b0d10 58%, #090b0d 100%)",
    panel:
      "linear-gradient(180deg, rgba(29, 36, 48, 0.92) 0%, rgba(23, 28, 36, 0.98) 100%)",
  },
  shadow: {
    panel: "0 22px 46px rgba(0, 0, 0, 0.42)",
    glow: "0 18px 38px rgba(200, 90, 17, 0.18)",
  },
  maxWidth: "1120px",
};

function ColorSwatch({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="panel" style={{ padding: "1rem" }}>
      <div
        style={{
          width: "100%",
          height: "4rem",
          borderRadius: "0.75rem",
          background: value,
          border: "1px solid rgba(248, 244, 227, 0.12)",
          marginBottom: "0.75rem",
        }}
      />
      <p className="eyebrow">{label}</p>
      <pre
        style={{
          margin: 0,
          fontSize: "0.85rem",
          color: "var(--foreground-muted)",
          whiteSpace: "pre-wrap",
        }}
      >
        {value}
      </pre>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="container">
      <header className="page-header">
        <p className="eyebrow">Theme Source Of Truth</p>
        <h1>Style Guide</h1>
        <p>
          This page owns the site palette. Update the tokens here and the rest
          of the app will inherit the new look on refresh.
        </p>
      </header>

      <section className="section">
        <div className="panel">
          <h2>Palette direction</h2>
          <p>
            The current system now leans near-neutral charcoal in the
            foundation, with burnt orange, dusty tan, steel gray, and cream
            carrying the accent work.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="panel">
          <h2>Typography</h2>
          <p className="eyebrow">Font families</p>
          <p>
            <strong>Display primary:</strong>{" "}
            <code>var(--font-display-primary)</code>
          </p>
          <p>
            <strong>Display secondary:</strong>{" "}
            <code>var(--font-display-secondary)</code>
          </p>
          <p>
            <strong>Body:</strong> <code>var(--font-body)</code>
          </p>

          <p className="eyebrow">Heading rules</p>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4rem)",
              margin: "0.5rem 0 0",
            }}
          >
            Headline Energy
          </h1>
          <h2>Section headline in Oswald</h2>
          <h3>Promo label in Bebas Neue</h3>
          <p className="date-block" style={{ marginTop: "0.4rem" }}>
            SAT | APR 11 | CONROE
          </p>
          <p className="eyebrow">Body copy</p>
          <p>
            Cream-forward text on a dark stage creates the mood, while Oswald,
            Bebas Neue, and Montserrat stay crisp and professional inside a
            richer vintage-rock atmosphere.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>Colors</h2>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {Object.entries(themeTokens.colors).map(([key, value]) => (
            <ColorSwatch key={key} label={key} value={value} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Gradients</h2>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {Object.entries(themeTokens.gradients).map(([key, value]) => (
            <ColorSwatch key={key} label={key} value={value} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="panel">
          <h2>How to change the theme</h2>
          <p>
            Edit <code>src/app/style-guide/page.tsx</code> and update the values
            in <code>themeTokens</code>. The layout injects those variables into
            the entire site.
          </p>
          <p>
            Typography is also sourced here through{" "}
            <code>--font-display-primary</code>,{" "}
            <code>--font-display-secondary</code>, and <code>--font-body</code>.
          </p>
          <p>
            Keep this route in sync with any visual refresh so the style guide
            remains the single source of truth.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="panel">
          <h2>Quick links</h2>
          <ul style={{ paddingLeft: "1.15rem" }}>
            <li>
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link href="/media" className="nav-link">
                Media
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
