"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  HelpCircle,
  FileText,
  CreditCard,
  Settings,
  Bug,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  query: string;
}

const quickActions: QuickAction[] = [
  {
    id: "invoices",
    label: "How do I create an invoice?",
    icon: FileText,
    query: "How do I create an invoice?",
  },
  {
    id: "recurring",
    label: "Set up recurring invoices",
    icon: Sparkles,
    query: "How do I set up recurring invoices?",
  },
  {
    id: "payments",
    label: "Track payments",
    icon: CreditCard,
    query: "How do I track payments?",
  },
  {
    id: "settings",
    label: "Update business settings",
    icon: Settings,
    query: "How do I update my business settings?",
  },
];

// Knowledge base for common questions
const knowledgeBase: Record<string, string> = {
  // Invoice related
  "create invoice": `To create an invoice:
1. Go to your Dashboard
2. Select your business
3. Click "New Invoice" button
4. Fill in client details, add items, and set the due date
5. Click "Create Invoice" to save as draft
6. You can then send it to your client via email!`,

  "send invoice": `To send an invoice to a client:
1. Create or open an existing invoice
2. Click the "Send" button
3. The invoice will be emailed to your client
4. You can track when they view it in the invoice details`,

  "recurring invoice": `Recurring invoices are available on Professional and Enterprise plans.
To set up a recurring invoice:
1. Go to create a new invoice
2. Check "Make This Recurring?" option
3. Select frequency (weekly, monthly, quarterly, etc.)
4. Set the start date and optionally an end date
5. Enable auto-send if you want invoices sent automatically`,

  // Payment related
  "track payment": `To track payments:
1. Open an invoice
2. Click "Record Payment" button
3. Enter the payment amount and date
4. You can record partial payments if needed
The invoice status will update automatically!`,

  "partial payment": `Partial payments are available on Enterprise plans.
To record a partial payment:
1. Open the invoice
2. Click "Record Payment"
3. Enter the partial amount received
4. The remaining balance will be shown on the invoice`,

  // Business related
  "business settings": `To update your business settings:
1. Go to Dashboard
2. Click on your business card or select from dropdown
3. Click "Settings" in the sidebar
4. Update your business name, logo, address, tax info, etc.
5. Click "Save Changes"`,

  "add client": `To add a new client:
1. Go to Clients section in the sidebar
2. Click "Add Client" button
3. Fill in client name, email, address, and phone
4. Click "Save"
You can then select this client when creating invoices.`,

  // Estimates
  "create estimate": `Estimates & Quotes are available on Professional and Enterprise plans.
To create an estimate:
1. Go to Estimates section
2. Click "New Estimate"
3. Fill in the details similar to an invoice
4. Send it to your client
5. If accepted, you can convert it to an invoice with one click!`,

  // Expenses
  "track expense": `Expense tracking is available on Professional and Enterprise plans.
To track expenses:
1. Go to Expenses section
2. Click "Add Expense"
3. Enter the amount, category, and description
4. Mark as billable if you want to charge it to a client
5. Track your spending with monthly reports`,

  // Pricing
  "upgrade plan": `To upgrade your plan:
1. Click on "Upgrade" or go to the Pricing page
2. Choose Professional ($6.99/mo) or Enterprise ($15.99/mo)
3. Professional includes: 15 invoices/mo, recurring invoices, estimates, expenses
4. Enterprise includes: Unlimited invoices, partial payments, payment reminders`,

  "free plan": `The Free plan includes:
• 2 invoices total
• 1 business
• Basic templates
• PDF export
To get more features like recurring invoices, estimates, and expense tracking, upgrade to Professional or Enterprise.`,

  // General
  help: `I can help you with:
• Creating and sending invoices
• Setting up recurring invoices
• Tracking payments
• Managing clients
• Creating estimates/quotes
• Tracking expenses
• Upgrading your plan

Just ask me a question or report an issue!`,
};

