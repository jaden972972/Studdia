export type PlanType = "free" | "pro";

export interface SubscriptionLimits {
  maxTasks: number | null;           // null = unlimited
  maxCustomPlaylists: number | null; // null = unlimited
}

export interface Subscription {
  planType: PlanType;
  isPro: boolean;
  limits: SubscriptionLimits;
}

export const PLAN_LIMITS: Record<PlanType, SubscriptionLimits> = {
  free: { maxTasks: 5, maxCustomPlaylists: 1 },
  pro:  { maxTasks: null, maxCustomPlaylists: null },
};

export const FREE_SUBSCRIPTION: Subscription = {
  planType: "free",
  isPro: false,
  limits: PLAN_LIMITS.free,
};
