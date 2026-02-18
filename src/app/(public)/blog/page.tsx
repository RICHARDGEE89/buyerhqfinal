import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPublishedBlogPosts } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Blog | BuyerHQ",
  description: "Buyer-focused market trends, strategy notes, and practical case studies.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const posts = await getPublishedBlogPosts();
  const category = searchParams?.category ?? "";

  const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).sort();
  const filtered = category ? posts.filter((post) => post.category === category) : posts;

  return (
    <div className="container space-y-8 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">BuyerHQ Insights</h1>
        <p className="mt-3 max-w-3xl text-body text-text-secondary">
          Published analysis and buying strategy content for Australian property buyers.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button variant={category ? "secondary" : "primary"} asChild>
          <Link href="/blog">All</Link>
        </Button>
        {categories.map((item) => (
          <Button key={item} variant={category === item ? "primary" : "secondary"} asChild>
            <Link href={`/blog?category=${encodeURIComponent(item ?? "")}`}>{item}</Link>
          </Button>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card interactive className="h-full p-4">
              <div className="space-y-3">
                <Badge variant="category">{post.category ?? "Article"}</Badge>
                <h2 className="text-subheading text-text-primary">{post.title}</h2>
                <p className="text-body-sm text-text-secondary">{post.excerpt}</p>
                <p className="font-mono text-caption text-text-muted">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString("en-AU") : "Unscheduled"}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
