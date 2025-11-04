import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { blogPosts, findBlogPost } from "../posts";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    id: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = findBlogPost(id);

  if (!post) {
    return {
      title: "Blog | InvoiceFlow",
      description:
        "Insights, playbooks, and stories from the InvoiceFlow team.",
    };
  }

  return {
    title: `${post.title} | InvoiceFlow Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = findBlogPost(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <section className="px-4 pb-10 pt-24 md:px-8 lg:px-16 xl:px-32">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            <span aria-hidden="true">←</span>
            Back to all stories
          </Link>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {post.category}
          </span>
          <h1 className="mt-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base text-gray-600 dark:text-slate-300 md:text-lg">
            {post.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
            <span>{post.publishedAt}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      <article className="px-4 pb-16 md:px-8 lg:px-16 xl:px-32">
        <div className="mx-auto max-w-3xl space-y-12 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-12">
          <p className="text-base text-gray-700 dark:text-slate-200">
            {post.preview}
          </p>
          <div className="space-y-12">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {section.heading}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-slate-200">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
          <div className="rounded-2xl bg-green-50 px-6 py-8 text-gray-800 dark:bg-green-900/30 dark:text-green-100">
            <h3 className="text-xl font-semibold">
              Keep momentum after every invoice
            </h3>
            <p className="mt-3 text-sm text-gray-700 dark:text-green-100/80">
              InvoiceFlow automates approvals, nudges clients when payments
              slip, and surfaces the metrics you need to stay cash-flow
              positive.
            </p>
            <div className="mt-5 flex flex-col gap-3 text-sm font-semibold sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 text-white shadow-lg transition hover:bg-green-700"
              >
                Start your free trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-green-300 px-6 py-3 text-green-700 transition hover:border-green-400 hover:text-green-800 dark:border-green-700 dark:text-green-300 dark:hover:border-green-600 dark:hover:text-green-200"
              >
                Explore pricing
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
