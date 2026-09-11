(function () {
  "use strict";

  const { api, checkSession, showToast, ONBOARD_KEY, DRAFT_KEY } = window.Aries;

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

    const draft = { role: "", workspace: "", platforms: [], team: "" };
    try {
      Object.assign(draft, JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"));
    } catch {}

    const stepEls = document.querySelectorAll("[data-step]");
    const dots = document.querySelectorAll(".progress i");
    let index = 0;

    const show = (i) => {
      index = i;
      stepEls.forEach((el, n) => (el.hidden = n !== i));
      dots.forEach((el, n) => el.classList.toggle("on", n <= i));
      const isLast = index === stepEls.length - 1;
      const nextBtn = document.getElementById("nextBtn");
      const finishBtn = document.getElementById("finishBtn");
      if (nextBtn) {nextBtn.hidden = isLast;}
      if (finishBtn) {finishBtn.hidden = !isLast;}
    };

    document.querySelectorAll(".choice[data-role]").forEach((btn) => {
      if (btn.getAttribute("data-role") === draft.role) {btn.classList.add("on");}
      btn.addEventListener("click", () => {
        document.querySelectorAll(".choice[data-role]").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        draft.role = btn.getAttribute("data-role");
      });
    });

    document.querySelectorAll(".choice[data-team]").forEach((btn) => {
      if (btn.getAttribute("data-team") === draft.team) {btn.classList.add("on");}
      btn.addEventListener("click", () => {
        document.querySelectorAll(".choice[data-team]").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        draft.team = btn.getAttribute("data-team");
      });
    });

    document.querySelectorAll(".choice[data-platform]").forEach((btn) => {
      const p = btn.getAttribute("data-platform");
      if (draft.platforms.includes(p)) {btn.classList.add("on");}
      btn.addEventListener("click", () => {
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
    if (workspace) {workspace.value = draft.workspace || "";}

    document.getElementById("nextBtn")?.addEventListener("click", () => {
      if (index === 0 && !draft.role) {
        showToast("err", "Choose a role", "Please select how you will use Aries.");
        return;
      }
      if (index === 1) {
        draft.workspace = (workspace?.value || "").trim();
        if (!draft.workspace) {
          workspace?.focus();
          showToast("err", "Workspace name required", "Give your workspace a name to continue.");
          return;
        }
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      if (index < stepEls.length - 1) {show(index + 1);}
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      if (index === 0) {
        window.location.href = "register.html";
        return;
      }
      show(index - 1);
    });

    document.getElementById("finishBtn")?.addEventListener("click", async () => {
      draft.workspace = (workspace?.value || "").trim() || draft.workspace;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      if (!draft.role) {
        showToast("err", "Role missing", "Please go back and select a role.");
        return;
      }

      try {
        showToast("ok", "Finishing setup", "Saving your preferences…");
        await api("/api/auth/complete-onboarding", {
          method: "POST",
          body: JSON.stringify({
            role: draft.role,
            workspace: draft.workspace,
            platforms: draft.platforms,
            team: draft.team,
          }),
        });
        localStorage.setItem(ONBOARD_KEY, "complete");
        localStorage.removeItem(DRAFT_KEY);
        showToast("ok", "You're all set", "Taking you to the dashboard…");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 700);
      } catch (err) {
        showToast("err", "Could not finish setup", err.message || "Please try again.");
      }
    });

    const hello = document.getElementById("helloName");
    if (hello) {hello.textContent = user.full_name || user.email;}

    show(0);
  }

  init();
})();