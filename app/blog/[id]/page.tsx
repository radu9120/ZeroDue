import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { blogPosts, findBlogPost } from "../posts";
import {
  BlogPostSchema,
  BreadcrumbSchema,
} from "@/components/seo/StructuredData";

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
      title: "Blog | ZeroDue",
      description: "Insights, playbooks, and stories from the ZeroDue team.",
    };
  }

  const postUrl = `https://www.zerodue.co/blog/${post.slug}`;

  return {
    title: `${post.title} | ZeroDue Blog`,
    description: post.description,
    keywords: [
      "invoicing",
      "freelancer",
      "small business",
      "payment",
      "billing",
      post.category.toLowerCase(),
    ],
    authors: [{ name: "ZeroDue Team" }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: postUrl,
      siteName: "ZeroDue",
      publishedTime: post.publishedAt,
      authors: ["ZeroDue Team"],
      images: [
        {
          url: "https://www.zerodue.co/og-cover.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://www.zerodue.co/og-cover.png"],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = findBlogPost(id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <BlogPostSchema
        title={post.title}
        description={post.description}
        publishedAt={post.publishedAt}
        author="ZeroDue Team"
        url={`https://www.zerodue.co/blog/${post.slug}`}
        image="https://www.zerodue.co/og-cover.png"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.zerodue.co" },
          { name: "Blog", url: "https://www.zerodue.co/blog" },
          { name: post.title, url: `https://www.zerodue.co/blog/${post.slug}` },
        ]}
      />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <section className="relative px-4 pb-16 pt-32 md:px-8 lg:px-16 xl:px-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors dark:text-slate-400 dark:hover:text-blue-400"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all stories
              </Link>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20">
                {post.category}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                •
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {post.readTime}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {post.description}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                ZeroDue Team
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {post.publishedAt}
              </div>
            </div>
          </div>
        </section>

        <article className="px-4 pb-24 md:px-8 lg:px-16 xl:px-32">
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
              <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-12">
                {post.preview}
              </p>

              <div className="space-y-16">
                {post.sections.map((section) => (
                  <section key={section.heading} className="scroll-mt-20">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">
                      {section.heading}
                    </h2>
                    <div className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 space-y-6">
                      {section.body.split("\n\n").map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="mt-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to streamline your invoicing?
                </h3>
                <p className="text-blue-100 text-lg mb-8 max-w-xl">
                  Join thousands of businesses using ZeroDue to get paid faster
                  and save time on admin work.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-blue-600 font-semibold shadow-lg transition hover:bg-blue-50"
                  >
                    Start for free
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-full border border-blue-400 bg-blue-600/50 px-8 py-4 text-white font-semibold transition hover:bg-blue-600"
                  >
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
