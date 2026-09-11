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

  async function init() {
    const existingUser = await checkSession();
    if (existingUser) {
      const onboarded = localStorage.getItem(ONBOARD_KEY) === "complete";
      window.location.href = onboarded ? "dashboard.html" : "onboarding.html";
      return;
    }
  }

  init();

  const showAlert = (el, type, text) => {
    if (!el) {
      return;
    }
    el.className = `alert show ${type}`;
    el.textContent = text;
  };

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const alertBox = document.getElementById("authAlert");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (document.getElementById("email").value || "").trim().toLowerCase();
      const password = document.getElementById("password").value || "";
      try {
        showAlert(alertBox, "ok", "Signing in...");
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Login failed");
        }
        showAlert(alertBox, "ok", "Signed in. Taking you through.");
        window.setTimeout(() => {
          const onboarded = localStorage.getItem(ONBOARD_KEY) === "complete";
          window.location.href = onboarded ? "dashboard.html" : "onboarding.html";
        }, 400);
      } catch (err) {
        showAlert(alertBox, "err", err.message || "Login failed. Check your credentials.");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = (document.getElementById("name").value || "").trim();
      const email = (document.getElementById("email").value || "").trim().toLowerCase();
      const password = document.getElementById("password").value || "";
      const confirm = document.getElementById("confirm").value || "";
      if (password.length < 8) {
        showAlert(alertBox, "err", "Use at least 8 characters for the password.");
        return;
      }
      if (password !== confirm) {
        showAlert(alertBox, "err", "The two passwords do not match.");
        return;
      }
      try {
        showAlert(alertBox, "ok", "Creating account...");
        const regRes = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: name }),
        });
        if (!regRes.ok) {
          const data = await regRes.json();
          throw new Error(data.detail || "Registration failed");
        }
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        });
        if (!loginRes.ok) {
          throw new Error("Auto-login failed");
        }
        localStorage.removeItem(ONBOARD_KEY);
        showAlert(alertBox, "ok", "Account created. Next: a short setup.");
        window.setTimeout(() => {
          window.location.href = "onboarding.html";
        }, 450);
      } catch (err) {
        showAlert(alertBox, "err", err.message || "Registration failed.");
      }
    });
  }

  document.querySelectorAll("[data-provider]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.getAttribute("data-provider");
      showAlert(
        alertBox,
        "ok",
        `Social login with ${provider} requires backend OAuth configuration.`
      );
    });
  });
})();
