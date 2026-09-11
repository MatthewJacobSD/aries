(function () {
  "use strict";

  const { api, formatNum, escapeHtml } = window.Aries;

  const showFilled = (pane) => {
    const empty = document.getElementById(`${pane}-empty`);
    const filled = document.getElementById(`${pane}-filled`);
    if (empty) {empty.style.display = "none";}
    if (filled) {filled.style.display = "";}
  };

  const showEmpty = (pane) => {
    const empty = document.getElementById(`${pane}-empty`);
    const filled = document.getElementById(`${pane}-filled`);
    if (empty) {empty.style.display = "";}
    if (filled) {filled.style.display = "none";}
  };

  let userData = null;

  async function initDashboard() {
    userData = await api("/api/auth/me");
    if (!userData) {
      window.location.href = "login.html";
      return;
    }

    const workspaceName = userData.full_name || "Workspace";
    const userRole = userData.role || "buyer";
    const ROLE_HIERARCHY = ["buyer", "creator", "admin"];

    const hasMinRole = (required) => {
      return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(required);
    };

    document.querySelectorAll("nav.primary a[data-min-role]").forEach((link) => {
      const minRole = link.getAttribute("data-min-role");
      if (minRole && !hasMinRole(minRole)) {link.hidden = true;}
    });

    const buttons = document.querySelectorAll(".dash-nav button[data-pane]");
    const panes = document.querySelectorAll(".pane");
    const title = document.getElementById("deskTitle");
    const loaded = {};
    let firstVisiblePane = null;

    buttons.forEach((btn) => {
      const minRole = btn.getAttribute("data-min-role");
      if (minRole && !hasMinRole(minRole)) {
        btn.hidden = true;
        const pane = document.getElementById(`pane-${btn.getAttribute("data-pane")}`);
        if (pane) {pane.hidden = true;}
        return;
      }
      if (!firstVisiblePane) {firstVisiblePane = btn.getAttribute("data-pane");}

      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-pane");
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panes.forEach((p) => p.classList.toggle("on", p.id === `pane-${id}`));
        if (title) {title.textContent = `${workspaceName} · ${btn.textContent.trim()}`;}
        history.pushState(null, "", `#${id}`);
        if (!loaded[id]) {
          loaded[id] = true;
          loadPane(id);
        }
      });
    });

    const openPane = (id) => {
      const match = document.querySelector(`.dash-nav button[data-pane="${id}"]`);
      if (match && !match.hidden) {match.click();}
    };

    if (location.hash) {
      const hashPane = location.hash.replace("#", "");
      const hashBtn = document.querySelector(`.dash-nav button[data-pane="${hashPane}"]`);
      if (hashBtn && !hashBtn.hidden) {openPane(hashPane);}
      else if (firstVisiblePane) {
        loaded[firstVisiblePane] = true;
        loadPane(firstVisiblePane);
      }
    } else if (firstVisiblePane) {
      loaded[firstVisiblePane] = true;
      loadPane(firstVisiblePane);
    }

    window.addEventListener("hashchange", () => openPane(location.hash.replace("#", "")));

    /* Pane loaders */
    const loadOverview = async () => {
      const [revenue, tasks, creators] = await Promise.all([
        api("/api/payments/revenue?period=monthly"),
        api("/api/tasks?page=1&limit=20"),
        api("/api/creators?page=1&limit=20"),
      ]);
      const hasData =
        (revenue && (revenue.gross > 0 || revenue.outstanding > 0)) ||
        tasks?.items?.length > 0 ||
        creators?.items?.length > 0;
      if (!hasData) {return showEmpty("overview");}
      showFilled("overview");
      const metrics = document.getElementById("overview-metrics");
      if (metrics && revenue) {
        metrics.innerHTML = `
          <div class="metric"><span>Net this period</span><strong>$${formatNum(revenue.net)}</strong></div>
          <div class="metric"><span>Outstanding</span><strong>$${formatNum(revenue.outstanding)}</strong></div>`;
      }
      const activity = document.getElementById("overview-activity");
      if (activity) {
        let rows = "";
        (tasks?.items || []).slice(0, 5).forEach((t) => {
          rows += `<tr><td>${escapeHtml(t.title)}</td><td class="mono">${escapeHtml(t.priority)}</td><td>${escapeHtml(t.status)}</td><td>${escapeHtml(t.due_date || "—")}</td></tr>`;
        });
        activity.innerHTML = rows || `<tr><td colspan="4">No recent activity</td></tr>`;
      }
    };

    const loadRevenue = async () => {
      const data = await api("/api/payments/revenue?period=monthly");
      if (!data || (data.gross === 0 && data.fees === 0 && data.outstanding === 0)) {return showEmpty("revenue");}
      showFilled("revenue");
      const el = document.getElementById("revenue-metrics");
      if (el) {
        el.innerHTML = `
          <div class="metric"><span>Gross</span><strong>$${formatNum(data.gross)}</strong></div>
          <div class="metric"><span>Fees</span><strong>$${formatNum(data.fees)}</strong></div>
          <div class="metric"><span>Outstanding</span><strong>$${formatNum(data.outstanding)}</strong></div>`;
      }
    };

    const loadCreators = async () => {
      const data = await api("/api/creators?page=1&limit=20");
      if (!data?.items?.length) {return showEmpty("creators");}
      showFilled("creators");
      const list = document.getElementById("creators-list");
      if (list) {
        list.innerHTML = data.items
          .map((c) => `<tr>
            <td><a href="creator-detail.html?id=${c.id}">${escapeHtml(c.name)}</a></td>
            <td>${escapeHtml(c.platform)}</td>
            <td>${escapeHtml(c.status)}</td>
            <td>${Math.round((c.revenue_share || 0) * 100)}%</td>
          </tr>`)
          .join("");
      }
    };

    const loadCampaigns = async () => {
      const data = await api("/api/campaigns?page=1&limit=20");
      if (!data?.items?.length) {return showEmpty("campaigns");}
      showFilled("campaigns");
      const list = document.getElementById("campaigns-list");
      if (list) {
        list.innerHTML = data.items
          .map((c) => `<div class="queue-item"><b><a href="campaign-detail.html?id=${c.id}">${escapeHtml(c.name)}</a></b><span>${escapeHtml(c.status)}</span></div>`)
          .join("");
      }
    };

    const loadTasks = async () => {
      const data = await api("/api/tasks?page=1&limit=20");
      if (!data?.items?.length) {return showEmpty("tasks");}
      showFilled("tasks");
      const list = document.getElementById("tasks-list");
      if (list) {
        list.innerHTML = data.items
          .map((t) => `<div class="queue-item"><b>${escapeHtml(t.title)}</b><span class="badge">${escapeHtml(t.priority)}</span></div>`)
          .join("");
      }
    };

    const loadClients = async () => {
      const data = await api("/api/clients");
      const items = Array.isArray(data) ? data : data?.items || [];
      if (!items.length) {return showEmpty("clients");}
      showFilled("clients");
      const list = document.getElementById("clients-list");
      if (list) {
        list.innerHTML = items
          .map((c) => `<div class="queue-item"><b><a href="client-detail.html?id=${c.id}">${escapeHtml(c.name)}</a></b><span>${escapeHtml(c.status)}</span></div>`)
          .join("");
      }
    };

    const loadIntegrations = async () => {
      const data = await api("/api/integrations");
      const items = Array.isArray(data) ? data : data?.items || [];
      if (!items.length) {return showEmpty("integrations");}
      showFilled("integrations");
      const list = document.getElementById("integrations-list");
      if (list) {
        list.innerHTML = items
          .map((i) => `<div class="queue-item"><b>${escapeHtml(i.type)}</b><span class="badge">${escapeHtml(i.status)}</span></div>`)
          .join("");
      }
    };

    const loadSettings = async () => {
      const user = userData || (await api("/api/auth/me"));
      const el = document.getElementById("settings-metrics");
      if (el && user) {
        el.innerHTML = `
          <div class="metric"><span>Signed in as</span><strong>${escapeHtml(user.full_name)}</strong></div>
          <div class="metric"><span>Role</span><strong>${escapeHtml(user.role)}</strong></div>`;
      }
    };

    const loadPane = (id) => {
      const map = {
        overview: loadOverview,
        revenue: loadRevenue,
        creators: loadCreators,
        campaigns: loadCampaigns,
        tasks: loadTasks,
        clients: loadClients,
        integrations: loadIntegrations,
        settings: loadSettings,
      };
      map[id]?.();
    };
  }

  initDashboard();

  /* Chat */
  const form = document.getElementById("deskForm");
  const input = document.getElementById("deskInput");
  const msgs = document.getElementById("deskMsgs");
  if (form && input && msgs) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {return;}
      const out = document.createElement("div");
      out.className = "bubble out";
      out.textContent = text;
      msgs.appendChild(out);
      input.value = "";
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(() => {
        const inn = document.createElement("div");
        inn.className = "bubble in";
        inn.textContent = "Noted. The relevant workspace record is the best place to continue.";
        msgs.appendChild(inn);
        msgs.scrollTop = msgs.scrollHeight;
      }, 600);
    });
  }

  /* Mobile menu */
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const dashSide = document.querySelector(".dash-side");
  let overlay = null;

  const closeMobileMenu = () => {
    menuToggle?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    dashSide?.classList.remove("open");
    overlay?.classList.remove("open");
    document.body.style.overflow = "";
  };

  const openMobileMenu = () => {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "mobile-nav-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", closeMobileMenu);
    }
    menuToggle?.classList.add("open");
    menuToggle?.setAttribute("aria-expanded", "true");
    dashSide?.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.contains("open") ? closeMobileMenu() : openMobileMenu();
  });

  document.querySelectorAll(".dash-nav button[data-pane]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.innerWidth <= 800) {closeMobileMenu();}
    });
  });
})();