"use client";
import { DashboardBusinessStats } from "@/types";
import { Card, CardContent, CardFooter } from "../ui/card";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Building,
  DollarSign,
  FileText,
  SettingsIcon,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import CustomModal from "../ModalsForms/CustomModal";
import timestamptzConvert from "../ui/timestamptzConvert";
import { UpdateBusiness } from "../Business/Forms/UpdateBusiness";

export default function BusinessCard({
  company,
}: {
  company: DashboardBusinessStats;
}) {
  const profileType = company.profile_type ?? "company";
  const ProfileIcon =
    profileType === "company"
      ? Building
      : profileType === "freelancer"
        ? User
        : Sparkles;
  const profileLabel =
    profileType === "company"
      ? "Company profile"
      : profileType === "freelancer"
        ? "Freelancer profile"
        : "Exploring profile";

  const handleVisitBusiness = () => {
    try {
      localStorage.setItem("activeBusinessId", String(company.id));
      localStorage.setItem("activeBusinessName", company.name ?? "");
    } catch (_) {
      // Ignore storage errors (e.g. private browsing)
    }
  };

  const companyLogo =
    typeof company.logo === "string" && company.logo.trim().length > 0
      ? company.logo.trim()
      : null;

  const statTiles = [
    {
      label: "Invoices",
      value: company.totalinvoices,
      icon: FileText,
      iconClass: "text-blue-600 dark:text-blue-400",
      valueClass: "text-gray-900 dark:text-white",
    },
    {
      label: "Clients",
      value: company.totalclients,
      icon: Users,
      iconClass: "text-purple-600 dark:text-purple-400",
      valueClass: "text-gray-900 dark:text-white",
    },
    {
      label: "Revenue",
      value: company.totalrevenue,
      icon: DollarSign,
      iconClass: "text-green-600 dark:text-green-400",
      valueClass: "text-green-600 dark:text-green-400",
    },
  ] as const;

  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <CardContent className="p-0">
        <Link
          href={`/dashboard/business?business_id=${company.id}&name=${company.name}`}
          className="block h-full"
          onClick={handleVisitBusiness}
        >
          {/* Header Section - Clean White */}
          <div className="rounded-t-2xl bg-white p-5 sm:px-6 sm:py-6 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                {companyLogo ? (
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-20">
                    <Image
                      src={companyLogo}
                      alt={`${company.name} logo`}
                      fill
                      sizes="(max-width: 640px) 64px, 80px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-200 sm:h-20 sm:w-20 dark:border-slate-700">
                    <ProfileIcon className="h-9 w-9 sm:h-10 sm:w-10 text-slate-600 dark:text-slate-200" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 truncate text-lg font-bold text-gray-900 sm:text-xl md:text-2xl dark:text-white">
                    {company.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-blue-400">
                    {profileLabel}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 self-end rounded-full border border-transparent p-1 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary sm:h-6 sm:w-6 sm:self-center dark:text-slate-500" />
            </div>
          </div>

          {/* Stats Tiles */}
          <div className="bg-white px-5 pb-5 sm:px-6 sm:pb-6 dark:bg-slate-900">
            <div className="grid gap-3 sm:grid-cols-3">
              {statTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div
                    key={tile.label}
                    className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-5 text-center dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Icon className={`h-6 w-6 ${tile.iconClass}`} />
                    <div
                      className={`text-2xl font-bold sm:text-[28px] ${tile.valueClass}`}
                    >
                      {tile.value}
                    </div>
                    <span className="text-xs font-medium text-gray-600 sm:text-sm dark:text-slate-400">
                      {tile.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Link>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90">
        <span className="text-xs text-gray-600 sm:text-sm dark:text-slate-400">
          Created {timestamptzConvert(company.created_on)}
        </span>
        <CustomModal
          heading={"Business details"}
          description={"Update content"}
          openBtnLabel={""}
          btnVariant={"ghost"}
          btnIcon={SettingsIcon}
        >
          <UpdateBusiness businessId={company.id} />
        </CustomModal>
      </CardFooter>
    </Card>
  );
}
