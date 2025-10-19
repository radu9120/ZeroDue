"use client";
import {
  ArrowLeft,
  Building,
  CrownIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import CustomButton from "../ui/CustomButton";
import CustomModal from "../ModalsForms/CustomModal";
import { UpdateBusiness } from "./Forms/UpdateBusiness";

export default function BusinessDashboard({
  business,
  userPlan,
  createDisabled = false,
}: {
  business: { id: any; name: any; email: any };
  userPlan: "free_user" | "professional" | "enterprise";
  createDisabled?: boolean;
}) {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Companies
      </Link>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
            <Building className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-header-text dark:text-slate-100">
                {business.name}
              </h1>
            </div>
            <p className="text-sm md:text-base text-secondary-text dark:text-slate-400">{business.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
          <CustomButton
            label={"Create Invoice"}
            icon={PlusIcon}
            variant={"primary"}
            href={`/dashboard/invoices/new?business_id=${business.id}`}
            disabled={createDisabled}
          />
          <CustomModal
            heading={"Business details"}
            description={"Update content"}
            openBtnLabel={"Settings"}
            btnVariant={"ghost"}
            btnIcon={SettingsIcon}
          >
            <UpdateBusiness businessId={business.id} />
          </CustomModal>
          {userPlan === "free_user" && (
            <CustomButton
              // onClick={Updrade}
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
    </div>
  );
}
