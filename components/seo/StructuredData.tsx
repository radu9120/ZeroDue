const toIsoDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
};

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZeroDue",
    url: "https://www.zerodue.co",
    logo: "https://www.zerodue.co/logo.png",
    sameAs: [
      "https://twitter.com/zerodueco",
      "https://www.linkedin.com/company/zerodue",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://www.zerodue.co/contact",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ZeroDue",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      description: "Free plan available",
    },
    description:
      "Professional invoice generator and billing software for freelancers and small businesses. Create, send, and track invoices online.",
    url: "https://www.zerodue.co",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ZeroDue",
    url: "https://www.zerodue.co",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.zerodue.co/blog?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebPageSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostSchema({
  title,
  description,
  publishedAt,
  author,
  url,
  image,
}: {
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  url: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    datePublished: toIsoDate(publishedAt),
    dateModified: toIsoDate(publishedAt),
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "ZeroDue",
      logo: {
        "@type": "ImageObject",
        url: "https://www.zerodue.co/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url: url,
    ...(image && { image: image }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ReviewsSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ZeroDue Invoice Software",
    description: "Professional invoice generator and billing software",
    brand: {
      "@type": "Brand",
      name: "ZeroDue",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: 5,
          bestRating: 5,
        },
        author: {
          "@type": "Person",
          name: "Sarah Johnson",
        },
        reviewBody:
          "ZeroDue has completely transformed how we handle our billing. The automated reminders have reduced our late payments by 75%.",
      },
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: 5,
          bestRating: 5,
        },
        author: {
          "@type": "Person",
          name: "Michael Chen",
        },
        reviewBody:
          "The customizable templates make it easy to work with international clients. Our invoicing process is now 3x faster.",
      },
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: 5,
          bestRating: 5,
        },
        author: {
          "@type": "Person",
          name: "David Wilson",
        },
        reviewBody:
          "The financial insights have given us visibility we never had before. It's like having a financial advisor built into our invoicing system.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HowToSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Create and Send Professional Invoices with ZeroDue",
    description:
      "Learn how to create, customize, and send professional invoices to your clients in just a few minutes using ZeroDue.",
    totalTime: "PT5M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: 0,
    },
    step: [
      {
        "@type": "HowToStep",
        name: "Create Your Account",
        text: "Sign up for a free ZeroDue account using your email or Google account.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Set Up Your Business",
        text: "Add your business details including name, address, logo, and payment information.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Create an Invoice",
        text: "Click 'Create Invoice', add your client details, line items, and customize the design.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Send to Client",
        text: "Send the invoice directly to your client's email with automated tracking and payment reminders.",
        position: 4,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl,
    publisher: {
      "@type": "Organization",
      name: "ZeroDue",
      logo: {
        "@type": "ImageObject",
        url: "https://www.zerodue.co/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PricingSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ZeroDue Invoicing Software",
    description:
      "Professional invoice generator and billing software for freelancers and small businesses",
    brand: {
      "@type": "Brand",
      name: "ZeroDue",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan",
        price: 0,
        priceCurrency: "GBP",
        description:
          "3 invoices per month, basic templates, essential features",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Professional Plan",
        price: 9.99,
        priceCurrency: "GBP",
        description:
          "15 invoices per month, 3 business profiles, priority support",
        priceValidUntil: "2025-12-31",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Enterprise Plan",
        price: 19.99,
        priceCurrency: "GBP",
        description: "Unlimited invoices, custom templates, dedicated support",
        priceValidUntil: "2025-12-31",
        availability: "https://schema.org/InStock",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ZeroDue",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Invoice Software",
    operatingSystem: "Web Browser",
    availableOnDevice: ["Desktop", "Mobile", "Tablet"],
    featureList: [
      "Invoice Generation",
      "Payment Tracking",
      "Automated Reminders",
      "Multi-Currency Support",
      "Tax Calculations",
      "Client Management",
      "Expense Tracking",
      "Financial Reports",
    ],
    screenshot: "https://www.zerodue.co/og-cover.png",
    softwareVersion: "1.0",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: 0,
      highPrice: 19.99,
      priceCurrency: "GBP",
      offerCount: 3,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
