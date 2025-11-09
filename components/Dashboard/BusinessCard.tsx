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
          className="w-full space-y-4"
          onClick={handleVisitBusiness}
        >
          {/* Header - Mobile Optimized */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                <ProfileIcon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-header-text dark:text-slate-100 text-base sm:text-lg truncate">
                  {company.name}
                </h3>
                <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 mt-1">
                  {profileLabel}
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 flex-shrink-0 transition-colors text-secondary-text dark:text-slate-400 group-hover:text-primary" />
          </div>

          {/* Stats Grid - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-secondary-text dark:text-slate-400 block mb-1">
                Invoices
              </span>
              <div className="text-lg sm:text-xl font-bold text-header-text dark:text-slate-100">
                <p>{company.totalinvoices}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-secondary-text dark:text-slate-400 block mb-1">
                Clients
              </span>
              <div className="text-lg sm:text-xl font-bold text-header-text dark:text-slate-100">
                <p>{company.totalclients}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-secondary-text dark:text-slate-400 block mb-1">
                Revenue
              </span>
              <div className="text-lg sm:text-xl font-bold text-green-600">
                <p>{company.totalrevenue}</p>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-blue-100 dark:border-slate-700">
        <span className="text-xs sm:text-sm text-secondary-text dark:text-slate-400">
          Created on {timestamptzConvert(company.created_on)}
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <CustomModal
            heading={"Business details"}
            description={"Update content"}
            openBtnLabel={""}
            btnVariant={"ghost"}
            btnIcon={SettingsIcon}
          >
            <UpdateBusiness businessId={company.id} />
          </CustomModal>
        </div>
      </CardFooter>
    </Card>
  );
}
