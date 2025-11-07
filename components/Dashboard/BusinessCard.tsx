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
    <Card>
      {/* isJustCreated
          ? "border-green-300 bg-green-50/50 shadow-green-200"
          : "border-blue-100 hover:shadow-xl" */}
      <CardContent>
        <Link
          href={`/dashboard/business?business_id=${company.id}&name=${company.name}`}
          className="w-full space-y-4"
          onClick={handleVisitBusiness}
        >
          <div className="flex items-start justify-between ">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                {/* isJustCreated
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-primary to-accent" */}
                <ProfileIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-header-text dark:text-slate-100 text-lg">
                    {company.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                    {profileLabel}
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight
              className="h-5 w-5 transition-colors text-secondary-text dark:text-slate-400 group-hover:text-primary"
              //                 isJustCreated
              //   ? "text-green-600"
              //   : "text-secondary-text dark:text-slate-400 group-hover:text-primary"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-secondary-text dark:text-slate-400">
                Invoices
              </span>
              <div className="text-lg font-bold text-header-text dark:text-slate-100">
                <p>{company.totalinvoices}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-secondary-text dark:text-slate-400">
                Clients
              </span>
              <div className="text-lg font-bold text-header-text dark:text-slate-100">
                <p>{company.totalclients}</p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-secondary-text dark:text-slate-400">
                Revenue
              </span>
              <div className="text-lg font-bold text-green-600">
                <p>{company.totalrevenue}</p>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 border-t border-blue-100">
        <span className="text-sm text-secondary-text dark:text-slate-400">
          Created on {timestamptzConvert(company.created_on)}
        </span>
        <div className="flex items-center gap-2">
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
