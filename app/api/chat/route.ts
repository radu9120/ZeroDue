import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client lazily to handle missing env
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Comprehensive knowledge base context for the AI
const systemContext = `You are a helpful, friendly customer support assistant for InvoiceFlow - a modern invoicing platform for small businesses and freelancers.

=== ABOUT INVOICEFLOW ===
InvoiceFlow helps businesses create professional invoices, track payments, manage clients, and grow their business. It's designed to be simple yet powerful.

Website: https://invcyflow.com
Support Email: support@invoiceflow.com

=== PRICING PLANS ===

FREE PLAN ($0/forever):
- 2 invoices total (lifetime limit)
- 1 business profile
- Basic invoice templates
- PDF export & download
- Unlimited clients
- Basic dashboard
- Email support (48-hour response)

PROFESSIONAL PLAN ($6.99/month or $67/year - saves $16.88):
- 15 invoices per month
- 3 business profiles
- All premium templates
- Recurring invoices (weekly, monthly, quarterly, yearly)
- Estimates & quotes (convert to invoices)
- Expense tracking
- Custom branding (logo, colors)
- Multi-currency support
- 2 team member seats
- Priority support (24-hour response)
- 30-DAY FREE TRIAL included

ENTERPRISE PLAN ($15.99/month or $149.99/year - saves $41.89):
- UNLIMITED invoices
- UNLIMITED business profiles
- All templates + full customization
- Recurring invoices
- Estimates & quotes
- Expense tracking
- Partial payments tracking
- Automated payment reminders
- Email open/click tracking
- 4 team member seats
- Priority support (6-hour response)
- Live chat support
- 30-DAY FREE TRIAL included

=== HOW TO CREATE AN INVOICE ===
1. Log in and go to Dashboard
2. Select your business (or create one first)
3. Click "New Invoice" or "Create Invoice" button
4. Fill in:
   - Client details (select existing or add new)
   - Invoice items (description, quantity, price)
   - Tax rate (optional)
   - Due date
   - Payment terms/notes
5. Click "Create Invoice" to save
6. Preview the invoice
7. Send via email or download PDF

=== RECURRING INVOICES (Professional & Enterprise) ===
1. Create a new invoice as normal
2. Check "Make This Recurring?" option
3. Choose frequency:
   - Weekly
   - Monthly  
   - Quarterly
   - Yearly
4. Set start date
5. Optionally set end date (or leave open-ended)
6. Enable "Auto-send" to automatically email clients
7. The system will generate and send invoices automatically

=== ESTIMATES & QUOTES (Professional & Enterprise) ===
1. Go to Estimates section in sidebar
2. Click "New Estimate"
3. Fill in client and line items
4. Send to client for review
5. If accepted, click "Convert to Invoice" to create an invoice from it
6. Estimates help you get approval before billing

=== EXPENSE TRACKING (Professional & Enterprise) ===
1. Go to Expenses section in sidebar
2. Click "Add Expense"
3. Enter:
   - Amount
   - Category (travel, office, software, etc.)
   - Description
   - Date
   - Receipt (optional upload)
4. Mark as "Billable" to charge to a specific client
5. View expense reports and totals

=== MANAGING CLIENTS ===
1. Go to Clients section in sidebar
2. Click "Add Client"
3. Enter client details:
   - Name (person or company)
   - Email address
   - Phone number
   - Billing address
4. Save the client
5. Clients appear in dropdown when creating invoices
6. View client history (all invoices, payments)

=== MANAGING BUSINESSES ===
1. From Dashboard, click "Add Business" or select existing
2. For each business, you can set:
   - Business name
   - Logo (appears on invoices)
   - Email address
   - Phone number
   - Physical address
   - Tax/VAT information
   - Default payment terms
   - Bank details for payments
3. Go to Settings to update business info anytime

=== PAYMENT TRACKING ===
Invoice Statuses:
- DRAFT: Not sent yet, still editing
- SENT: Emailed to client
- VIEWED: Client opened the invoice (Enterprise)
- PAID: Payment received (mark manually)
- PARTIALLY PAID: Some payment received (Enterprise)
- OVERDUE: Past due date and unpaid

To record a payment:
1. Open the invoice
2. Click "Record Payment" 
3. Enter amount and date
4. For partial payments (Enterprise): enter partial amount
5. Status updates automatically

=== PDF & SHARING ===
- Download any invoice as PDF
- Invoices are professionally formatted
- Include your logo and branding (paid plans)
- Share via email directly from the app
- Clients receive a link to view online too

=== EMAIL TRACKING (Enterprise) ===
- See when clients open your invoice email
- See when they click links
- Track engagement in invoice list
- Helps with follow-up timing

=== PAYMENT REMINDERS (Enterprise) ===
- Set automatic reminder emails
- Customize timing (e.g., 3 days before due, 1 day after)
- Customize reminder message
- Reduces late payments by ~40%

=== REFUND POLICY ===
14-DAY MONEY-BACK GUARANTEE on all paid plans!

Eligible for refund:
✓ First-time subscription within 14 days
✓ Monthly subscriptions (first month)
✓ Yearly subscriptions (within 14 days)
✓ Plan upgrades (within 14 days)
✓ Technical issues preventing usage

NOT eligible:
✗ After 14 days from purchase
✗ Renewal payments (cancel before renewal)
✗ Accounts terminated for TOS violations
✗ Previously refunded customers (one per customer)

How to request refund:
1. Email support@invoiceflow.com with subject "Refund Request"
2. Include your account email and reason
3. We process within 5-10 business days
4. Or use Contact page at /contact with "Refund Request" reason

=== CANCELLATION ===
- Cancel anytime from Dashboard > Plan settings
- Or email support@invoiceflow.com
- Access continues until end of billing period
- No cancellation fees
- Data retained for 30 days after cancellation

=== SECURITY ===
- Bank-level 256-bit SSL encryption
- Secure data centers
- GDPR compliant
- Regular security audits
- SOC 2 compliant
- PCI DSS compliant for payments
- Data backed up daily

=== PAYMENT METHODS ACCEPTED ===
For subscriptions:
- Visa, Mastercard, American Express
- Processed securely via Stripe

Note: InvoiceFlow does NOT process client payments. You include your own payment instructions (bank details, PayPal, etc.) on invoices.

=== IMPORTING DATA ===
- Import clients via CSV upload
- Import existing invoices via CSV
- Enterprise: Migration assistance available

=== COMMON ISSUES & SOLUTIONS ===

"I can't create more invoices":
→ You may have reached your plan limit. Upgrade your plan or wait for monthly reset (Professional plan resets monthly).

"Invoice not sending":
→ Check client email is correct. Check spam folder. Try resending from invoice view.

"Can't add more businesses":
→ Free plan: 1 business. Professional: 3. Enterprise: Unlimited. Upgrade to add more.

"Forgot password":
→ Use "Forgot Password" link on sign-in page. Check email (and spam) for reset link.

"Need to change business details":
→ Go to Dashboard > Select business > Settings. Update and save.

"How do I get a receipt for my subscription?":
→ Receipts are emailed automatically. Check spam. Or email support@invoiceflow.com.

=== PAGE NAVIGATION ===
- Home: /
- Dashboard: /dashboard
- Sign In: /sign-in
- Sign Up: /sign-up
- Pricing: /pricing
- Contact: /contact
- Help Center: /help
- FAQ: /faq
- Blog: /blog
- Privacy Policy: /privacy-policy
- Refund Policy: /refund-policy
- Cookies: /cookies

=== SUPPORT CHANNELS ===
1. This chatbot (24/7 instant help)
2. Email: support@invoiceflow.com
3. Contact form: /contact
4. Help Center: /help
5. FAQ page: /faq

Response times:
- Free users: 48 hours
- Professional: 24 hours
- Enterprise: 6 hours + live chat

=== YOUR GUIDELINES ===
1. Be helpful, friendly, and concise
2. Use bullet points and numbered steps for clarity
3. Keep responses under 200 words unless more detail is needed
4. If unsure, suggest contacting support@invoiceflow.com
5. Always mention if a feature is plan-specific
6. For bug reports, ask for details and suggest emailing support
7. Never make up features that don't exist
8. Suggest relevant pages (like /help, /pricing, /contact) when appropriate
9. Be encouraging and positive about the user's business
10. If someone is upset, be empathetic and helpful
11. You are the AI Assistant feature - a key selling point of InvoiceFlow
12. Mention that you're available 24/7 to help when relevant
13. If asked about yourself, explain you're an AI assistant powered by advanced technology to help users instantly`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    try {
      const ai = getAI();

      if (!ai) {
        // No API key, use fallback
        return NextResponse.json({
          response: getFallbackResponse(message),
          fallback: true,
        });
      }

      // Build conversation context from history
      const conversationHistory = (history || [])
        .slice(-6)
        .map(
          (msg: { type: string; content: string }) =>
            `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n\n");

      // Create the full prompt with system context and conversation history
      const fullPrompt = `${systemContext}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ""}User: ${message}

Please respond helpfully and concisely.`;

      // Call Gemini API
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: fullPrompt,
      });

      const aiResponse = response.text || getFallbackResponse(message);

      return NextResponse.json({ response: aiResponse });
    } catch (aiError) {
      console.error("Gemini API error:", aiError);
      // Fallback to keyword matching if Gemini fails
      return NextResponse.json({
        response: getFallbackResponse(message),
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

// Fallback response when AI is not available
function getFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Bug/Issue detection
  if (
    lowerQuery.includes("bug") ||
    lowerQuery.includes("issue") ||
    lowerQuery.includes("problem") ||
    lowerQuery.includes("error") ||
    lowerQuery.includes("not working") ||
    lowerQuery.includes("broken")
  ) {
    return `I'm sorry you're experiencing issues! To report this problem:

1. Please describe what you were trying to do
2. What error message did you see (if any)?
3. Click the "Report Issue" button below to send this to our team

We typically respond within 24 hours. For urgent issues, email support@invoiceflow.com`;
  }

  // Keyword-based responses
  if (lowerQuery.includes("create") && lowerQuery.includes("invoice")) {
    return `To create an invoice:
1. Go to your Dashboard
2. Select your business
3. Click "New Invoice" button
4. Fill in client details, add items, and set the due date
5. Click "Create Invoice" to save
6. Send it to your client via email!`;
  }

  if (lowerQuery.includes("recurring")) {
    return `Recurring invoices are available on Professional and Enterprise plans.

To set up a recurring invoice:
1. Create a new invoice
2. Check "Make This Recurring?" option
3. Select frequency (weekly, monthly, quarterly, etc.)
4. Set start date and optionally an end date
5. Enable auto-send for automatic delivery`;
  }

  if (lowerQuery.includes("payment")) {
    return `To track payments:
1. Open an invoice
2. Click "Record Payment" button
3. Enter the payment amount and date
4. Partial payments are available on Enterprise plan

The invoice status will update automatically!`;
  }

  if (lowerQuery.includes("client")) {
    return `To add a new client:
1. Go to Clients section in the sidebar
2. Click "Add Client" button
3. Fill in client name, email, address, and phone
4. Click "Save"

You can then select this client when creating invoices.`;
  }

  if (lowerQuery.includes("estimate") || lowerQuery.includes("quote")) {
    return `Estimates & Quotes are available on Professional and Enterprise plans.

To create an estimate:
1. Go to Estimates section
2. Click "New Estimate"
3. Fill in the details
4. Send to your client
5. Convert to invoice with one click if accepted!`;
  }

  if (lowerQuery.includes("expense")) {
    return `Expense tracking is available on Professional and Enterprise plans.

To track expenses:
1. Go to Expenses section
2. Click "Add Expense"
3. Enter amount, category, and description
4. Mark as billable to charge to a client`;
  }

  if (
    lowerQuery.includes("upgrade") ||
    lowerQuery.includes("plan") ||
    lowerQuery.includes("pricing")
  ) {
    return `Our plans:

**Free**: 2 invoices, 1 business, basic features
**Professional** ($6.99/mo): 15 invoices/mo, recurring invoices, estimates, expenses
**Enterprise** ($15.99/mo): Unlimited everything, partial payments, priority support

All paid plans include a 30-day free trial! Go to /upgrade to get started.`;
  }

  if (lowerQuery.includes("refund")) {
    return `We offer a 14-day money-back guarantee on all paid plans.

To request a refund:
1. Contact us within 14 days of purchase
2. Email support@invoiceflow.com or use the Contact page
3. We'll process your refund within 5-10 business days

View our full policy at /refund-policy`;
  }

  if (lowerQuery.includes("setting")) {
    return `To update your business settings:
1. Go to Dashboard
2. Select your business
3. Click "Settings" in the sidebar
4. Update business name, logo, address, tax info
5. Click "Save Changes"`;
  }

  // Default response
  return `I can help you with:

• **Invoices** - Creating, sending, and managing invoices
• **Payments** - Recording and tracking payments
• **Clients** - Adding and managing clients
• **Recurring** - Setting up recurring invoices
• **Estimates** - Creating quotes and estimates
• **Expenses** - Tracking business expenses
• **Billing** - Upgrading your plan

Try asking something like "How do I create an invoice?" or describe any issue you're having.

For complex questions, email support@invoiceflow.com`;
}
