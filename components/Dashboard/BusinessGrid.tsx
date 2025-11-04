"use client";
import { DashboardBusinessStats } from "@/types";
import { Building, PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import BusinessCard from "./BusinessCard";
import CustomModal from "../ModalsForms/CustomModal"; // Ensure this path is correct
import { CreateBusiness } from "../Business/Forms/CreateBusiness";

export default function BusinessGrid({
  dashboardData,
}: {
  dashboardData: DashboardBusinessStats[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || dashboardData.length === 0) {
      return;
    }

    try {
      const storedId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("activeBusinessId")
          : null;

      const hasStored = storedId
        ? dashboardData.some((business) => String(business.id) === storedId)
        : false;

      if (!hasStored) {
        const firstBusiness = dashboardData[0];
        if (firstBusiness) {
          window.localStorage.setItem(
            "activeBusinessId",
            String(firstBusiness.id)
          );
          window.localStorage.setItem("activeBusinessName", firstBusiness.name);
        }
      }
    } catch (_) {
      // Ignore storage failures (private mode, etc.)
    }
  }, [dashboardData, mounted]);

  if (dashboardData.length === 0) {
    return (
      <div className="text-center py-16">
        <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-header-text dark:text-slate-100 mb-2">
          No Companies Yet
        </h2>
        <p className="text-secondary-text dark:text-slate-400 mb-6">
          Create your first company to start managing invoices and clients.
        </p>
        {mounted && (
          <div className="flex justify-center">
            <CustomModal
              heading={"Create Your First Company"}
              description={"Set up your business profile to get started."}
              openBtnLabel={"Create Your First Company"}
              btnVariant={"primary"}
              btnIcon={PlusIcon}
            >
              <CreateBusiness />
            </CustomModal>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dashboardData.map((company) => (
        <BusinessCard key={company.id} company={company} />
      ))}
      {/* You might want to add an "+ Add New Company" card here as well,
          if the user's plan allows creating more companies and totalBusinesses > 0.
          This would be similar to the CustomModal setup in DashboardHeader.
          For now, this example assumes DashboardHeader handles adding subsequent companies.
      */}
    </div>
  );
}
