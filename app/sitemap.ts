import { MetadataRoute } from "next";

// Blog post IDs from your posts.ts
const blogPostIds = [
  "free-invoice-template-2025",
  "how-to-invoice-freelancer-guide",
  "invoice-vs-receipt-difference",
  "late-payment-invoice-tips",
  "small-business-invoicing-mistakes",
  "invoice-payment-terms-guide",
  "digital-vs-paper-invoicing",
  "invoice-automation-benefits",
  "tax-compliant-invoicing",
  "best-free-invoice-software-uk-2025",
  "how-to-create-invoice-beginners-guide",
  "invoice-payment-terms-explained",
];

// Industry pages
const industryPages = [
  "freelancers",
  "contractors",
  "consultants",
  "plumbers",
  "electricians",
  "designers",
  "photographers",
  "cleaning",
  "landscaping",
];

// Tool pages
const toolPages = ["invoice-generator", "estimate-generator"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.zerodue.co";
  const currentDate = new Date();

  // Static pages with proper priorities based on SEO importance
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/upgrade`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/uk`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/site-map`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Industry pages - important for SEO
  const industries: MetadataRoute.Sitemap = industryPages.map((industry) => ({
    url: `${baseUrl}/industries/${industry}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  // Tool pages - highest SEO priority
  const tools: MetadataRoute.Sitemap = toolPages.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 1.0,
  }));

  // Blog posts - these are important for SEO
  const blogPages: MetadataRoute.Sitemap = blogPostIds.map((id) => ({
    url: `${baseUrl}/blog/${id}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...industries, ...tools, ...blogPages];
}