function findAnswer(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Check for issue/bug report intent
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

  // Search knowledge base
  for (const [key, answer] of Object.entries(knowledgeBase)) {
    if (lowerQuery.includes(key)) {
      return answer;
    }
  }

  // Check for specific keywords
  if (lowerQuery.includes("invoice")) {
    return knowledgeBase["create invoice"];
  }
  if (lowerQuery.includes("payment")) {
    return knowledgeBase["track payment"];
  }
  if (lowerQuery.includes("client")) {
    return knowledgeBase["add client"];
  }
  if (lowerQuery.includes("estimate") || lowerQuery.includes("quote")) {
    return knowledgeBase["create estimate"];
  }
  if (lowerQuery.includes("expense")) {
    return knowledgeBase["track expense"];
  }
  if (lowerQuery.includes("recurring")) {
    return knowledgeBase["recurring invoice"];
  }
  if (
    lowerQuery.includes("upgrade") ||
    lowerQuery.includes("plan") ||
    lowerQuery.includes("pricing")
  ) {
    return knowledgeBase["upgrade plan"];
  }
  if (lowerQuery.includes("setting")) {
    return knowledgeBase["business settings"];
  }

  // Default response
  return `I'm not sure I understand that question. Here's what I can help with:

• **Invoices** - Creating, sending, and managing invoices
• **Payments** - Recording and tracking payments
• **Clients** - Adding and managing clients
• **Recurring** - Setting up recurring invoices
• **Estimates** - Creating quotes and estimates
• **Expenses** - Tracking business expenses
• **Billing** - Upgrading your plan

Try asking something like "How do I create an invoice?" or click one of the quick actions below.

If you're experiencing a problem, just describe it and I'll help you report it to our team.`;
}

interface ChatBotProps {
  userEmail?: string;
  businessName?: string;
}

export default function ChatBot({ userEmail, businessName }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      content: `Hi there! 👋 I'm your InvoiceFlow assistant. I can help you with:

• Creating and sending invoices
• Setting up recurring billing
• Tracking payments
• Managing your business

How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    const answer = findAnswer(input);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: answer,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);

    // Show report form if it seems like an issue
    if (
      input.toLowerCase().includes("bug") ||
      input.toLowerCase().includes("issue") ||
      input.toLowerCase().includes("problem") ||
      input.toLowerCase().includes("error") ||
      input.toLowerCase().includes("not working")
    ) {
      setShowReportForm(true);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInput(action.query);
    // Auto-send after setting input
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: action.query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(action.query);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send issue report to API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName || "Dashboard User",
          email: userEmail || "unknown@user.com",
          subject: "Bug Report from Chat",
          message: `Issue Report:\n\n${issueDescription}\n\nChat History:\n${messages
            .map((m) => `${m.type === "user" ? "User" : "Bot"}: ${m.content}`)
            .join("\n")}`,
        }),
      });

      if (response.ok) {
        toast.success(
          "Issue reported successfully! We'll get back to you soon."
        );
        setShowReportForm(false);
        setIssueDescription("");

        const thankYouMessage: Message = {
          id: Date.now().toString(),
          type: "bot",
          content:
            "Thanks for reporting this issue! 🙏 Our team has been notified and will look into it. We'll get back to you via email if we need more information.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, thankYouMessage]);
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      toast.error(
        "Failed to submit issue. Please try again or email support@invoiceflow.com"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-blue-500/40 transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">InvoiceFlow Help</h3>
                  <p className="text-xs text-blue-100">
                    Ask anything or report issues
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Report Issue Form */}
            <AnimatePresence>
              {showReportForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Report Issue
                    </span>
                    <button
                      onClick={() => setShowReportForm(false)}
                      className="ml-auto text-amber-600 hover:text-amber-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    className="min-h-[80px] text-sm mb-2 bg-white dark:bg-slate-800"
                  />
                  <Button
                    onClick={handleReportIssue}
                    disabled={isSubmitting}
                    size="sm"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Submit Issue Report
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Actions */}
            {messages.length <= 2 && !showReportForm && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Quick questions:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-left"
                    >
                      <action.icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  placeholder="Type your question..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => setShowReportForm(true)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 flex items-center gap-1"
                >
                  <Bug className="w-3 h-3" />
                  Report an issue
                </button>
                <a
                  href="/help"
                  target="_blank"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  Help Center
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
