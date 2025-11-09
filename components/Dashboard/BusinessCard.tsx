"use client";
import { DashboardBusinessStats } from "@/types";
import { Card, CardContent, CardFooter } from "../ui/card";
import Link from "next/link";
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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <Link
          href={`/dashboard/business?business_id=${company.id}&name=${company.name}`}
          className="w-full space-y-3 sm:space-y-4"
          onClick={handleVisitBusiness}
        >
          {/* Header - Mobile Optimized */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <ProfileIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-header-text dark:text-slate-100 text-sm sm:text-base md:text-lg truncate mb-1">
                {company.name}
              </h3>
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {profileLabel}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-colors text-secondary-text dark:text-slate-400 hover:text-primary" />
          </div>

          {/* Stats Grid - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 dark:bg-slate-800 mb-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-secondary-text dark:text-slate-400 mb-1">
                Invoices
              </span>
              <div className="text-base sm:text-lg md:text-xl font-bold text-header-text dark:text-slate-100">
                {company.totalinvoices}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-50 dark:bg-slate-800 mb-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-secondary-text dark:text-slate-400 mb-1">
                Clients
              </span>
              <div className="text-base sm:text-lg md:text-xl font-bold text-header-text dark:text-slate-100">
                {company.totalclients}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-50 dark:bg-slate-800 mb-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-secondary-text dark:text-slate-400 mb-1">
                Revenue
              </span>
              <div className="text-base sm:text-lg md:text-xl font-bold text-green-600">
                {company.totalrevenue}
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
        <span className="text-[10px] sm:text-xs md:text-sm text-secondary-text dark:text-slate-400 text-center sm:text-left">
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
