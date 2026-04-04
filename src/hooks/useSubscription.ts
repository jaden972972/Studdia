"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { type Subscription, FREE_SUBSCRIPTION, PLAN_LIMITS } from "@/lib/subscription";

export function useSubscription(): Subscription & { loading: boolean } {
  const { data: session } = useSession();
  const [sub, setSub] = useState<Subscription>(FREE_SUBSCRIPTION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setSub(FREE_SUBSCRIPTION);
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const planType = data.planType === "pro" ? "pro" : "free";
        setSub({ planType, isPro: planType === "pro", limits: PLAN_LIMITS[planType] });
      })
      .catch(() => { if (!cancelled) setSub(FREE_SUBSCRIPTION); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [session]);

  return { ...sub, loading };
}
