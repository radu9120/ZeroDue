"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { blogPosts } from "./posts";

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = blogPosts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <section className="px-4 pt-24 pb-16 md:px-8 lg:px-16 xl:px-32">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-300">
            InvoiceFlow Blog
          </span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
            Stories, Playbooks, and Insights for Modern Service Businesses
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 md:text-lg">
            Discover how ambitious teams use InvoiceFlow to automate billing,
            impress clients, and unlock new revenue. Dive into product
            walkthroughs, customer stories, and finance best practices crafted
            for agencies, studios, and consultancies.
          </p>
        </div>
      </section>

      <section className="px-4 pb-12 md:px-8 lg:px-16 xl:px-32">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                <span>{post.category}</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-gray-900 transition group-hover:text-green-600 dark:text-white">
                {post.title}
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">
                {post.preview}
              </p>
              <div className="mt-6 flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400">
                <span>{post.publishedAt}</span>
              </div>
              <div className="mt-auto pt-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                >
                  Read the story
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`min-w-[40px] h-10 rounded-full px-4 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-green-600 text-white shadow-lg"
                        : "border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Post count info */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
          Showing {startIndex + 1}–{Math.min(endIndex, blogPosts.length)} of{" "}
          {blogPosts.length} articles
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Ready to bring more predictability to your revenue?
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-slate-300 md:text-lg">
            Start streamlining proposals, approvals, and invoicing today.
            InvoiceFlow helps you turn project wins into paid invoices—without
            chasing payments.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700"
            >
              Start your free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
            >
              Explore pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
