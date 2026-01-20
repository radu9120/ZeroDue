import Link from "next/link";

const sections: Array<{
  title: string;
  links: Array<{ label: string; href: string; description?: string }>;
}> = [
  {
    title: "Main Pages",
    links: [
      {
        label: "Home",
        href: "/",
        description: "Professional invoicing made simple",
      },
      {
        label: "Pricing",
        href: "/pricing",
        description: "Flexible plans for every business",
      },
      {
        label: "ChatGPT Invoice Generator",
        href: "/chatgpt-invoice-generator",
        description: "Purpose-built alternative to AI drafts",
      },
      {
        label: "Claude Invoice Generator",
        href: "/claude-invoice-generator",
        description: "Turn AI drafts into real invoices",
      },
      {
        label: "ZeroDue vs FreshBooks",
        href: "/vs/freshbooks",
        description: "Compare invoicing platforms",
      },
      { label: "FAQ", href: "/faq", description: "Frequently asked questions" },
      {
        label: "Contact Us",
        href: "/contact",
        description: "Get in touch with our team",
      },
      {
        label: "Help Center",
        href: "/help",
        description: "Support and documentation",
      },
    ],
  },
  {
    title: "Dashboard",
    links: [
      {
        label: "Dashboard Overview",
        href: "/dashboard",
        description: "Your business command center",
      },
      {
        label: "All Invoices",
        href: "/dashboard/invoices",
        description: "View and manage all invoices",
      },
      {
        label: "Create New Invoice",
        href: "/dashboard/invoices/new",
        description: "Generate professional invoices",
      },
      {
        label: "Client Management",
        href: "/dashboard/clients",
        description: "Manage your client database",
      },
      {
        label: "Add New Client",
        href: "/dashboard/clients/new",
        description: "Add clients to your account",
      },
      {
        label: "Edit Client",
        href: "/dashboard/clients/edit",
        description: "Update client information",
      },
      {
        label: "Analytics & Reports",
        href: "/dashboard/analytics",
        description: "Revenue insights and trends",
      },
    ],
  },
  {
    title: "Business Management",
    links: [
      {
        label: "Business Profile",
        href: "/dashboard/business",
        description: "Your business information",
      },
      {
        label: "Create New Business",
        href: "/dashboard/business/new",
        description: "Add another business",
      },
      {
        label: "Business Settings",
        href: "/dashboard/business/settings",
        description: "Configure business details",
      },
      {
        label: "Account Settings",
        href: "/dashboard/settings",
        description: "Profile and preferences",
      },
      {
        label: "Plan & Billing",
        href: "/dashboard/plan",
        description: "Subscription management",
      },
      {
        label: "Upgrade Plan",
        href: "/upgrade",
        description: "Unlock more features",
      },
    ],
  },
  {
    title: "Blog & Resources",
    links: [
      {
        label: "Blog",
        href: "/blog",
        description: "Invoicing tips and business guides",
      },
      {
        label: "Free Invoice Template 2025",
        href: "/blog/free-invoice-template-2025",
        description: "Download professional invoice templates",
      },
      {
        label: "Freelancer Invoicing Guide",
        href: "/blog/how-to-invoice-freelancer-guide",
        description: "Complete guide for freelancers",
      },
      {
        label: "Invoice vs Receipt",
        href: "/blog/invoice-vs-receipt-difference",
        description: "Know the key differences",
      },
      {
        label: "VAT, GST & Sales Tax Guide",
        href: "/blog/vat-gst-sales-tax-invoice-guide",
        description: "Tax compliance for invoices",
      },
      {
        label: "Get Paid Faster",
        href: "/blog/get-clients-pay-invoices-faster",
        description: "Tips to speed up payments",
      },
      {
        label: "Invoicing Software Guide",
        href: "/blog/small-business-invoicing-software-guide",
        description: "Choose the right software",
      },
      {
        label: "Simplify Service Billing",
        href: "/blog/simplify-service-billing",
        description: "Streamline your billing process",
      },
      {
        label: "Agency Cash Flow Tips",
        href: "/blog/agencies-stay-cash-flow-positive",
        description: "Stay cash flow positive",
      },
      {
        label: "AI Invoice Generators vs ZeroDue",
        href: "/blog/why-zerodue-beats-ai-invoice-generators",
        description: "Why purpose-built invoicing wins",
      },
      {
        label: "Accurate Invoicing Matters",
        href: "/blog/accurate-invoicing-matters",
        description: "Why precision counts",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        label: "Privacy Policy",
        href: "/privacy-policy",
        description: "How we protect your data",
      },
      {
        label: "Cookie Policy",
        href: "/cookies",
        description: "Our use of cookies",
      },
    ],
  },
  {
    title: "Account",
    links: [
      {
        label: "Sign In",
        href: "/sign-in",
        description: "Access your ZeroDue account",
      },
      {
        label: "Create Account",
        href: "/sign-up",
        description: "Start your free trial",
      },
      {
        label: "Forgot Password",
        href: "/forgot-password",
        description: "Reset your password",
      },
      {
        label: "Reset Password",
        href: "/reset-password",
        description: "Create a new password",
      },
    ],
  },
];

export const metadata = {
  title: "Sitemap | ZeroDue - All Pages & Resources",
  description:
    "Complete sitemap of ZeroDue. Find all pages including invoicing tools, client management, analytics, billing guides, blog posts, and support resources.",
  keywords: [
    "zerodue sitemap",
    "invoice software pages",
    "billing tools",
    "freelancer invoicing",
    "small business invoicing",
    "invoice templates",
    "client management",
    "payment tracking",
  ],
  openGraph: {
    title: "Sitemap | ZeroDue",
    description:
      "Navigate all ZeroDue pages - invoicing tools, resources, and support.",
    type: "website",
  },
};

export default function SitemapPage() {
  return (
    <main className="min-h-screen pt-24 md:pt-28 bg-linear-to-br from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <header className="max-w-3xl mb-12">
          <p className="text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold mb-2">
            Site Navigation
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            ZeroDue Sitemap
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Explore all pages on ZeroDue. From creating professional invoices to
            managing clients and tracking payments - find everything you need
            below.
          </p>
        </header>

        <nav aria-label="Site pages">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                aria-labelledby={`section-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <h2
                  id={`section-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full bg-blue-500"
                    aria-hidden="true"
                  ></span>
                  {section.title}
                  <span className="ml-auto text-xs text-slate-400 font-normal">
                    {section.links.length} pages
                  </span>
                </h2>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex flex-col rounded-lg border border-transparent hover:border-blue-200 dark:hover:border-slate-600 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 px-3 py-2 transition-all"
                      >
                        <span className="text-slate-700 dark:text-slate-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {link.label}
                        </span>
                        {link.description && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
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
        </nav>

        <footer className="mt-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
            href="/contact"
          >
            Contact Support
          </Link>
        </footer>

        {/* SEO: Structured breadcrumb */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://invcyflow.com",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Sitemap",
                  item: "https://invcyflow.com/sitemap",
                },
              ],
            }),
          }}
        />
      </div>
    </main>
  );
}
