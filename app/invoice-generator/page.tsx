"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Mail,
  Download,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Zap,
  Shield,
  Clock,
  CreditCard,
  Users,
  TrendingUp,
  Calculator,
  Globe,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  InvoiceGeneratorFAQSchema,
  InvoiceGeneratorHowToSchema,
} from "@/components/seo/StructuredData";
import { toast } from "sonner";
import { format } from "date-fns";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export default function InvoiceGeneratorPage() {
  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-0001");
  const [issueDate, setIssueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dueDate, setDueDate] = useState(
    format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, amount: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("GBP");

  // Email capture modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { description: "", quantity: 1, unit_price: 0, amount: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Calculate amount
    if (field === "quantity" || field === "unit_price") {
      newItems[index].amount =
        newItems[index].quantity * newItems[index].unit_price;
    }
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCreateInvoice = () => {
    // Validate required fields
    if (!businessName || !businessEmail || !clientName || !clientEmail) {
      toast.error("Please fill in all required business and client details");
      return;
    }

    if (items.length === 0 || items.every((item) => !item.description)) {
      toast.error("Please add at least one item to your invoice");
      return;
    }

    // Show email capture modal
    setShowEmailModal(true);
  };

  const handleSubmitWithEmail = async () => {
    if (!userEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/invoices/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          business_email: businessEmail,
          business_address: businessAddress,
          business_phone: businessPhone,
          currency,
          client_name: clientName,
          client_email: clientEmail,
          client_address: clientAddress,
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          due_date: dueDate,
          items,
          subtotal: calculateSubtotal(),
          tax_rate: taxRate,
          total: calculateTotal(),
          notes,
          guest_email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      // Close email modal and show success modal
      setShowEmailModal(false);
      setShowSuccessModal(true);

      toast.success(data.message);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <InvoiceGeneratorFAQSchema />
      <InvoiceGeneratorHowToSchema />
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Hero Section */}
        <section className="pt-32 pb-12">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                Free Invoice Generator{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Online
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Create professional invoices in seconds. No signup required to
                start. Fill out the form below, add your items, and generate
                your invoice instantly.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Invoice Generator Tool */}
        <section className="pb-20">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Business Details */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Your Business
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Business Name *
                      </label>
                      <Input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Acme Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="hello@acme.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Address
                      </label>
                      <Textarea
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="123 Business St, London"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone
                      </label>
                      <Input
                        value={businessPhone}
                        onChange={(e) => setBusinessPhone(e.target.value)}
                        placeholder="+44 20 1234 5678"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Details */}
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Bill To
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Client Name *
                      </label>
                      <Input
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Client Company Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Address
                      </label>
                      <Textarea
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        placeholder="456 Client Ave, Manchester"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Invoice #
                        </label>
                        <Input
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                        >
                          <option value="GBP">GBP £</option>
                          <option value="USD">USD $</option>
                          <option value="EUR">EUR €</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Issue Date
                  </label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-green-600" />
                  Line Items
                </h2>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 items-end"
                    >
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Description
                        </label>
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          placeholder="Web design services"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Qty
                        </label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          min="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Price
                        </label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unit_price",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Amount
                        </label>
                        <Input value={item.amount.toFixed(2)} disabled />
                      </div>
                      <div className="col-span-1">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="neutralOutline"
                    onClick={addItem}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-full md:w-96 space-y-3">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {currency === "GBP" && "£"}
                      {currency === "USD" && "$"}
                      {currency === "EUR" && "€"}
                      {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span>Tax Rate (%):</span>
                    <Input
                      type="number"
                      value={taxRate}
                      onChange={(e) =>
                        setTaxRate(parseFloat(e.target.value) || 0)
                      }
                      className="w-24"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Tax Amount:</span>
                    <span className="font-medium">
                      {currency === "GBP" && "£"}
                      {currency === "USD" && "$"}
                      {currency === "EUR" && "€"}
                      {calculateTax().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span>Total:</span>
                    <span>
                      {currency === "GBP" && "£"}
                      {currency === "USD" && "$"}
                      {currency === "EUR" && "€"}
                      {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes / Payment Terms
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment due within 30 days. Bank transfer details..."
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={handleCreateInvoice}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Invoice
                </Button>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                  Free forever • No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                One more step!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Enter your email to save your invoice and get instant access.
                We'll create a free account for you automatically.
              </p>
              <div className="space-y-4">
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="text-lg"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowEmailModal(false)}
                    variant="neutralOutline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitWithEmail}
                    disabled={isCreating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreating ? "Creating..." : "Create Invoice"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                By continuing, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Check Your Email!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We've sent you a magic link to{" "}
                <strong className="text-slate-900 dark:text-white">
                  {userEmail}
                </strong>
                . Click the link in your email to access your invoice and
                dashboard.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Next steps:</strong>
                  <br />
                  1. Check your inbox (and spam folder)
                  <br />
                  2. Click the verification link
                  <br />
                  3. Access your invoice in the dashboard
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Another Invoice
                </Button>
                <Link href="/sign-in">
                  <Button variant="neutralOutline" className="w-full">
                    Already verified? Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* SEO Content Section */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
              Why Use a Free Online Invoice Generator?
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                An online invoice generator saves time, ensures professionalism,
                and helps you get paid faster. Unlike Excel or Word templates,
                an online tool automatically calculates totals, saves your
                information for future invoices, and lets you send invoices
                directly to clients with just one click.
              </p>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4">
                The Problem with Traditional Invoicing Methods
              </h3>
              <p className="mb-4">
                Many freelancers and small business owners still create invoices
                manually using Word documents or Excel spreadsheets. While this
                might seem simple at first, it quickly becomes a time-consuming
                hassle:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>
                  You waste time copying and pasting client information from
                  previous invoices
                </li>
                <li>
                  Manual calculations lead to errors that damage your
                  professional image
                </li>
                <li>Finding old invoices buried in folders takes forever</li>
                <li>
                  There's no easy way to track which invoices have been paid
                </li>
                <li>
                  Sending invoices requires saving as PDF, opening email, and
                  attaching files
                </li>
                <li>
                  You have no visibility into whether clients have viewed your
                  invoices
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4">
                How an Online Invoice Generator Solves These Problems
              </h3>
              <p className="mb-4">
                A modern online invoice generator like ZeroDue eliminates all
                these frustrations. Here's how:
              </p>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Instant Invoice Creation
                </h4>
                <p>
                  Create professional invoices in under 60 seconds. Fill in your
                  details once, and they're automatically saved for next time.
                  Our smart system remembers your clients, items, and pricing,
                  so you can generate invoices with just a few clicks.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-green-600" />
                  Automatic Calculations
                </h4>
                <p>
                  Never worry about math errors again. Our invoice generator
                  automatically calculates subtotals, applies tax rates, adds
                  discounts, and computes the final total. Support for multiple
                  currencies and tax types means you can invoice clients
                  anywhere in the world.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Mail className="w-6 h-6 text-purple-600" />
                  One-Click Sending
                </h4>
                <p>
                  Send invoices directly to clients via email without leaving
                  the platform. Include payment links so clients can pay
                  instantly. Track when invoices are viewed and receive
                  notifications when payments are made.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4">
                Who Should Use an Invoice Generator?
              </h3>
              <p className="mb-4">Online invoice generators are perfect for:</p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Freelancers & Consultants
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Designers, developers, writers, and consultants who need to
                    invoice multiple clients regularly. Perfect for hourly
                    billing or project-based work.
                  </p>
                  <Link
                    href="/industries/freelancers"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium mt-3 inline-block"
                  >
                    Learn more for freelancers →
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Contractors & Tradespeople
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Plumbers, electricians, cleaners, and other service
                    providers who need quick, professional invoices on the job
                    site.
                  </p>
                  <Link
                    href="/industries/contractors"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-medium mt-3 inline-block"
                  >
                    Learn more for contractors →
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Small Businesses
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Small companies that need professional invoicing without the
                    complexity and cost of full accounting software.
                  </p>
                  <Link
                    href="/pricing"
                    className="text-green-600 hover:text-green-700 dark:text-green-400 text-sm font-medium mt-3 inline-block"
                  >
                    View pricing plans →
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Agencies & Studios
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Creative agencies, marketing firms, and studios that manage
                    multiple clients and projects simultaneously.
                  </p>
                  <Link
                    href="/blog/agencies-stay-cash-flow-positive"
                    className="text-orange-600 hover:text-orange-700 dark:text-orange-400 text-sm font-medium mt-3 inline-block"
                  >
                    Read our agency guide →
                  </Link>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4">
                How to Create a Professional Invoice (Step-by-Step)
              </h3>
              <p className="mb-6">
                Creating a professional invoice is simple when you know what to
                include. Follow these steps:
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Add Your Business Information
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Include your business name, address, phone number, and
                      email. If you have a logo, add it for a more professional
                      look. Don't forget your tax ID or VAT number if
                      applicable.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Enter Client Details
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Add your client's company name, contact person, email, and
                      billing address. Having complete contact information
                      ensures smooth communication and payment processing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Set Invoice Number and Dates
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Use a unique invoice number (e.g., INV-0001) for tracking.
                      Set the issue date and due date. Common payment terms are
                      Net 30 (due in 30 days) or Net 15 (due in 15 days).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      List Products or Services
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Add line items for each product or service. Include a
                      clear description, quantity, unit price, and total amount.
                      Be specific—instead of "Design work," write "Logo design -
                      3 concepts."
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Calculate Totals and Taxes
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Show the subtotal, then add any applicable taxes (VAT,
                      sales tax, GST). If offering a discount, display it
                      clearly. The final total should be prominent and easy to
                      find.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Add Payment Terms and Instructions
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Specify how clients can pay (bank transfer, credit card,
                      PayPal). Include your bank details or payment link.
                      Mention any late fees and add a thank you note for good
                      measure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Pro Tip:</strong> Always save a copy of every invoice
                  you send. Our invoice generator automatically stores all your
                  invoices in one place, making it easy to track payments and
                  reference past work.{" "}
                  <Link
                    href="/blog/accurate-invoicing-matters"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    Learn why accurate invoicing matters →
                  </Link>
                </p>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4">
                Invoice Generator vs. Invoice Templates
              </h3>
              <p className="mb-6">
                Should you use an online invoice generator or download a
                template? Here's how they compare:
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700">
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-left">
                        Feature
                      </th>
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        Online Generator
                      </th>
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        Template (Excel/Word)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                        Setup time
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                        <span className="text-sm">2 minutes</span>
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-slate-500">
                        10+ minutes per invoice
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                        Automatic calculations
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-slate-500">
                        Manual (error-prone)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                        Save client information
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-slate-500">
                        Copy/paste each time
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                        Track payments
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-slate-500">
                        No tracking
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                        Send invoices
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                        <span className="text-sm">One click</span>
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-slate-500">
                        Save, email, attach
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                        Accept online payments
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-slate-500">
                        Not possible
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mb-6">
                While{" "}
                <Link
                  href="/templates"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  downloadable invoice templates
                </Link>{" "}
                are useful for occasional invoicing, an online generator is far
                more efficient for regular use. That said, we offer both—use our
                free templates for one-off invoices, and the online generator
                for your regular invoicing needs.
              </p>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-12 mb-4">
                Common Invoicing Mistakes to Avoid
              </h3>

              <div className="space-y-4 mb-8">
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    ❌ Missing or Unclear Payment Terms
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Always specify when payment is due and what methods you
                    accept. Vague terms like "pay soon" lead to delayed
                    payments.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    ❌ Incomplete Contact Information
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Include your full business name, address, email, and phone.
                    Missing contact info looks unprofessional and makes it
                    harder for clients to pay you.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    ❌ Vague Item Descriptions
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    "Consulting services" isn't specific enough. Write
                    "Marketing strategy consultation - 4 hours" so clients know
                    exactly what they're paying for.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    ❌ Calculation Errors
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manual calculations often have mistakes. Use an invoice
                    generator with automatic calculations to avoid embarrassing
                    errors that undermine your professionalism.
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    ❌ Not Following Up
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Don't wait 60 days to chase an unpaid invoice. Set up
                    automatic reminders to follow up professionally when payment
                    is overdue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-12">
              Everything you need to know about using our free invoice generator
            </p>

            <div className="space-y-6">
              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Is this invoice generator really free?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Yes! You can create unlimited invoices completely free. No
                  credit card required, no hidden fees. We offer premium
                  features like payment tracking and automatic reminders for
                  paid plans, but basic invoice creation is always free.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Do I need to sign up to create an invoice?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  No signup required to start creating your invoice! Fill out
                  the form above and generate your invoice instantly. We'll ask
                  for your email only when you're ready to save or send it—this
                  creates a free account automatically so you can access your
                  invoices anytime.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Can I customize the invoice design?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Yes! Once you create an account, you can upload your logo,
                  choose custom colors, and select from multiple professional
                  invoice templates. The free version includes standard
                  templates, while premium plans offer advanced customization
                  options.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  How do I send an invoice to my client?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  After creating your invoice, you can send it directly via
                  email with one click, download it as a PDF to send manually,
                  or share a secure link. Your client will receive a
                  professional-looking invoice with payment options included.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  What currencies does the invoice generator support?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  We support all major currencies including GBP, USD, EUR, AUD,
                  CAD, and many more. Simply select your currency from the
                  dropdown when creating your invoice. The currency symbol will
                  automatically appear on your invoice.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Can I add tax or VAT to my invoices?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Absolutely! Enter your tax rate (VAT, sales tax, GST, etc.)
                  and our system automatically calculates the tax amount. You
                  can customize the tax label to match your country's
                  requirements. Perfect for UK VAT, US sales tax, or any other
                  tax system.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  How do I track if my invoice has been paid?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  With a free account, you can manually mark invoices as paid in
                  your dashboard. Premium plans include automatic payment
                  tracking, real-time notifications when clients view invoices,
                  and automatic status updates when payments are received
                  through integrated payment processors.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Can clients pay directly from the invoice?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Yes! Upgrade to a paid plan to enable online payments. Clients
                  can pay via credit card, debit card, or bank transfer directly
                  from the invoice. Payments are processed securely through
                  Stripe, and you'll receive the funds in your bank account
                  automatically.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  What's the difference between an invoice and an estimate?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  An estimate (or quote) is a projection of costs sent before
                  work begins. An invoice is a payment request sent after work
                  is completed. Our platform supports both—create estimates to
                  win clients, then convert them to invoices with one click when
                  the project is done.
                  <Link
                    href="/tools/estimate-generator"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium block mt-2"
                  >
                    Try our estimate generator →
                  </Link>
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Is my data secure?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Absolutely. All data is encrypted in transit and at rest using
                  bank-level SSL encryption. We're GDPR compliant and never
                  share your data with third parties. Your invoices, client
                  information, and business details are completely private and
                  secure.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Can I use this for international clients?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Yes! Our invoice generator supports multiple currencies and
                  international tax requirements. You can invoice clients
                  anywhere in the world. Add currency exchange rates, handle
                  cross-border VAT, and include international payment
                  instructions easily.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Can I create recurring invoices?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Yes! Premium plans include recurring invoice functionality.
                  Set up monthly, quarterly, or annual invoices that are
                  automatically generated and sent to clients. Perfect for
                  retainers, subscriptions, or ongoing services.
                  <Link
                    href="/blog/small-business-invoicing-software-guide"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium block mt-2"
                  >
                    Learn about recurring billing →
                  </Link>
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  What if I need help or support?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  We're here to help! Check our comprehensive{" "}
                  <Link
                    href="/faq"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    FAQ page
                  </Link>
                  , browse our{" "}
                  <Link
                    href="/help"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    help center
                  </Link>
                  , or{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    contact our support team
                  </Link>
                  . Premium plans get priority email support with responses
                  within 24 hours.
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  How is this different from QuickBooks or FreshBooks?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  ZeroDue focuses specifically on invoicing, making it simpler
                  and more affordable than full accounting software like
                  QuickBooks or FreshBooks. If you just need to create and send
                  invoices (not manage full books), ZeroDue is faster to learn,
                  easier to use, and costs less.
                  <Link
                    href="/vs/freshbooks"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium block mt-2"
                  >
                    Compare ZeroDue vs FreshBooks →
                  </Link>
                </div>
              </details>

              <details className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  Can I use this on my phone or tablet?
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">
                  Yes! Our invoice generator is fully responsive and works
                  perfectly on phones, tablets, and desktop computers. Create
                  and send invoices on the job site, at client meetings, or from
                  anywhere with an internet connection.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Create Your First Invoice?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers and small businesses who trust
              ZeroDue for their invoicing. Start creating professional invoices
              in minutes—completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Free Invoice
              </Button>
              <Link href="/sign-up">
                <Button size="lg" variant="neutral" className="px-8">
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-blue-100 text-sm mt-6">
              No credit card required • Free forever • Get paid faster
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
