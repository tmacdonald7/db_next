import Link from "next/link";

export const themeTokens = {
  colors: {
    background: "#f5f3ef",
    foreground: "#1d1b18",
    surface: "#fffdfa",
    surfaceMuted: "#ece7df",
    border: "#d9cfbf",
    accent: "#30506e",
    accentDeep: "#1f3448",
  },
  maxWidth: "1120px",
};

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel" style={{ padding: "1rem" }}>
      <div
        style={{
          width: "100%",
          height: "4rem",
          borderRadius: "0.75rem",
          background: value,
          border: "1px solid rgba(0,0,0,0.08)",
          marginBottom: "0.75rem",
        }}
      />
      <p className="eyebrow">{label}</p>
      <pre style={{ margin: 0, fontSize: "0.85rem" }}>{value}</pre>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Style Guide</h1>
        <p>
          This page is the source of truth for the site theme. Editing the
          values below will update the rest of the site.
        </p>
      </header>

      <section className="section">
        <div className="panel">
          <h2>Typography</h2>
          <p className="eyebrow">Font families</p>
          <p>
            <strong>Display:</strong> <code>var(--font-display)</code>
          </p>
          <p>
            <strong>Body:</strong> <code>var(--font-sans)</code>
          </p>

          <p className="eyebrow">Heading sizes</p>
          <h2>Heading level 2</h2>
          <h3>Heading level 3</h3>
          <p className="eyebrow">Body copy</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non
            velit vel purus malesuada accumsan.
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
        <div className="panel">
          <h2>How to change the theme</h2>
          <p>
            Edit <code>src/app/style-guide/page.tsx</code> and update the values
            in
            <code>themeTokens</code>. The site will automatically pick up the
            new colors on the next refresh.
          </p>
          <p>
            This page is intentionally part of the app so it can be the single
            source of truth for colors and spacing across the site.
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
