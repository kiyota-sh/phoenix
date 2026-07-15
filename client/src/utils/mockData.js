// In-memory fake database used while USE_MOCK is true.
// Every mock* function mirrors what the real backend is expected to
// return, including a small artificial delay, so the UI's loading
// states, empty states, and error handling all behave the same way
// they will once the real API is wired up.

let nextProjectId = 7;
let nextCategoryId = 5;
let nextTaskId = 30;
let nextProgressId = 9;
let nextHistoryId = 10;

export const mockUser = {
  id: 1,
  name: "Alex Rivera",
  email: "alex@example.com",
};

export const mockCategories = [
  { id: 1, name: "Programming" },
  { id: 2, name: "Languages" },
  { id: 3, name: "Business" },
  { id: 4, name: "Fitness" },
];

export const mockAbandonReasons = [
  { id: 1, name: "Lack of time" },
  { id: 2, name: "Lack of money" },
  { id: 3, name: "Loss of interest" },
  { id: 4, name: "Change of priorities" },
  { id: 5, name: "Technical difficulty" },
];

// Tasks live embedded inside each project — they're the source of truth
// for the progress percentage (completed tasks / total tasks).
export const mockProjects = [
  {
    id: 1,
    name: "Personal Portfolio Website",
    description: "A personal site to showcase my dev projects and blog posts.",
    goal: "Land freelance clients through a strong online presence.",
    categoryId: 1,
    priority: "high",
    status: "active",
    startDate: "2025-11-03",
    targetDate: "2026-09-01",
    lastProgressDate: "2026-07-05",
    abandonReason: null,
    tasks: [
      { id: 1, title: "Set up repo and tooling", completed: true },
      { id: 2, title: "Design homepage layout", completed: true },
      { id: 3, title: "Build project cards component", completed: true },
      { id: 4, title: "Add dark mode toggle", completed: false },
      { id: 5, title: "Write case study pages", completed: false },
      { id: 6, title: "Deploy to production", completed: false },
    ],
  },
  {
    id: 2,
    name: "Learn Japanese (N4)",
    description:
      "Studying Japanese to reach N4 level for an eventual trip to Japan.",
    goal: "Hold a basic conversation and pass the JLPT N4 exam.",
    categoryId: 2,
    priority: "medium",
    status: "abandoned",
    startDate: "2025-03-10",
    targetDate: "2025-12-01",
    lastProgressDate: "2025-08-20",
    abandonReason: "Lack of time",
    tasks: [
      { id: 7, title: "Learn hiragana", completed: true },
      { id: 8, title: "Learn katakana", completed: true },
      { id: 9, title: "Complete Genki I, chapters 1-6", completed: true },
      { id: 10, title: "Complete Genki I, chapters 7-12", completed: false },
      {
        id: 11,
        title: "Practice speaking with a tutor weekly",
        completed: false,
      },
    ],
  },
  {
    id: 3,
    name: "Home Bakery Side Business",
    description: "Turning weekend baking into a small home business.",
    goal: "Sell baked goods locally and cover the cost of the equipment.",
    categoryId: 3,
    priority: "medium",
    status: "active",
    startDate: "2026-01-15",
    targetDate: "2026-11-01",
    lastProgressDate: "2026-07-10",
    abandonReason: null,
    tasks: [
      { id: 12, title: "Write business plan", completed: true },
      { id: 13, title: "Get health permit", completed: true },
      { id: 14, title: "Design logo and packaging", completed: false },
      { id: 15, title: "Launch Instagram page", completed: false },
      { id: 16, title: "Get first 10 customers", completed: false },
    ],
  },
  {
    id: 4,
    name: "Couch to 10K",
    description:
      "Running program to go from zero running experience to a 10K race.",
    goal: "Finish a 10K race without stopping.",
    categoryId: 4,
    priority: "low",
    status: "completed",
    startDate: "2025-06-01",
    targetDate: "2025-09-01",
    lastProgressDate: "2025-08-30",
    abandonReason: null,
    tasks: [
      { id: 17, title: "Complete weeks 1-3", completed: true },
      { id: 18, title: "Complete weeks 4-6", completed: true },
      { id: 19, title: "Complete weeks 7-9", completed: true },
      { id: 20, title: "Run first 10K race", completed: true },
    ],
  },
  {
    id: 5,
    name: "Mobile Budgeting App",
    description: "A side-project app to track personal expenses and budgets.",
    goal: "Publish a working MVP to the app store.",
    categoryId: 1,
    priority: "high",
    status: "abandoned",
    startDate: "2025-05-01",
    targetDate: "2025-10-01",
    lastProgressDate: "2025-07-02",
    abandonReason: "Loss of interest",
    tasks: [
      { id: 21, title: "Define MVP features", completed: true },
      { id: 22, title: "Set up database schema", completed: true },
      { id: 23, title: "Build authentication flow", completed: true },
      { id: 24, title: "Build transaction tracking", completed: false },
      { id: 25, title: "Build reporting dashboard", completed: false },
      { id: 26, title: "Publish to app store", completed: false },
    ],
  },
  {
    id: 6,
    name: "Freelance Illustration Portfolio",
    description:
      "Building a portfolio to start taking freelance illustration commissions.",
    goal: "Get 3 paying clients through the portfolio site.",
    categoryId: 3,
    priority: "low",
    status: "active",
    startDate: "2026-05-01",
    targetDate: null,
    lastProgressDate: "2026-06-28",
    abandonReason: null,
    tasks: [
      { id: 27, title: "Curate best 20 pieces", completed: true },
      { id: 28, title: "Build portfolio site", completed: false },
      { id: 29, title: "Write artist statement", completed: false },
    ],
  },
];

