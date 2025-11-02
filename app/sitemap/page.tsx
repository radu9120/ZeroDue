import Link from "next/link";

const sections: Array<{
  title: string;
  links: Array<{ label: string; href: string; description?: string }>;
}> = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "How It Works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Invoices", href: "/dashboard/invoices" },
      { label: "Clients", href: "/dashboard/clients" },
      { label: "Analytics", href: "/dashboard/analytics" },
      { label: "Business", href: "/dashboard/business" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Contact", href: "/contact" },
      { label: "Upgrade", href: "/upgrade" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/sign-in" },
      { label: "Create Account", href: "/sign-up" },
      { label: "Plan & Billing", href: "/dashboard/plan" },
      { label: "Who Am I", href: "/api/whoami" },
      { label: "API Health", href: "/api/health" },
    ],
  },
];

export const metadata = {
  title: "Sitemap | InvoiceFlow",
  description:
    "Quickly find any page across the InvoiceFlow product, dashboard, and support resources.",
};

export default function SitemapPage() {
  return (
    <main className="min-h-screen pt-24 md:pt-28 bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <header className="max-w-3xl mb-12">
          <p className="text-sm text-primary uppercase tracking-wide mb-2">
            Navigation
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100 mb-4">
            Sitemap
          </h1>
          <p className="text-primary-text dark:text-slate-300">
            Explore every corner of InvoiceFlow. Use these quick links to jump
            straight to the pages you need.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-lg font-semibold text-header-text dark:text-slate-100 mb-4">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex flex-col rounded-lg border border-transparent hover:border-blue-200 dark:hover:border-slate-600 px-3 py-2 transition-colors"
                    >
                      <span className="text-primary-text dark:text-slate-200 font-medium">
                        {link.label}
                      </span>
                      {link.description && (
                        <span className="text-sm text-secondary-text dark:text-slate-400">
                          {link.description}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-secondary-text dark:text-slate-400">
          Missing something?{" "}
          <Link className="text-primary hover:underline" href="/contact">
            Tell us what to add.
          </Link>
        </div>
      </div>
    </main>
  );
}
