import { NextRequest, NextResponse } from "next/server";

// Knowledge base context for the AI
const systemContext = `You are a helpful customer support assistant for InvoiceFlow, an invoicing platform for small businesses.

Here's what you know about InvoiceFlow:

FEATURES & PRICING:
- Free Plan: 2 invoices total, 1 business, basic templates, PDF export
- Professional Plan ($6.99/mo): 15 invoices/month, 3 businesses, recurring invoices, estimates & quotes, expense tracking
- Enterprise Plan ($15.99/mo): Unlimited invoices & businesses, partial payments, payment reminders, priority support
- All paid plans include a 30-day free trial
- 14-day money-back guarantee on all paid plans

HOW TO CREATE AN INVOICE:
1. Go to Dashboard
2. Select your business
3. Click "New Invoice" button
4. Fill in client details, add items, set due date
5. Click "Create Invoice" to save
6. Send to client via email

RECURRING INVOICES (Professional & Enterprise):
1. Create a new invoice
2. Check "Make This Recurring?" option
3. Select frequency (weekly, monthly, quarterly, yearly)
4. Set start date and optionally end date
5. Enable auto-send for automatic delivery

TRACKING PAYMENTS:
1. Open an invoice
2. Click "Record Payment"
3. Enter amount and date
4. Partial payments available on Enterprise plan

MANAGING CLIENTS:
1. Go to Clients section
2. Click "Add Client"
3. Fill in name, email, address, phone
4. Save and use when creating invoices

ESTIMATES & QUOTES (Professional & Enterprise):
1. Go to Estimates section
2. Click "New Estimate"
3. Fill in details
4. Send to client
5. Convert to invoice if accepted

EXPENSE TRACKING (Professional & Enterprise):
1. Go to Expenses section
2. Click "Add Expense"
3. Enter amount, category, description
4. Mark as billable to charge to a client

BUSINESS SETTINGS:
1. Go to Dashboard
2. Select your business
3. Click "Settings" in sidebar
4. Update business name, logo, address, tax info
5. Save changes

REFUNDS:
- 14-day money-back guarantee
- Email support@invoiceflow.com
- Use Contact page with "Refund Request" reason
- Processed within 5-10 business days
- Full policy at /refund-policy

SUPPORT:
- Email: support@invoiceflow.com
- Help Center: /help
- Contact form: /contact

IMPORTANT GUIDELINES:
- Be helpful, friendly, and concise
- If you don't know something specific, suggest contacting support@invoiceflow.com
- For bug reports, ask for details and suggest using the "Report Issue" feature
- Always mention relevant features are plan-specific when applicable
- Keep responses under 200 words unless more detail is specifically needed
- Use bullet points and numbered lists for clarity
- Never make up features that don't exist`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback to simple keyword matching if no API key
      return NextResponse.json({
        response: getFallbackResponse(message),
        fallback: true,
      });
    }

    // Build conversation history for context
    const messages = [
      { role: "system", content: systemContext },
      ...(history || [])
        .slice(-6)
        .map((msg: { type: string; content: string }) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      { role: "user", content: message },
    ];

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json({
        response: getFallbackResponse(message),
        fallback: true,
      });
    }

    const data = await response.json();
    const aiResponse =
      data.choices[0]?.message?.content || getFallbackResponse(message);

    return NextResponse.json({ response: aiResponse });
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