// Progress log entries (the free-form journal), keyed by project id
export const progressEntriesByProject = {
  1: [
    {
      id: 1,
      date: "2026-06-10",
      description: "Finished the homepage layout and pushed it to staging.",
      notes: "Still need to test on mobile.",
    },
    {
      id: 2,
      date: "2026-07-05",
      description: "Built the reusable project card component.",
      notes: "",
    },
  ],
  2: [
    {
      id: 3,
      date: "2025-08-20",
      description: "Finished chapter 6 of Genki I.",
      notes: "Getting harder to find study time with the new job.",
    },
  ],
  3: [
    {
      id: 4,
      date: "2026-02-20",
      description: "Got the health permit approved.",
      notes: "",
    },
    {
      id: 5,
      date: "2026-07-10",
      description: "Sketched three logo concepts with a designer friend.",
      notes: "",
    },
  ],
  4: [
    {
      id: 6,
      date: "2025-08-30",
      description: "Finished the 10K race in 58 minutes!",
      notes: "First race ever, feeling great.",
    },
  ],
  5: [
    {
      id: 7,
      date: "2025-07-02",
      description: "Finished the login and signup screens.",
      notes: "Lost motivation after the initial excitement wore off.",
    },
  ],
  6: [
    {
      id: 8,
      date: "2026-06-28",
      description: "Picked the final 20 pieces for the portfolio.",
      notes: "",
    },
  ],
};

