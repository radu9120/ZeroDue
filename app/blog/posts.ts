export type BlogPostSection = {
  heading: string;
  body: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  readTime: string;
  category: string;
  preview: string;
  sections: BlogPostSection[];
};

export const blogPosts: BlogPost[] = [
  {
    title: "How InvoiceFlow Simplifies Service-Based Billing",
    slug: "simplify-service-billing",
    description:
      "Walk through a real-world client project to show how collecting details, logging billable hours, and sending polished invoices happens in minutes with InvoiceFlow.",
    publishedAt: "October 3, 2025",
    readTime: "6 min read",
    category: "Product Deep Dive",
    preview:
      "From onboarding a new client to sending a final invoice, learn how service teams automate busywork and keep cash flowing with InvoiceFlow.",
    sections: [
      {
        heading: "Capture project details once",
        body: "InvoiceFlow centralises every project brief. Intake forms feed straight into client profiles, so your team never chases paperwork or double-enters data. Custom fields cover fixed fees, hourly rates, retainers, and expenses—you decide the billing structure and InvoiceFlow remembers it for next time.",
      },
      {
        heading: "Track billable work as it happens",
        body: "Whether you invoice by milestone, deliverable, or time, InvoiceFlow keeps the numbers straight. Built-in timers sync with tasks, and expense uploads automatically convert into line items. Managers see profitability dashboards in real time, so quoting and forecasting stays on point.",
      },
      {
        heading: "Send polished invoices with a click",
        body: "When it’s time to bill, InvoiceFlow pulls approved hours, expenses, and taxes into a branded invoice. Automated reminders and payment pages remove the friction for clients. Once paid, revenue flows straight into analytics—no more spreadsheets or manual reconciliation.",
      },
    ],
  },
  {
    title: "Growing Agencies Use InvoiceFlow to Stay Cash-Flow Positive",
    slug: "agencies-stay-cash-flow-positive",
    description:
      "See how boutique agencies use live payment tracking, automated reminders, and smart dashboards to scale without hiring a finance team.",
    publishedAt: "September 15, 2025",
    readTime: "7 min read",
    category: "Customer Story",
    preview:
      "We sat down with three fast-growing agencies to unpack the exact workflows they rely on to keep projects profitable and clients delighted.",
    sections: [
      {
        heading: "The challenge",
        body: "Agencies juggle dozens of retainers and projects at once. Without visibility into who paid, who’s overdue, and which deliverables are in scope, leaders end up reacting to cash crunches instead of steering growth.",
      },
      {
        heading: "How InvoiceFlow helps",
        body: "Shared dashboards show real-time payment status and upcoming renewals. Automated nudges keep clients on schedule, while finance teams collaborate asynchronously in approval workflows. Agency owners get margin insights by account to plan hiring with confidence.",
      },
      {
        heading: "Results that stick",
        body: "Across the agencies we interviewed, it now takes under five minutes to issue an invoice, average days sales outstanding dropped by 38%, and revenue forecasting is accurate within 5%. Clients love the professional experience, and teams get to focus on creative work again.",
      },
    ],
  },
  {
    title: "Why Accurate Invoicing Matters More Than Ever",
    slug: "accurate-invoicing-matters",
    description:
      "A breakdown of the hidden costs of manual invoicing and the ROI companies see when they modernise billing operations.",
    publishedAt: "August 28, 2025",
    readTime: "5 min read",
    category: "Insights",
    preview:
      "Discover the financial impact of delayed billing, forgotten line items, and scattered payment follow-up—and how InvoiceFlow keeps revenue on track.",
    sections: [
      {
        heading: "Revenue leaks add up",
        body: "Projects slip through the cracks when teams rely on manual spreadsheets or email threads. Missed change orders, late invoices, and poor follow-up quietly drain profitability. Over the course of a year, that can equal an entire team’s salary.",
      },
      {
        heading: "Automation protects margins",
        body: "InvoiceFlow enforces approvals, captures expenses instantly, and applies the right taxes every time. Finance leads get alerts when an invoice stagnates, and clients have friendly reminders plus payment plans to stay compliant.",
      },
      {
        heading: "Build a growth-ready finance stack",
        body: "Modernising billing unlocks better insights for sales, operations, and leadership. With InvoiceFlow, your invoicing layer becomes a growth engine—feeding data to CRMs, accounting tools, and KPI dashboards without manual effort.",
      },
    ],
  },
];

export const findBlogPost = (slug: string) =>
  blogPosts.find((post) => post.slug === slug);
