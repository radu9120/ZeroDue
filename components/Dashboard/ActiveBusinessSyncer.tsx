"use client";

import { useEffect, useState } from "react";
import { DashboardBusinessStats } from "@/types";

export default function ActiveBusinessSyncer({
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

  return null;
}