// Change history, keyed by project id
export const historyByProject = {
  1: [
    {
      id: 1,
      date: "2025-11-03",
      field: "status",
      oldValue: null,
      newValue: "active",
    },
  ],
  2: [
    {
      id: 2,
      date: "2025-03-10",
      field: "status",
      oldValue: null,
      newValue: "active",
    },
    {
      id: 3,
      date: "2025-08-20",
      field: "status",
      oldValue: "active",
      newValue: "abandoned",
    },
  ],
  3: [
    {
      id: 4,
      date: "2026-01-15",
      field: "status",
      oldValue: null,
      newValue: "active",
    },
  ],
  4: [
    {
      id: 5,
      date: "2025-06-01",
      field: "status",
      oldValue: null,
      newValue: "active",
    },
    {
      id: 6,
      date: "2025-08-30",
      field: "status",
      oldValue: "active",
      newValue: "completed",
    },
  ],
  5: [
    {
      id: 7,
      date: "2025-05-01",
      field: "status",
      oldValue: null,
      newValue: "active",
    },
    {
      id: 8,
      date: "2025-07-02",
      field: "status",
      oldValue: "active",
      newValue: "abandoned",
    },
  ],
  6: [
    {
      id: 9,
      date: "2026-05-01",
      field: "status",
      oldValue: null,
      newValue: "active",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockResolve(data, delay = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

function mockReject(status, message, delay = 300) {
  return new Promise((_, reject) =>
    setTimeout(() => reject({ status, message }), delay),
  );
}

// Progress is always derived from tasks — never stored as a raw number —
// so it can never drift out of sync with the checklist.
function computeProgress(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const completedCount = tasks.filter((t) => t.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

function toPublicProject(project) {
  const { tasks, ...rest } = project;
  const category = mockCategories.find((c) => c.id === project.categoryId);
  return {
    ...rest,
    categoryName: category ? category.name : null,
    progress: computeProgress(tasks),
  };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export function mockLogin() {
  return mockResolve({ success: true });
}
export function mockRegister() {
  return mockResolve({ success: true });
}
export function mockLogout() {
  return mockResolve({ success: true });
}
export function mockGetProfile() {
  return mockResolve({ ...mockUser });
}
export function mockUpdateProfile(data) {
  Object.assign(mockUser, data);
  return mockResolve({ ...mockUser });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function mockGetProjects(filters = {}) {
  const filtered = mockProjects.filter((p) => {
    if (filters.category && String(p.categoryId) !== String(filters.category))
      return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.priority && p.priority !== filters.priority) return false;
    if (
      filters.query &&
      !p.name.toLowerCase().includes(filters.query.toLowerCase())
    )
      return false;
    return true;
  });
  return mockResolve(filtered.map(toPublicProject));
}

export function mockSearchProjects(query, filters = {}) {
  return mockGetProjects({ ...filters, query });
}

export function mockGetProjectById(id) {
  const project = mockProjects.find((p) => String(p.id) === String(id));
  if (!project) return mockReject(404, "Project not found");
  return mockResolve(toPublicProject(project));
}

export function mockCreateProject(data) {
  const newProject = {
    id: nextProjectId++,
    name: data.name,
    description: data.description || "",
    goal: data.goal || "",
    categoryId: Number(data.categoryId),
    priority: data.priority || "medium",
    status: "active",
    startDate: data.startDate,
    targetDate: data.targetDate || null,
    lastProgressDate: null,
    abandonReason: null,
    tasks: [],
  };
  mockProjects.push(newProject);
  progressEntriesByProject[newProject.id] = [];
  historyByProject[newProject.id] = [
    {
      id: nextHistoryId++,
      date: newProject.startDate,
      field: "status",
      oldValue: null,
      newValue: "active",
    },
  ];
  return mockResolve(toPublicProject(newProject));
}

export function mockUpdateProject(id, data) {
  const project = mockProjects.find((p) => String(p.id) === String(id));
  if (!project) return mockReject(404, "Project not found");
  Object.assign(project, {
    name: data.name ?? project.name,
    description: data.description ?? project.description,
    goal: data.goal ?? project.goal,
    categoryId: data.categoryId ? Number(data.categoryId) : project.categoryId,
    priority: data.priority ?? project.priority,
    startDate: data.startDate ?? project.startDate,
    targetDate: data.targetDate ?? project.targetDate,
  });
  return mockResolve(toPublicProject(project));
}

export function mockChangeProjectStatus(id, { status, reason }) {
  const project = mockProjects.find((p) => String(p.id) === String(id));
  if (!project) return mockReject(404, "Project not found");
  const oldStatus = project.status;
  project.status = status;
  project.abandonReason = status === "abandoned" ? reason : null;
  const history =
    historyByProject[project.id] || (historyByProject[project.id] = []);
  history.push({
    id: nextHistoryId++,
    date: new Date().toISOString().slice(0, 10),
    field: "status",
    oldValue: oldStatus,
    newValue: status,
  });
  return mockResolve(toPublicProject(project));
}

export function mockReopenProject(id) {
  return mockChangeProjectStatus(id, { status: "active", reason: null });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export function mockGetCategories() {
  return mockResolve([...mockCategories]);
}
export function mockCreateCategory(data) {
  const newCategory = { id: nextCategoryId++, name: data.name };
  mockCategories.push(newCategory);
  return mockResolve(newCategory);
}
export function mockUpdateCategory(id, data) {
  const category = mockCategories.find((c) => String(c.id) === String(id));
  if (!category) return mockReject(404, "Category not found");
  category.name = data.name;
  return mockResolve(category);
}
export function mockRemoveCategory(id) {
  const index = mockCategories.findIndex((c) => String(c.id) === String(id));
  if (index === -1) return mockReject(404, "Category not found");
  mockCategories.splice(index, 1);
  return mockResolve({ success: true });
}

// ---------------------------------------------------------------------------
// Catalogs
// ---------------------------------------------------------------------------

export function mockGetAbandonReasons() {
  return mockResolve([...mockAbandonReasons]);
}

// ---------------------------------------------------------------------------
// Progress log entries
// ---------------------------------------------------------------------------

export function mockGetProgressEntries(projectId) {
  const entries = [...(progressEntriesByProject[projectId] || [])];
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  return mockResolve(entries);
}

export function mockCreateProgressEntry(projectId, data) {
  const entry = {
    id: nextProgressId++,
    date: new Date().toISOString().slice(0, 10),
    description: data.description,
    notes: data.notes || "",
  };
  if (!progressEntriesByProject[projectId])
    progressEntriesByProject[projectId] = [];
  progressEntriesByProject[projectId].push(entry);

  const project = mockProjects.find((p) => String(p.id) === String(projectId));
  if (project) project.lastProgressDate = entry.date;

  return mockResolve(entry);
}

export function mockRemoveProgressEntry(id) {
  for (const list of Object.values(progressEntriesByProject)) {
    const index = list.findIndex((e) => String(e.id) === String(id));
    if (index !== -1) {
      list.splice(index, 1);
      return mockResolve({ success: true });
    }
  }
  return mockReject(404, "Progress entry not found");
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export function mockGetHistory(projectId) {
  const history = [...(historyByProject[projectId] || [])];
  history.sort((a, b) => new Date(b.date) - new Date(a.date));
  return mockResolve(history);
}

// ---------------------------------------------------------------------------
// Tasks (the checklist that drives the progress percentage)
// ---------------------------------------------------------------------------

export function mockGetTasks(projectId) {
  const project = mockProjects.find((p) => String(p.id) === String(projectId));
  if (!project) return mockReject(404, "Project not found");
  return mockResolve([...project.tasks]);
}

export function mockCreateTask(projectId, data) {
  const project = mockProjects.find((p) => String(p.id) === String(projectId));
  if (!project) return mockReject(404, "Project not found");
  const task = { id: nextTaskId++, title: data.title, completed: false };
  project.tasks.push(task);
  return mockResolve(task);
}

export function mockUpdateTask(id, data) {
  for (const project of mockProjects) {
    const task = project.tasks.find((t) => String(t.id) === String(id));
    if (task) {
      Object.assign(task, data);
      return mockResolve(task);
    }
  }
  return mockReject(404, "Task not found");
}

export function mockToggleTask(id) {
  for (const project of mockProjects) {
    const task = project.tasks.find((t) => String(t.id) === String(id));
    if (task) {
      task.completed = !task.completed;
      return mockResolve(task);
    }
  }
  return mockReject(404, "Task not found");
}

export function mockRemoveTask(id) {
  for (const project of mockProjects) {
    const index = project.tasks.findIndex((t) => String(t.id) === String(id));
    if (index !== -1) {
      project.tasks.splice(index, 1);
      return mockResolve({ success: true });
    }
  }
  return mockReject(404, "Task not found");
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function mockGetDashboardSummary() {
  const summary = { active: 0, abandoned: 0, completed: 0 };
  mockProjects.forEach((p) => {
    summary[p.status] = (summary[p.status] || 0) + 1;
  });
  return mockResolve(summary);
}

export function mockGetRecentActivity() {
  const items = [];
  Object.values(progressEntriesByProject).forEach((list) => {
    list.forEach((entry) =>
      items.push({ date: entry.date, description: entry.description }),
    );
  });
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return mockResolve(items.slice(0, 5));
}

export function mockGetUpcomingGoals() {
  const items = mockProjects
    .filter((p) => p.status === "active" && p.targetDate)
    .map((p) => ({ name: p.name, targetDate: p.targetDate }))
    .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
  return mockResolve(items.slice(0, 5));
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

export function mockGetStatsByCategory() {
  const result = mockCategories.map((cat) => ({
    category: cat.name,
    total: mockProjects.filter((p) => p.categoryId === cat.id).length,
  }));
  return mockResolve(result);
}

export function mockGetStatsAbandonReasons() {
  const counts = {};
  mockProjects
    .filter((p) => p.status === "abandoned" && p.abandonReason)
    .forEach((p) => {
      counts[p.abandonReason] = (counts[p.abandonReason] || 0) + 1;
    });
  return mockResolve(
    Object.entries(counts).map(([reason, total]) => ({ reason, total })),
  );
}

export function mockGetStatsCompletedByYear() {
  const counts = {};
  mockProjects
    .filter((p) => p.status === "completed")
    .forEach((p) => {
      const year = new Date(p.lastProgressDate || p.targetDate).getFullYear();
      counts[year] = (counts[year] || 0) + 1;
    });
  return mockResolve(
    Object.entries(counts).map(([year, total]) => ({ year, total })),
  );
}

export function mockGetAvgTimeToAbandon() {
  const abandoned = mockProjects.filter((p) => p.status === "abandoned");
  if (abandoned.length === 0) return mockResolve({ days: 0 });
  const totalDays = abandoned.reduce((sum, p) => {
    const days = Math.round(
      (new Date(p.lastProgressDate) - new Date(p.startDate)) /
        (1000 * 60 * 60 * 24),
    );
    return sum + days;
  }, 0);
  return mockResolve({ days: Math.round(totalDays / abandoned.length) });
}
