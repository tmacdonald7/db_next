import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { bandName } from "@/lib/brand";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.seoDescription,
    keywords: [
      `${bandName} ${post.city}`,
      "classic rock band",
      `${post.city} live music`,
      "Montgomery TX",
      "Conroe TX",
      "Houston TX",
    ],
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container">
      <article className="page-header">
        <p className="eyebrow">
          {post.city} | {post.publishedAt}
        </p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </article>

      <section className="section panel">
        {post.body.map((paragraph) => (
          <p key={paragraph} style={{ marginTop: "0.75rem" }}>
            {paragraph}
          </p>
        ))}
      </section>
    </div>
  );
}
