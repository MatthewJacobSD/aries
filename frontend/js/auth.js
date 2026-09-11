(function () {
  "use strict";

  const API_URL = "http://localhost:8000";
  const SESSION_KEY = "aries_session";
  const TOKEN_KEY = "aries_token";
  const ONBOARD_KEY = "aries_onboarding";

  /* ------------------------[Helpers]------------------------ */
  const session = () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  };

  /* ------------------------[Already Logged In]------------------------ */
  const existingSession = session();
  if (existingSession) {
    const onboarded = localStorage.getItem(ONBOARD_KEY) === "complete";
    window.location.href = onboarded ? "dashboard.html" : "onboarding.html";
    return;
  }

  const setSession = (user, token) => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        at: Date.now(),
      })
    );
    localStorage.setItem(TOKEN_KEY, token);
  };

  const needsOnboarding = () => {
    return localStorage.getItem(ONBOARD_KEY) !== "complete";
  };

  const afterAuth = () => {
    window.location.href = needsOnboarding() ? "onboarding.html" : "dashboard.html";
  };

  const showAlert = (el, type, text) => {
    if (!el) {
      return;
    }
    el.className = `alert show ${type}`;
    el.textContent = text;
  };

  /* ------------------------[API Calls]------------------------ */
  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Request failed");
    }
    return data;
  };

  /* ------------------------[Login Form]------------------------ */
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
        const data = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: email, password }),
        });
        const user = await apiRequest("/api/auth/me", {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        setSession(user, data.access_token);
        showAlert(alertBox, "ok", "Signed in. Taking you through.");
        window.setTimeout(afterAuth, 400);
      } catch (err) {
        showAlert(alertBox, "err", err.message || "Login failed. Check your credentials.");
      }
    });
  }

  /* ------------------------[Register Form]------------------------ */
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
        const user = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            full_name: name,
            role: "agency_admin",
          }),
        });
        const loginData = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: email, password }),
        });
        setSession(user, loginData.access_token);
        localStorage.removeItem(ONBOARD_KEY);
        showAlert(alertBox, "ok", "Account created. Next: a short setup.");
        window.setTimeout(afterAuth, 450);
      } catch (err) {
        showAlert(alertBox, "err", err.message || "Registration failed.");
      }
    });
  }

  /* ------------------------[Social Buttons]------------------------ */
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

  /* ------------------------[Export]------------------------ */
  window.AriesAuth = {
    session,
    needsOnboarding,
    signOut() {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "login.html";
    },
  };
})();
