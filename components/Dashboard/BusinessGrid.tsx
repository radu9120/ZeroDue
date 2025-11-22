"use client";
import { DashboardBusinessStats } from "@/types";
import { useEffect, useState } from "react";
import BusinessCard from "./BusinessCard";
import ProfileSetupFlow from "../Business/ProfileSetupFlow";

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
    return <ProfileSetupFlow />;
  }

  const hasSingleCard = dashboardData.length === 1;
  const gridClassName = hasSingleCard
    ? "grid grid-cols-1 gap-8 max-w-4xl mx-auto w-full"
    : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8";

  return (
    <div className={gridClassName}>
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
