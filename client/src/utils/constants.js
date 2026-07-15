export const PROJECT_STATUS = {
  ACTIVE: "active",
  ABANDONED: "abandoned",
  COMPLETED: "completed",
};

export const PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const STATUS_LABELS = {
  [PROJECT_STATUS.ACTIVE]: "Active",
  [PROJECT_STATUS.ABANDONED]: "Abandoned",
  [PROJECT_STATUS.COMPLETED]: "Completed",
};

export const PRIORITY_LABELS = {
  [PRIORITY.LOW]: "Low",
  [PRIORITY.MEDIUM]: "Medium",
  [PRIORITY.HIGH]: "High",
};

export const STATUS_BADGE_CLASS = {
  [PROJECT_STATUS.ACTIVE]: "text-bg-success",
  [PROJECT_STATUS.ABANDONED]: "text-bg-warning",
  [PROJECT_STATUS.COMPLETED]: "text-bg-info",
};
