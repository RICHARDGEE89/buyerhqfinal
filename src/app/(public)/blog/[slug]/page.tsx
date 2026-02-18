import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPublishedBlogPostBySlug, getPublishedBlogPosts } from "@/lib/server-data";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post Not Found | BuyerHQ",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: `${post.title} | BuyerHQ`,
    description: post.excerpt ?? "BuyerHQ article",
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const post = await getPublishedBlogPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = (await getPublishedBlogPosts())
    .filter((item) => item.id !== post.id && item.category === post.category)
    .slice(0, 3);

  return (
    <div className="container space-y-8 pb-16 pt-10">
      <article className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <p className="font-mono text-label uppercase text-text-secondary">{post.category}</p>
        <h1 className="mt-3 text-display text-text-primary md:text-display-lg">{post.title}</h1>
        <p className="mt-3 text-body-sm text-text-secondary">
          By {post.author ?? "BuyerHQ Editorial"} ·{" "}
          {post.published_at ? new Date(post.published_at).toLocaleDateString("en-AU") : "Draft"}
        </p>
        <div className="mt-6 space-y-4 text-body text-text-secondary">
          {(post.content ?? "")
            .split("\n")
            .filter(Boolean)
            .map((line, index) => {
              if (line.startsWith("# ")) {
                return (
                  <h2 key={`${line}-${index}`} className="mt-6 text-heading text-text-primary">
                    {line.replace(/^# /, "")}
                  </h2>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3 key={`${line}-${index}`} className="mt-4 text-subheading text-text-primary">
                    {line.replace(/^## /, "")}
                  </h3>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={`${line}-${index}`} className="ml-5 list-disc">
                    {line.replace(/^- /, "")}
                  </li>
                );
              }
              return <p key={`${line}-${index}`}>{line}</p>;
            })}
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-heading">Related posts</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                <Card interactive className="h-full p-4">
                  <h3 className="text-subheading text-text-primary">{relatedPost.title}</h3>
                  <p className="mt-2 text-body-sm text-text-secondary">{relatedPost.excerpt}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-heading">Ready to find your agent?</h2>
        <p className="mt-2 text-body text-text-secondary">
          Explore verified specialists and enquire directly from the directory.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/agents">Browse Agents</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
