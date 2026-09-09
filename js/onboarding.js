(function () {
  "use strict";

  /* ------------------------[Storage Keys]------------------------ */
  const SESSION_KEY = "aries_session";
  const ONBOARD_KEY = "aries_onboarding";
  const DRAFT_KEY = "aries_onboarding_draft";

  /* ------------------------[Session Guard]------------------------ */
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    /* ignored */
  }
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  /* ------------------------[Draft State]------------------------ */
  const draft = {role: "", workspace: "", platforms: [], team: ""};
  try {
    Object.assign(draft, JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}"));
  } catch {
    /* ignored */
  }

  /* ------------------------[Step Navigation]------------------------ */
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
  };

  /* ------------------------[Role Choices]------------------------ */
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

  /* ------------------------[Team Choices]------------------------ */
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

  /* ------------------------[Platform Choices]------------------------ */
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

  /* ------------------------[Workspace Input]------------------------ */
  const workspace = document.getElementById("workspace");
  if (workspace) {
    workspace.value = draft.workspace || "";
  }

  /* ------------------------[Navigation Buttons]------------------------ */
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

  /* ------------------------[Finish]------------------------ */
  document.getElementById("finishBtn").addEventListener("click", () => {
    draft.workspace = (workspace && workspace.value) || draft.workspace;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    localStorage.setItem(ONBOARD_KEY, "complete");
    window.location.href = "dashboard.html";
  });

  /* ------------------------[Greeting]------------------------ */
  const hello = document.getElementById("helloName");
  if (hello) {
    hello.textContent = session.name || session.email;
  }
  show(0);
})();
