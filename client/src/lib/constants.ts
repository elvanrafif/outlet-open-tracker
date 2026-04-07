// ─── Shared design constants ──────────────────────────────────────────────────

export const TYPE_CONFIG = {
  mall:        { label: "Mall",        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  stand_alone: { label: "Stand Alone", className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
} as const;

export const progressBarColor = (pct: number) =>
  pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-amber-500";

export const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

// Z-index scale
export const Z = {
  header:     40,
  modal:      100,
  notification: 101,
  transition: 200,
} as const;

// Transition timing
export const TRANSITION_DURATION = 380;
