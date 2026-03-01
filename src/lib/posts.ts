import { blogPosts, type Post } from "@/content/blogPosts";

export async function getPosts(): Promise<Post[]> {
  // TODO(strapi): Replace local content with Strapi query once CMS is provisioned.
  return [...blogPosts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  // TODO(strapi): Replace with Strapi lookup by slug.
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}
