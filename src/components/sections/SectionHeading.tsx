type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 style={{ fontSize: "clamp(1.45rem, 2.6vw, 2.15rem)" }}>{title}</h2>
      {description ? (
        <p style={{ marginTop: "0.55rem", maxWidth: "68ch", color: "var(--foreground-muted)" }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
