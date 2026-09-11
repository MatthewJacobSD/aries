(function () {
  "use strict";

  const API_URL = "http://localhost:8000";
  const ONBOARD_KEY = "aries_onboarding";
  const DRAFT_KEY = "aries_onboarding_draft";

  /* ------------------------[API]------------------------ */
  async function api(endpoint, opts = {}) {
    try {
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
        let message = "Request failed";
        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {}
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      if (response.status === 204) {return true;}
      return response.json();
    } catch (err) {
      if (err.status) {throw err;} // rethrow API errors
      return null; // network failure
    }
  }

  async function checkSession() {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {return await res.json();}
    } catch {}
    return null;
  }

  async function signOut() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    localStorage.removeItem(ONBOARD_KEY);
    localStorage.removeItem(DRAFT_KEY);
    window.location.href = "login.html";
  }

  /* ------------------------[Toast / Modal]------------------------ */
  function showToast(type, title, message, options = {}) {
    let root = document.getElementById("aries-toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "aries-toast-root";
      root.setAttribute("aria-live", "polite");
      document.body.appendChild(root);
    }

    root.innerHTML = "";
    const duration = options.duration ?? (type === "ok" ? 1600 : 0);

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay aries-toast-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const modal = document.createElement("div");
    modal.className = `modal aries-toast ${type === "ok" ? "toast-ok" : "toast-err"}`;
    modal.innerHTML = `
      <div class="modal-head">
        <h3>${title}</h3>
        <button type="button" class="modal-close" aria-label="Close">×</button>
      </div>
      <p class="toast-message">${message}</p>
    `;

    overlay.appendChild(modal);
    root.appendChild(overlay);

    const close = () => overlay.remove();
    modal.querySelector(".modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {close();}
    });

    if (duration > 0) {setTimeout(close, duration);}

    return { close };
  }

  /* ------------------------[Helpers]------------------------ */
  function formatNum(n) {
    if (n === undefined || n === null) {return "0";}
    return Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
  }

  function escapeHtml(str) {
    if (!str) {return "";}
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  /* ------------------------[Public API]------------------------ */
  window.Aries = {
    API_URL,
    ONBOARD_KEY,
    DRAFT_KEY,
    api,
    checkSession,
    signOut,
    showToast,
    formatNum,
    escapeHtml,
    getParam,
  };
})();