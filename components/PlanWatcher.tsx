"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialPlan: "free_user" | "professional" | "enterprise";
  intervalMs?: number;
};

export default function PlanWatcher({ initialPlan, intervalMs = 5000 }: Props) {
  const router = useRouter();
  const currentPlanRef = useRef(initialPlan);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentPlanRef.current = initialPlan;
  }, [initialPlan]);

  useEffect(() => {
    async function checkPlan() {
      try {
        const res = await fetch("/api/plan", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const plan = data?.plan as typeof initialPlan | undefined;
        if (plan && plan !== currentPlanRef.current) {
          // Plan changed (likely via webhook). Refresh the page to get new server data
          router.refresh();
        }
      } catch (_) {
        // ignore
      }
    }

    // initial check a bit later to avoid racing first render
    timerRef.current = setInterval(checkPlan, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMs, router]);

  return null;
}
