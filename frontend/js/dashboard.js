(function () {
  "use strict";

  const API_URL = "http://localhost:8000";
  const SESSION_KEY = "aries_session";
  const TOKEN_KEY = "aries_token";

  /* ------------------------[Session]------------------------ */
  let sessionData = null;
  try {
    sessionData = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    /* ignored */
  }

  if (!sessionData) {
    window.location.href = "login.html";
    return;
  }

  const workspaceName = sessionData.name || "Workspace";
  const userRole = sessionData.role || "buyer";

  const ROLE_HIERARCHY = ["buyer", "creator", "admin"];

  const hasMinRole = (required) => {
    const userLevel = ROLE_HIERARCHY.indexOf(userRole);
    const requiredLevel = ROLE_HIERARCHY.indexOf(required);
    return userLevel >= requiredLevel;
  };

  /* ------------------------[API Client]------------------------ */
  const api = async (endpoint) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {headers});
    if (response.status === 401) {
      window.location.href = "login.html";
      return null;
    }
    if (!response.ok) {
      return null;
    }
    return response.json();
  };

  /* ------------------------[Helpers]------------------------ */
  const formatNum = (n) => {
    if (n === undefined || n === null) {
      return "0";
    }
    return Number(n).toLocaleString("en-US", {minimumFractionDigits: 0});
  };

  const escapeHtml = (str) => {
    if (!str) {
      return "";
    }
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  };

  const showFilled = (pane) => {
    const empty = document.getElementById(`${pane}-empty`);
    const filled = document.getElementById(`${pane}-filled`);
    if (empty) {
      empty.style.display = "none";
    }
    if (filled) {
      filled.style.display = "";
    }
  };

  const showEmpty = (pane) => {
    const empty = document.getElementById(`${pane}-empty`);
    const filled = document.getElementById(`${pane}-filled`);
    if (empty) {
      empty.style.display = "";
    }
    if (filled) {
      filled.style.display = "none";
    }
  };

  /* ------------------------[Pane Switching]------------------------ */
  const buttons = document.querySelectorAll(".dash-nav button[data-pane]");
  const panes = document.querySelectorAll(".pane");
  const title = document.getElementById("deskTitle");
  const loaded = {};
  let firstVisiblePane = null;

  buttons.forEach((btn) => {
    const minRole = btn.getAttribute("data-min-role");
    if (minRole && !hasMinRole(minRole)) {
      btn.hidden = true;
      const paneId = btn.getAttribute("data-pane");
      const pane = document.getElementById(`pane-${paneId}`);
      if (pane) {
        pane.hidden = true;
      }
      return;
    }
    if (!firstVisiblePane) {
      firstVisiblePane = btn.getAttribute("data-pane");
    }
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-pane");
      buttons.forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
      panes.forEach((p) => {
        p.classList.toggle("on", p.id === `pane-${id}`);
      });
      if (title) {
        title.textContent = `${workspaceName} \u00B7 ${btn.textContent.trim()}`;
      }
      history.pushState(null, "", `#${id}`);
      if (!loaded[id]) {
        loaded[id] = true;
        loadPane(id);
      }
    });
  });

  /* ------------------------[Hash Deep-Linking]------------------------ */
  const openPane = (id) => {
    const match = document.querySelector(`.dash-nav button[data-pane="${id}"]`);
    if (match && !match.hidden) {
      match.click();
    }
  };

  if (location.hash) {
    const hashPane = location.hash.replace("#", "");
    const hashBtn = document.querySelector(`.dash-nav button[data-pane="${hashPane}"]`);
    if (hashBtn && !hashBtn.hidden) {
      openPane(hashPane);
    } else if (firstVisiblePane) {
      loaded[firstVisiblePane] = true;
      loadPane(firstVisiblePane);
    }
  } else if (firstVisiblePane) {
    loaded[firstVisiblePane] = true;
    loadPane(firstVisiblePane);
  }

  window.addEventListener("hashchange", () => {
    openPane(location.hash.replace("#", ""));
  });

  /* ------------------------[Overview Pane]------------------------ */
  const loadOverview = async () => {
    const revenue = await api("/api/payments/revenue?period=monthly");
    const tasks = await api("/api/tasks?page=1&limit=20");
    const creators = await api("/api/creators?page=1&limit=20");
    const hasData =
      (revenue && (revenue.gross > 0 || revenue.outstanding > 0)) ||
      (tasks && tasks.items && tasks.items.length > 0) ||
      (creators && creators.items && creators.items.length > 0);
    if (!hasData) {
      showEmpty("overview");
      return;
    }
    showFilled("overview");
    const metrics = document.getElementById("overview-metrics");
    if (revenue) {
      metrics.innerHTML = `<div class="metric"><span>Net this period</span><strong>$${formatNum(revenue.net)}</strong></div><div class="metric"><span>Outstanding</span><strong>$${formatNum(revenue.outstanding)}</strong></div>`;
    }
    const activity = document.getElementById("overview-activity");
    let rows = "";
    if (tasks && tasks.items) {
      tasks.items.slice(0, 5).forEach((t) => {
        rows += `<tr><td>${escapeHtml(t.title)}</td><td class="mono">${escapeHtml(t.priority)}</td><td>${escapeHtml(t.status)}</td><td>${escapeHtml(t.due_date || "\u2014")}</td></tr>`;
      });
    }
    activity.innerHTML = rows || "<tr><td colspan='4'>No recent activity</td></tr>";
  };

  /* ------------------------[Revenue Pane]------------------------ */
  const loadRevenue = async () => {
    const data = await api("/api/payments/revenue?period=monthly");
    if (!data || (data.gross === 0 && data.fees === 0 && data.outstanding === 0)) {
      showEmpty("revenue");
      return;
    }
    showFilled("revenue");
    document.getElementById("revenue-metrics").innerHTML =
      `<div class="metric"><span>Gross</span><strong>$${formatNum(data.gross)}</strong></div><div class="metric"><span>Fees</span><strong>$${formatNum(data.fees)}</strong></div><div class="metric"><span>Outstanding</span><strong>$${formatNum(data.outstanding)}</strong></div>`;
  };

  /* ------------------------[Creators Pane]------------------------ */
  const loadCreators = async () => {
    const data = await api("/api/creators?page=1&limit=20");
    if (!data || !data.items || data.items.length === 0) {
      showEmpty("creators");
      return;
    }
    showFilled("creators");
    let rows = "";
    data.items.forEach((c) => {
      rows += `<tr><td><a href="creator-detail.html?id=${c.id}">${escapeHtml(c.name)}</a></td><td>${escapeHtml(c.platform)}</td><td>${escapeHtml(c.status)}</td><td>${Math.round(c.revenue_share * 100)}%</td></tr>`;
    });
    document.getElementById("creators-list").innerHTML = rows;
  };

  /* ------------------------[Campaigns Pane]------------------------ */
  const loadCampaigns = async () => {
    const data = await api("/api/campaigns?page=1&limit=20");
    if (!data || !data.items || data.items.length === 0) {
      showEmpty("campaigns");
      return;
    }
    showFilled("campaigns");
    let html = "";
    data.items.forEach((c) => {
      html += `<div class="queue-item"><b><a href="campaign-detail.html?id=${c.id}">${escapeHtml(c.name)}</a></b><span>${escapeHtml(c.status)}</span></div>`;
    });
    document.getElementById("campaigns-list").innerHTML = html;
  };

  /* ------------------------[Tasks Pane]------------------------ */
  const loadTasks = async () => {
    const data = await api("/api/tasks?page=1&limit=20");
    if (!data || !data.items || data.items.length === 0) {
      showEmpty("tasks");
      return;
    }
    showFilled("tasks");
    let html = "";
    data.items.forEach((t) => {
      html += `<div class="queue-item"><b>${escapeHtml(t.title)}</b><span class="badge">${escapeHtml(t.priority)}</span></div>`;
    });
    document.getElementById("tasks-list").innerHTML = html;
  };

  /* ------------------------[Clients Pane]------------------------ */
  const loadClients = async () => {
    const data = await api("/api/clients");
    if (!data || data.length === 0) {
      showEmpty("clients");
      return;
    }
    showFilled("clients");
    let html = "";
    data.forEach((c) => {
      html += `<div class="queue-item"><b><a href="client-detail.html?id=${c.id}">${escapeHtml(c.name)}</a></b><span>${escapeHtml(c.status)}</span></div>`;
    });
    document.getElementById("clients-list").innerHTML = html;
  };

  /* ------------------------[Integrations Pane]------------------------ */
  const loadIntegrations = async () => {
    const data = await api("/api/integrations");
    if (!data || data.length === 0) {
      showEmpty("integrations");
      return;
    }
    showFilled("integrations");
    let html = "";
    data.forEach((i) => {
      html += `<div class="queue-item"><b>${escapeHtml(i.type)}</b><span class="badge">${escapeHtml(i.status)}</span></div>`;
    });
    document.getElementById("integrations-list").innerHTML = html;
  };

  /* ------------------------[Settings Pane]------------------------ */
  const loadSettings = async () => {
    const user = await api("/api/auth/me");
    if (user) {
      document.getElementById("settings-metrics").innerHTML =
        `<div class="metric"><span>Signed in as</span><strong>${escapeHtml(user.full_name)}</strong></div><div class="metric"><span>Role</span><strong>${escapeHtml(user.role)}</strong></div>`;
    }
  };

  /* ------------------------[Pane Router]------------------------ */
  const loadPane = (id) => {
    switch (id) {
      case "overview":
        loadOverview();
        break;
      case "revenue":
        loadRevenue();
        break;
      case "creators":
        loadCreators();
        break;
      case "campaigns":
        loadCampaigns();
        break;
      case "tasks":
        loadTasks();
        break;
      case "clients":
        loadClients();
        break;
      case "integrations":
        loadIntegrations();
        break;
      case "settings":
        loadSettings();
        break;
    }
  };

  /* ------------------------[Chat]------------------------ */
  const form = document.getElementById("deskForm");
  const input = document.getElementById("deskInput");
  const msgs = document.getElementById("deskMsgs");
  if (form && input && msgs) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {
        return;
      }
      const out = document.createElement("div");
      out.className = "bubble out";
      out.textContent = text;
      msgs.appendChild(out);
      input.value = "";
      msgs.scrollTop = msgs.scrollHeight;
      window.setTimeout(() => {
        const inn = document.createElement("div");
        inn.className = "bubble in";
        inn.textContent = "Noted. The relevant workspace record is the best place to continue.";
        msgs.appendChild(inn);
        msgs.scrollTop = msgs.scrollHeight;
      }, 600);
    });
  }

  /* ------------------------[Mobile Menu]------------------------ */
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const dashSide = document.querySelector(".dash-side");
  let overlay = null;

  const createOverlay = () => {
    overlay = document.createElement("div");
    overlay.className = "mobile-nav-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", closeMobileMenu);
  };

  const openMobileMenu = () => {
    if (!overlay) {
      createOverlay();
    }
    menuToggle.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    dashSide.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeMobileMenu = () => {
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    dashSide.classList.remove("open");
    if (overlay) {
      overlay.classList.remove("open");
    }
    document.body.style.overflow = "";
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.classList.contains("open");
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  /* Close menu when a nav button is clicked */
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.innerWidth <= 800) {
        closeMobileMenu();
      }
    });
  });
})();
