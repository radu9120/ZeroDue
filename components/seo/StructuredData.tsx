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
    url: "https://www.zerodue.co",
    brand: {
      "@type": "Brand",
      name: "ZeroDue",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: "https://www.zerodue.co/pricing",
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
    url: "https://www.zerodue.co",
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

export function InvoiceGeneratorFAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this invoice generator really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! You can create unlimited invoices completely free. No credit card required, no hidden fees. We offer premium features like payment tracking and automatic reminders for paid plans, but basic invoice creation is always free.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to sign up to create an invoice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No signup required to start creating your invoice! Fill out the form and generate your invoice instantly. We'll ask for your email only when you're ready to save or send it—this creates a free account automatically so you can access your invoices anytime.",
        },
      },
      {
        "@type": "Question",
        name: "Can I customize the invoice design?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Once you create an account, you can upload your logo, choose custom colors, and select from multiple professional invoice templates. The free version includes standard templates, while premium plans offer advanced customization options.",
        },
      },
      {
        "@type": "Question",
        name: "How do I send an invoice to my client?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "After creating your invoice, you can send it directly via email with one click, download it as a PDF to send manually, or share a secure link. Your client will receive a professional-looking invoice with payment options included.",
        },
      },
      {
        "@type": "Question",
        name: "What currencies does the invoice generator support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support all major currencies including GBP, USD, EUR, AUD, CAD, and many more. Simply select your currency from the dropdown when creating your invoice. The currency symbol will automatically appear on your invoice.",
        },
      },
      {
        "@type": "Question",
        name: "Can I add tax or VAT to my invoices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely! Enter your tax rate (VAT, sales tax, GST, etc.) and our system automatically calculates the tax amount. You can customize the tax label to match your country's requirements. Perfect for UK VAT, US sales tax, or any other tax system.",
        },
      },
      {
        "@type": "Question",
        name: "How do I track if my invoice has been paid?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "With a free account, you can manually mark invoices as paid in your dashboard. Premium plans include automatic payment tracking that integrates with Stripe and PayPal to update status automatically when clients pay.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create recurring invoices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Recurring invoices are available with our premium plans. Set up weekly, monthly, quarterly, or annual invoices that are automatically generated and sent to clients on your schedule.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods can I accept?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can accept credit cards, debit cards, bank transfers, PayPal, and more. Premium plans include integrated payment processing through Stripe, allowing clients to pay directly from the invoice with one click.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. We use bank-level encryption (SSL/TLS) to protect your data. Your invoices and client information are stored securely on encrypted servers. We're fully GDPR compliant and never share your data with third parties.",
        },
      },
      {
        "@type": "Question",
        name: "Can I access my invoices from my phone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Our invoice generator works perfectly on mobile devices. Access your account from any smartphone or tablet to create, edit, and send invoices on the go. No app download required—just use your mobile browser.",
        },
      },
      {
        "@type": "Question",
        name: "What's included in the free plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The free plan includes unlimited invoice creation, basic templates, PDF downloads, email sending, client management, and expense tracking. It's perfect for freelancers and small businesses just getting started.",
        },
      },
      {
        "@type": "Question",
        name: "How do I upgrade to a paid plan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can upgrade anytime from your dashboard. Choose between monthly or annual billing (save 20% with annual). Upgrading unlocks features like custom branding, payment processing, automated reminders, and recurring invoices.",
        },
      },
      {
        "@type": "Question",
        name: "Can I cancel my subscription anytime?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! You can cancel your subscription at any time with no penalties or fees. If you cancel, you'll retain access to premium features until the end of your billing period, then automatically revert to the free plan.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer support if I need help?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Free users have access to our comprehensive help center and email support. Premium users get priority support with faster response times. We're here to help you succeed with your invoicing.",
        },
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

export function InvoiceGeneratorHowToSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Create a Professional Invoice",
    description:
      "Step-by-step guide to creating a professional invoice online with automatic calculations and professional formatting.",
    image: "https://www.zerodue.co/og-cover.png",
    totalTime: "PT5M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: "0",
    },
    tool: [
      {
        "@type": "HowToTool",
        name: "ZeroDue Invoice Generator",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Enter Your Business Information",
        text: "Add your business name, address, email, and phone number. This appears at the top of the invoice and helps clients know who to contact.",
        url: "https://www.zerodue.co/invoice-generator#step1",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Add Client Details",
        text: "Enter your client's name, email, and address. This ensures the invoice is addressed correctly and you have their contact information for follow-ups.",
        url: "https://www.zerodue.co/invoice-generator#step2",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Add Line Items and Prices",
        text: "List each product or service with its description, quantity, and unit price. The total for each line item calculates automatically. You can add unlimited line items using the '+ Add Item' button.",
        url: "https://www.zerodue.co/invoice-generator#step3",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Set Invoice and Due Dates",
        text: "Choose your invoice date and payment due date. Standard payment terms are 30 days, but you can adjust based on your agreement with the client.",
        url: "https://www.zerodue.co/invoice-generator#step4",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Add Tax If Required",
        text: "If you need to charge tax (VAT, sales tax, GST), enter your tax rate as a percentage. The system automatically calculates the tax amount and adds it to your total.",
        url: "https://www.zerodue.co/invoice-generator#step5",
      },
      {
        "@type": "HowToStep",
        position: 6,
        name: "Generate and Send Your Invoice",
        text: "Click 'Generate Invoice' to save it. You'll be prompted to enter your email (which creates a free account), then you can send the invoice via email, download it as PDF, or share a payment link.",
        url: "https://www.zerodue.co/invoice-generator#step6",
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
