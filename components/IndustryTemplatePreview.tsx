"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  tax: number;
  amount: number;
}

interface InvoiceTemplate {
  id: number;
  industry: string;
  template_name: string;
  description: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  currency: string;
}

interface Props {
  industry: string;
  title?: string;
}

export default function IndustryTemplatePreview({ industry, title }: Props) {
  const [template, setTemplate] = useState<InvoiceTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const response = await fetch(
          `/api/invoice-templates?industry=${industry}`
        );
        const data = await response.json();
        if (data.templates && data.templates.length > 0) {
          setTemplate(data.templates[0]);
        }
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [industry]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
        <p className="text-slate-500 dark:text-slate-400">No template found</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: template.currency,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {title || template.template_name}
          </h3>
          {template.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {template.description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3 text-sm mb-6">
        {template.items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                {item.description}
              </span>
              <span className="text-slate-900 dark:text-white">
                {formatCurrency(item.amount)}
              </span>
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 pl-4">
                {item.quantity} × {formatCurrency(item.rate)}
              </div>
            )}
          </div>
        ))}

        <hr className="border-slate-200 dark:border-slate-600" />

        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
          <span className="text-slate-900 dark:text-white">
            {formatCurrency(template.subtotal)}
          </span>
        </div>

        {template.tax > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              VAT (20%)
            </span>
            <span className="text-slate-900 dark:text-white">
              {formatCurrency(template.tax)}
            </span>
          </div>
        )}

        <hr className="border-slate-200 dark:border-slate-600" />

        <div className="flex justify-between font-bold text-lg">
          <span className="text-slate-900 dark:text-white">Total</span>
          <span className="text-indigo-600 dark:text-indigo-400">
            {formatCurrency(template.total)}
          </span>
        </div>
      </div>

      {template.notes && (
        <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {template.notes}
          </p>
        </div>
      )}

      <Link href="/sign-up" className="block">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          Use This Template
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </Link>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
        Sign up free to clone this template to your account
      </p>
    </div>
  );
}
