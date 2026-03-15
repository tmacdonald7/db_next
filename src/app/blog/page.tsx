import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { bandName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog",
    description: `Local SEO articles for ${bandName} covering classic rock booking guidance for Montgomery, Conroe, and Houston.`,
  };
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container">
      <section className="page-header">
        <h1>Blog</h1>
        <p>Classic rock booking guidance and venue planning notes for Montgomery, Conroe, and Houston.</p>
      </section>
      <section className="section grid">
        {posts.map((post) => (
          <article key={post.slug} className="panel">
            <p className="eyebrow">
              {post.city} | {post.publishedAt}
            </p>
            <h2 style={{ fontSize: "1.4rem", lineHeight: 1.2, marginTop: "0.3rem" }}>{post.title}</h2>
            <p style={{ marginTop: "0.55rem", color: "var(--foreground-muted)" }}>{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="button-secondary" style={{ marginTop: "0.85rem" }}>
              Read article
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
