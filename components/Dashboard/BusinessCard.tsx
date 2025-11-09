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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-gray-200 dark:border-slate-700">
      <CardContent className="p-0">
        <Link
          href={`/dashboard/business?business_id=${company.id}&name=${company.name}`}
          className="block"
          onClick={handleVisitBusiness}
        >
          {/* Header Section - Clean White */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              {company.logo ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl overflow-hidden shadow-md ring-2 ring-gray-100 dark:ring-slate-700">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-md">
                  <ProfileIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl truncate mb-2">
                  {company.name}
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-slate-700">
                  {profileLabel}
                </span>
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-gray-400 dark:text-slate-500 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Stats Grid - Clean Dividers */}
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            <div className="flex flex-col items-center justify-center py-5 sm:py-6 px-3">
              <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-slate-800 mb-2.5 ring-1 ring-blue-100 dark:ring-slate-700">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {company.totalinvoices}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
                Invoices
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-5 sm:py-6 px-3">
              <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-50 dark:bg-slate-800 mb-2.5 ring-1 ring-purple-100 dark:ring-slate-700">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {company.totalclients}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
                Clients
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-5 sm:py-6 px-3">
              <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-50 dark:bg-slate-800 mb-2.5 ring-1 ring-green-100 dark:ring-slate-700">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {company.totalrevenue}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400">
                Revenue
              </span>
            </div>
          </div>
        </Link>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between px-5 py-3 sm:py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
        <span className="text-xs text-gray-600 dark:text-slate-400">
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
