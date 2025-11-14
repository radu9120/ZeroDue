"use client";

import Link from "next/link";
import { blogPosts } from "@/app/blog/posts";
import { SectionTitle } from "./ui/SectionTitle";

const highlightedPosts = blogPosts.slice(0, 3);

export default function RecentBlogs() {
  return (
    <section
      id="recent-blogs"
      className="py-24 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors"
    >
      <div className="container mx-auto px-4 md:px-6">
        <SectionTitle
          regularText="Latest"
          highlightedText="Stories"
          description="Fresh playbooks, templates, and customer wins from the InvoiceFlow team."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {highlightedPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-sm ring-1 ring-transparent transition hover:-translate-y-1 hover:border-blue-200 hover:ring-blue-100 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
                  {post.category}
                </span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-gray-900 transition group-hover:text-blue-700 dark:text-slate-50">
                {post.title}
              </h3>
              <p className="mt-3 flex-1 text-sm text-gray-600 dark:text-slate-300">
                {post.preview}
              </p>
              <div className="mt-6 text-sm text-gray-500 dark:text-slate-400">
                {post.publishedAt}
              </div>
              <div className="mt-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Read article <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-blue-500 dark:hover:text-blue-200"
          >
            Browse the blog{" "}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            Visit the FAQ{" "}
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
