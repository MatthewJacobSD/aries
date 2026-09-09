(function () {
  "use strict";
  const SESSION_KEY = "aries_session";
  const MODE_KEY = "aries_desk_mode";

  function session() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (_e) {
      return null;
    }
  }
  function mode() {
    return localStorage.getItem(MODE_KEY) || "demo";
  }
  function setMode(m) {
    localStorage.setItem(MODE_KEY, m);
  }
  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  }

  document.querySelectorAll("[data-sign-out]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      signOut();
    });
  });

  const slot = document.getElementById("authSlot");
  if (slot) {
    const s = session();
    if (s) {
      slot.innerHTML = `<a href="settings.html">${s.name || s.email}</a><a href="#" data-sign-out>Sign out</a>`;
      slot.querySelector("[data-sign-out]").addEventListener("click", (e) => {
        e.preventDefault();
        signOut();
      });
    } else {
      slot.innerHTML = '<a href="login.html">Sign in</a>';
    }
  }

  window.AriesSession = {session, mode, setMode, signOut};
})();
