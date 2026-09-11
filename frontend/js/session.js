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

  function signOut() {
    fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    localStorage.removeItem(ONBOARD_KEY);
    window.location.href = "login.html";
  }

  document.querySelectorAll("[data-sign-out]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      signOut();
    });
  });

  async function initNav() {
    const slot = document.getElementById("authSlot");
    if (!slot) {
      return;
    }

    const user = await checkSession();
    if (user) {
      const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";
      slot.innerHTML = `
        <span class="role-badge">${roleLabel}</span>
        <a href="settings.html">${user.full_name || user.email}</a>
        <a href="#" data-sign-out>Sign out</a>
      `;
      slot.querySelector("[data-sign-out]").addEventListener("click", (e) => {
        e.preventDefault();
        signOut();
      });
    } else {
      slot.innerHTML = '<a href="login.html">Sign in</a>';
    }
  }

  initNav();

  window.AriesSession = { checkSession, signOut };
})();
