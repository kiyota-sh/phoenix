export const PROJECT_STATUS = {
  ACTIVE: "activo",
  ABANDONED: "abandonado",
  COMPLETED: "finalizado",
  ARCHIVED: "archivado",
};

export const PRIORITY = {
  LOW: "baja",
  MEDIUM: "media",
  HIGH: "alta",
};

export const STATUS_LABELS = {
  [PROJECT_STATUS.ACTIVE]: "Active",
  [PROJECT_STATUS.ABANDONED]: "Abandoned",
  [PROJECT_STATUS.COMPLETED]: "Completed",
  [PROJECT_STATUS.ARCHIVED]: "Archived",
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
  [PROJECT_STATUS.ARCHIVED]: "text-bg-secondary",
};
