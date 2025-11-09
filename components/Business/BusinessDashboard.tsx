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
import CustomButton from "../ui/CustomButton";
import CustomModal from "../ModalsForms/CustomModal";
import { UpdateBusiness } from "./Forms/UpdateBusiness";
import { Card, CardContent, CardHeader } from "../ui/card";
import type { BusinessStatistics } from "@/types";
import { normalizeCurrencyCode, getCurrencySymbol } from "@/lib/utils";
import DeleteBusiness from "./DeleteBusiness";
import { Button } from "@/components/ui/button";

type MetricRow = {
  text: string;
  className: string;
  prefixIcon?: React.ReactNode;
};

type MetricCard = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  subRows: MetricRow[];
};

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
  };
  userPlan: "free_user" | "professional" | "enterprise";
  stats?: BusinessStatistics["statistic"] | null;
  createDisabled?: boolean;
}) {
  React.useEffect(() => {
    try {
      localStorage.setItem("activeBusinessId", String(business.id));
      localStorage.setItem("activeBusinessName", business.name ?? "");
    } catch (_) {
      // Ignore storage access issues
    }
  }, [business.id, business.name]);

  const computedStats = React.useMemo(() => {
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

  const currencyCode = React.useMemo(
    () => normalizeCurrencyCode(business.currency),
    [business.currency]
  );
  const currencySymbol = React.useMemo(
    () => getCurrencySymbol(currencyCode),
    [currencyCode]
  );
  const currencyFormatter = React.useMemo(() => {
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

  const profileCopy = React.useMemo(() => {
    if (profileType === "freelancer") {
      return {
        untitledLabel: "Untitled profile",
        emailFallback:
          "Add a contact email in Settings so clients know how to reach you.",
        detailsHeading: "Profile details",
        deleteHeading: "Delete profile",
        badgeLabel: "Freelancer profile",
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
        badgeLabel: "Exploring profile",
        profileIcon: Sparkles,
      } as const;
    }
    return {
      untitledLabel: "Untitled company",
      emailFallback:
        "Add a company email in Settings so clients know how to reach you.",
      detailsHeading: "Business details",
      deleteHeading: "Delete company",
      badgeLabel: "Company profile",
      profileIcon: Building,
    } as const;
  }, [profileType]);

  const ProfileIcon = profileCopy.profileIcon;

  const businessName = React.useMemo(() => {
    const raw = typeof business.name === "string" ? business.name.trim() : "";
    return raw.length > 0 ? raw : profileCopy.untitledLabel;
  }, [business.name, profileCopy.untitledLabel]);

  const businessEmail = React.useMemo(() => {
    const raw = typeof business.email === "string" ? business.email.trim() : "";
    return raw.length > 0 ? raw : null;
  }, [business.email]);

  const currencyLine = React.useMemo(() => {
    const hasExplicitCurrency = Boolean(
      typeof business.currency === "string" && business.currency.trim()
    );
    return hasExplicitCurrency
      ? `Default currency: ${currencyCode} (${currencySymbol})`
      : `Default currency: ${currencyCode} (${currencySymbol}) - set a different default in Settings when you are ready.`;
  }, [business.currency, currencyCode, currencySymbol]);

  const formatCurrencyValue = React.useCallback(
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

  const metricCards = React.useMemo<MetricCard[]>(
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
        className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to business profiles
      </Link>
      <Card className="shadow-md">
        <CardHeader className="space-y-4 pb-4 p-4 sm:p-6">
          {/* Mobile-First Header Layout */}
          <div className="flex flex-col gap-4">
            {/* Top Row: Icon + Name + Badge */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <ProfileIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-header-text dark:text-slate-100 truncate">
                  {businessName}
                </h1>
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 mt-1">
                  {profileCopy.badgeLabel}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1">
              <p className="text-sm text-secondary-text dark:text-slate-400">
                {businessEmail || profileCopy.emailFallback}
              </p>
              <p className="text-xs text-secondary-text dark:text-slate-500">
                {currencyLine}
              </p>
            </div>

            {/* Action Buttons - Mobile Stack */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              <CustomButton
                label={"Create Invoice"}
                icon={PlusIcon}
                variant={"primary"}
                href={`/dashboard/invoices/new?business_id=${business.id}`}
                disabled={createDisabled}
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <CustomModal
                  heading={profileCopy.detailsHeading}
                  description={"Update content"}
                  openBtnLabel={"Settings"}
                  btnVariant={"ghost"}
                  btnIcon={SettingsIcon}
                >
                  <UpdateBusiness businessId={business.id} />
                </CustomModal>
                <CustomModal
                  heading={profileCopy.deleteHeading}
                  description={`Removing ${businessName} will permanently delete its invoices, clients, and activity.`}
                  customTrigger={
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 sm:flex-initial border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-900/20"
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
                <CustomButton
                  variant="primary"
                  label="Upgrade"
                  icon={CrownIcon}
                  href="/upgrade"
                />
              )}
              {userPlan !== "free_user" && createDisabled && (
                <CustomButton
                  variant="primary"
                  label="Manage Plan"
                  icon={CrownIcon}
                  href="/upgrade"
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {metricCards.map((metric: MetricCard, index: number) => (
              <div
                key={metric.title}
                className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`${metric.iconBg} rounded-lg w-10 h-10 flex items-center justify-center`}
                  >
                    {metric.icon}
                  </div>
                  <span className="text-2xl font-bold text-header-text dark:text-slate-100">
                    {metric.value}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-header-text dark:text-slate-100">
                    {metric.title}
                  </h3>
                  {metric.subRows.map((row: MetricRow) => (
                    <div key={row.text} className={row.className}>
                      {row.prefixIcon && (
                        <span className="inline-flex items-center gap-1">
                          {row.prefixIcon}
                          <span>{row.text}</span>
                        </span>
                      )}
                      {!row.prefixIcon && <span>{row.text}</span>}
                    </div>
                  ))}
                  {metric.subRows.length === 0 && index === 2 && (
                    <p className="text-sm text-secondary-text dark:text-slate-400">
                      Keep growing your client list.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
