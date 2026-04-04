export type PlanType = "free" | "pro";
export type LeagueTier = "novato" | "aficionado" | "elite";

export interface SubscriptionLimits {
  maxTasks: number | null;
  maxCustomPlaylists: number | null;
}

export interface Subscription {
  planType: PlanType;
  isPro: boolean;
  limits: SubscriptionLimits;
  leagueTier: LeagueTier;
  legendBadge: boolean;
}

export const PLAN_LIMITS: Record<PlanType, SubscriptionLimits> = {
  free: { maxTasks: 5, maxCustomPlaylists: 1 },
  pro:  { maxTasks: null, maxCustomPlaylists: null },
};

export const FREE_SUBSCRIPTION: Subscription = {
  planType: "free",
  isPro: false,
  limits: PLAN_LIMITS.free,
  leagueTier: "novato",
  legendBadge: false,
};

export const LEAGUE_META: Record<LeagueTier, { label: string; emoji: string; color: string }> = {
  novato:     { label: "Novato",     emoji: "🌱", color: "#6b7280" },
  aficionado: { label: "Aficionado", emoji: "⚡", color: "#f59e0b" },
  elite:      { label: "Élite",      emoji: "👑", color: "#8b5cf6" },
};
