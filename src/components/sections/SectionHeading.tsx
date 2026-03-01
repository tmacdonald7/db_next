type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 style={{ fontSize: "clamp(1.45rem, 2.6vw, 2.15rem)", lineHeight: 1.2 }}>{title}</h2>
      {description ? <p style={{ marginTop: "0.55rem", maxWidth: "68ch" }}>{description}</p> : null}
    </div>
  );
}
