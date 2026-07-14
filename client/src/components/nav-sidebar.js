import { goTo, PATHS } from "../routes/paths.js";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "bi-grid",
    href: "/client/src/app/dashboard/dashboard.html",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "bi-folder2-open",
    href: "/client/src/app/projects/projects.html",
  },
  {
    id: "categories",
    label: "Categories",
    icon: "bi-tags",
    href: "/client/src/app/categories/categories.html",
  },
  {
    id: "statistics",
    label: "Statistics",
    icon: "bi-bar-chart",
    href: "/client/src/app/statistics/statistics.html",
  },
  {
    id: "search",
    label: "Search",
    icon: "bi-search",
    href: "/client/src/app/search/search.html",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "bi-person-circle",
    href: "/client/src/app/profile/profile.html",
  },
];

function buildNavLinks(activeId) {
  return NAV_ITEMS.map(
    (item) => `
    <a href="${item.href}"
       class="list-group-item list-group-item-action bg-transparent border-0 d-flex align-items-center gap-2 ${item.id === activeId ? "active" : ""}">
      <i class="bi ${item.icon}"></i> ${item.label}
    </a>
  `,
  ).join("");
}

class NavSidebar extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute("active") || "";
    const links = buildNavLinks(active);

    this.innerHTML = `
      <!-- Top bar, visible only below the lg breakpoint -->
      <nav class="navbar navbar-dark d-lg-none border-bottom sticky-top" style="background-color: var(--bs-tertiary-bg);">
        <div class="container-fluid">
          <button class="btn btn-outline-secondary btn-sm" type="button"
                  data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-label="Open menu">
            <i class="bi bi-list"></i>
          </button>
          <a class="navbar-brand wordmark ms-2" href="/app/dashboard/dashboard.html">
            <span class="ember-dot"></span>Phoenix
          </a>
          <span style="width:38px;"></span> <!-- balances the toggle button so the brand stays centered -->
        </div>
      </nav>

      <!-- Lateral menu for small screens: Bootstrap Offcanvas, slides in from the left -->
      <div class="offcanvas offcanvas-start d-lg-none" tabindex="-1" id="sidebarOffcanvas">
        <div class="offcanvas-header border-bottom">
          <a class="wordmark" href="/app/dashboard/dashboard.html"><span class="ember-dot"></span>Phoenix</a>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column p-0">
          <div class="list-group list-group-flush flex-grow-1">${links}</div>
          <div class="p-3 border-top">
            <button class="btn btn-outline-secondary w-100 nav-logout-btn">
              <i class="bi bi-box-arrow-right me-1"></i>Log out
            </button>
          </div>
        </div>
      </div>

      <!-- Fixed sidebar for large screens -->
      <aside class="d-none d-lg-flex flex-column position-fixed top-0 start-0 bottom-0 border-end p-3"
             style="width: 240px; background-color: var(--bs-tertiary-bg); z-index: 1030;">
        <a href="/app/dashboard/dashboard.html" class="wordmark mb-4"><span class="ember-dot"></span>Phoenix</a>
        <div class="list-group list-group-flush flex-grow-1">${links}</div>
        <div class="pt-3 border-top">
          <button class="btn btn-outline-secondary w-100 nav-logout-btn">
            <i class="bi bi-box-arrow-right me-1"></i>Log out
          </button>
        </div>
      </aside>
    `;

    this.querySelectorAll(".nav-logout-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await authService.logout();
        goTo(PATHS.LOGIN);
      });
    });
  }
}

customElements.define("nav-sidebar", NavSidebar);
