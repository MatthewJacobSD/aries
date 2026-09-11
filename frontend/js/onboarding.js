(function () {
  "use strict";

  const API_URL = "http://localhost:8000";
  const ONBOARD_KEY = "aries_onboarding";

  async function checkSession() {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include"
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return null;
  }

  async function api(endpoint, opts = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: "include",
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...opts.headers,
      },
    });
    if (response.status === 401) {
      window.location.href = "login.html";
      return null;
    }
    if (!response.ok) {
      return null;
    }
    return response.json();
  }

  async function init() {
    const user = await checkSession();
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (localStorage.getItem(ONBOARD_KEY) === "complete") {
      window.location.href = "dashboard.html";
      return;
    }

    const DRAFT_KEY = "aries_onboarding_draft";
    const draft = {role: "", workspace: "", platforms: [], team: ""};
    try {
      Object.assign(draft, JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"));
    } catch {}

    const stepEls = document.querySelectorAll("[data-step]");
    const dots = document.querySelectorAll(".progress i");
    let index = 0;

    const show = (i) => {
      index = i;
      stepEls.forEach((el, n) => {
        el.hidden = n !== i;
      });
      dots.forEach((el, n) => {
        el.classList.toggle("on", n <= i);
      });
      const nextBtn = document.getElementById("nextBtn");
      const finishBtn = document.getElementById("finishBtn");
      const isLast = index === stepEls.length - 1;
      if (nextBtn) {
        nextBtn.hidden = isLast;
      }
      if (finishBtn) {
        finishBtn.hidden = !isLast;
      }
    };

    document.querySelectorAll(".choice[data-role]").forEach((btn) => {
      if (btn.getAttribute("data-role") === draft.role) {
        btn.classList.add("on");
      }
      btn.addEventListener("click", () => {
        document.querySelectorAll(".choice[data-role]").forEach((b) => {
          b.classList.remove("on");
        });
        btn.classList.add("on");
        draft.role = btn.getAttribute("data-role");
      });
    });

    document.querySelectorAll(".choice[data-team]").forEach((btn) => {
      if (btn.getAttribute("data-team") === draft.team) {
        btn.classList.add("on");
      }
      btn.addEventListener("click", () => {
        document.querySelectorAll(".choice[data-team]").forEach((b) => {
          b.classList.remove("on");
        });
        btn.classList.add("on");
        draft.team = btn.getAttribute("data-team");
      });
    });

    document.querySelectorAll(".choice[data-platform]").forEach((btn) => {
      if (draft.platforms.indexOf(btn.getAttribute("data-platform")) !== -1) {
        btn.classList.add("on");
      }
      btn.addEventListener("click", () => {
        const p = btn.getAttribute("data-platform");
        const at = draft.platforms.indexOf(p);
        if (at === -1) {
          draft.platforms.push(p);
          btn.classList.add("on");
        } else {
          draft.platforms.splice(at, 1);
          btn.classList.remove("on");
        }
      });
    });

    const workspace = document.getElementById("workspace");
    if (workspace) {
      workspace.value = draft.workspace || "";
    }

    document.getElementById("nextBtn").addEventListener("click", () => {
      if (index === 0 && !draft.role) {
        return;
      }
      if (index === 1) {
        draft.workspace = (workspace.value || "").trim();
        if (!draft.workspace) {
          workspace.focus();
          return;
        }
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (index < stepEls.length - 1) {
        show(index + 1);
      }
    });

    document.getElementById("backBtn").addEventListener("click", () => {
      if (index === 0) {
        window.location.href = "register.html";
        return;
      }
      show(index - 1);
    });

    document.getElementById("finishBtn").addEventListener("click", async () => {
      draft.workspace = (workspace && workspace.value) || draft.workspace;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      if (draft.role) {
        await api("/api/auth/complete-onboarding", {
          method: "POST",
          body: JSON.stringify({
            role: draft.role,
            workspace: draft.workspace,
            platforms: draft.platforms,
            team: draft.team,
          }),
        });
      }

      localStorage.setItem(ONBOARD_KEY, "complete");
      window.location.href = "dashboard.html";
    });

    const hello = document.getElementById("helloName");
    if (hello) {
      hello.textContent = user.full_name || user.email;
    }
    show(0);
  }

  init();
})();
