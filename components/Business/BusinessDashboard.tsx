"use client";
import {
  ArrowLeft,
  Building,
  Calendar,
  CrownIcon,
  DollarSign,
  FileText,
  PlusIcon,
  SettingsIcon,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import type { ReactNode } from "react";
import CustomButton from "../ui/CustomButton";
import CustomModal from "../ModalsForms/CustomModal";
import { UpdateBusiness } from "./Forms/UpdateBusiness";
import { Card, CardContent } from "../ui/card";
import type { BusinessStatistics } from "@/types";
import { normalizeCurrencyCode, getCurrencySymbol } from "@/lib/utils";
import DeleteBusiness from "./DeleteBusiness";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type MetricRow = {
  text: string;
  className: string;
  prefixIcon?: ReactNode;
};

type MetricCard = {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  subRows: MetricRow[];
};

const { useCallback, useEffect, useMemo } = React;

export default function BusinessDashboard({
  business,
  userPlan,
  stats,
  createDisabled = false,
}: {
  business: {
    id: any;
    name: any;
    email?: any;
    currency?: string | null;
    profile_type?: "company" | "freelancer" | "exploring";
    logo?: string | null;
  };
  userPlan: "free_user" | "professional" | "enterprise";
  stats?: BusinessStatistics["statistic"] | null;
  createDisabled?: boolean;
}) {
  useEffect(() => {
    try {
      localStorage.setItem("activeBusinessId", String(business.id));
      localStorage.setItem("activeBusinessName", business.name ?? "");
    } catch (_) {
      // Ignore storage access issues
    }
  }, [business.id, business.name]);

  const computedStats = useMemo(() => {
    const fallback = {
      total_invoices: 0,
      total_paid_amount: "0",
      total_overdue_invoices: 0,
      total_clients: 0,
      total_paid_invoices: 0,
      total_pending_invoices: 0,
      total_paid_amount_current_month: "0",
    };

    if (!stats) return fallback;
    return {
      ...fallback,
      ...stats,
    };
  }, [stats]);

  const currencyCode = useMemo(
    () => normalizeCurrencyCode(business.currency),
    [business.currency]
  );
  const currencySymbol = useMemo(
    () => getCurrencySymbol(currencyCode),
    [currencyCode]
  );
  const currencyFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.warn("Currency formatting fallback", { currencyCode, error });
      return null;
    }
  }, [currencyCode]);

  const profileType: "company" | "freelancer" | "exploring" =
    business.profile_type ?? "company";

  const profileCopy = useMemo(() => {
    if (profileType === "freelancer") {
      return {
        untitledLabel: "Untitled profile",
        emailFallback:
          "Add a contact email in Settings so clients know how to reach you.",
        detailsHeading: "Profile details",
        deleteHeading: "Delete profile",
        profileIcon: User,
      } as const;
    }
    if (profileType === "exploring") {
      return {
        untitledLabel: "Untitled profile",
        emailFallback:
          "Add a contact email when you're ready so clients know how to reach you.",
        detailsHeading: "Profile details",
        deleteHeading: "Delete profile",
        profileIcon: Sparkles,
      } as const;
    }
    return {
      untitledLabel: "Untitled company",
      emailFallback:
        "Add a company email in Settings so clients know how to reach you.",
      detailsHeading: "Business details",
      deleteHeading: "Delete company",
      profileIcon: Building,
    } as const;
  }, [profileType]);

  const ProfileIcon = profileCopy.profileIcon;
  const businessLogo = useMemo(() => {
    if (typeof business.logo !== "string") return null;
    const trimmed = business.logo.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [business.logo]);

  const businessName = useMemo(() => {
    const raw = typeof business.name === "string" ? business.name.trim() : "";
    return raw.length > 0 ? raw : profileCopy.untitledLabel;
  }, [business.name, profileCopy.untitledLabel]);

  const businessEmail = useMemo(() => {
    const raw = typeof business.email === "string" ? business.email.trim() : "";
    return raw.length > 0 ? raw : null;
  }, [business.email]);

  const currencyLine = useMemo(() => {
    const hasExplicitCurrency = Boolean(
      typeof business.currency === "string" && business.currency.trim()
    );
    return hasExplicitCurrency
      ? `Default currency: ${currencyCode} (${currencySymbol})`
      : `Default currency: ${currencyCode} (${currencySymbol}) - set a different default in Settings when you are ready.`;
  }, [business.currency, currencyCode, currencySymbol]);

  const formatCurrencyValue = useCallback(
    (raw: string | number) => {
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed.length === 0) return `${currencySymbol}0.00`;
        if (/[^0-9.,-]/.test(trimmed)) return trimmed;
        const numeric = Number(trimmed.replace(/,/g, ""));
        if (Number.isFinite(numeric)) {
          return currencyFormatter
            ? currencyFormatter.format(numeric)
            : `${currencyCode} ${numeric.toFixed(2)}`;
        }
        return trimmed;
      }

      if (typeof raw === "number" && Number.isFinite(raw)) {
        return currencyFormatter
          ? currencyFormatter.format(raw)
          : `${currencyCode} ${raw.toFixed(2)}`;
      }

      return String(raw);
    },
    [currencyCode, currencyFormatter, currencySymbol]
  );

  const metricCards = useMemo<MetricCard[]>(
    () => [
      {
        title: "Total Invoices",
        value: computedStats.total_invoices,
        icon: <FileText className="h-5 w-5 text-primary" />,
        iconBg: "bg-blue-100",
        subRows: [
          {
            text: `${computedStats.total_paid_invoices} paid`,
            className: "text-green-600 dark:text-green-400 font-medium",
          },
          {
            text: `• ${computedStats.total_pending_invoices} pending`,
            className: "text-secondary-text dark:text-slate-400",
          },
        ],
      },
      {
        title: "Total Revenue",
        value: formatCurrencyValue(computedStats.total_paid_amount),
        icon: <DollarSign className="h-5 w-5 text-green-600" />,
        iconBg: "bg-green-100",
        subRows: [
          {
            text: `${formatCurrencyValue(
              computedStats.total_paid_amount_current_month
            )} this month`,
            className:
              "inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium",
            prefixIcon: <TrendingUp className="h-4 w-4" />,
          },
        ],
      },
      {
        title: "Total Clients",
        value: computedStats.total_clients,
        icon: <Users className="h-5 w-5 text-purple-600" />,
        iconBg: "bg-purple-100",
        subRows: [],
      },
      {
        title: "Overdue Invoices",
        value: computedStats.total_overdue_invoices,
        icon: <Calendar className="h-5 w-5 text-yellow-600" />,
        iconBg: "bg-yellow-100",
        subRows: [
          {
            text:
              computedStats.total_overdue_invoices > 0
                ? "Needs attention"
                : "All good!",
            className:
              computedStats.total_overdue_invoices > 0
                ? "text-red-600 dark:text-red-400 font-medium"
                : "text-secondary-text dark:text-slate-400",
          },
        ],
      },
    ],
    [computedStats, formatCurrencyValue]
  );

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors text-sm sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to business profiles
      </Link>

      <Card className="shadow-lg overflow-hidden border-gray-200 dark:border-slate-700">
        {/* Clean Header Section */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 border-b border-gray-200 dark:border-slate-800">
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {businessLogo ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src={businessLogo}
                    alt={`${businessName} logo`}
                    fill
                    sizes="(max-width: 768px) 96px, 112px"
                    className="object-contain object-center"
                    priority
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-slate-200/70 dark:bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-slate-700">
                  <ProfileIcon className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-slate-600 dark:text-slate-200" />
                </div>
              )}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <h1 className="flex-1 min-w-0 truncate text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
                  {businessName}
                </h1>
              </div>
              <div className="flex-shrink-0">
                <CustomModal
                  heading={profileCopy.detailsHeading}
                  description={"Update content"}
                  customTrigger={
                    <Button
                      type="button"
                      variant="ghost"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      <span>Settings</span>
                    </Button>
                  }
                >
                  <UpdateBusiness businessId={business.id} />
                </CustomModal>
              </div>
            </div>
            <div className="flex flex-col gap-4 lg:gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1.5 sm:flex-1">
                <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300">
                  {businessEmail || profileCopy.emailFallback}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                  {currencyLine}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 md:justify-end md:flex-none">
                <div className="w-full sm:w-auto">
                  <CustomButton
                    className="w-full sm:w-auto"
                    label={"Create Invoice"}
                    icon={PlusIcon}
                    variant={"primary"}
                    href={`/dashboard/invoices/new?business_id=${business.id}`}
                    disabled={createDisabled}
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <CustomModal
                    heading={profileCopy.deleteHeading}
                    description={`Removing ${businessName} will permanently delete its invoices, clients, and activity.`}
                    customTrigger={
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full sm:w-auto border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    }
                  >
                    <DeleteBusiness
                      businessId={Number(business.id)}
                      businessName={businessName}
                      profileType={profileType}
                    />
                  </CustomModal>
                </div>
                {userPlan === "free_user" && (
                  <div className="w-full sm:w-auto">
                    <CustomButton
                      variant="primary"
                      label="Upgrade"
                      icon={CrownIcon}
                      href="/upgrade"
                    />
                  </div>
                )}
                {userPlan !== "free_user" && createDisabled && (
                  <div className="w-full sm:w-auto">
                    <CustomButton
                      variant="primary"
                      label="Manage Plan"
                      icon={CrownIcon}
                      href="/upgrade"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Stats Cards Section */}
        <CardContent className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {metricCards.map((metric: MetricCard, index: number) => (
              <div
                key={metric.title}
                className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`${metric.iconBg} rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200 dark:ring-slate-700`}
                  >
                    {metric.icon}
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {metric.title}
                  </h3>
                  <div className="space-y-1">
                    {metric.subRows.map((row: MetricRow) => (
                      <div key={row.text} className={row.className}>
                        {row.prefixIcon && (
                          <span className="inline-flex items-center gap-1.5">
                            {row.prefixIcon}
                            <span>{row.text}</span>
                          </span>
                        )}
                        {!row.prefixIcon && <span>{row.text}</span>}
                      </div>
                    ))}
                    {metric.subRows.length === 0 && index === 2 && (
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        Keep growing your client list.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
