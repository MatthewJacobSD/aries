(function () {
  "use strict";

  const { api, checkSession, showToast, ONBOARD_KEY } = window.Aries;

  async function init() {
    const existingUser = await checkSession();
    if (existingUser) {
      const onboarded = localStorage.getItem(ONBOARD_KEY) === "complete";
      window.location.href = onboarded ? "dashboard.html" : "onboarding.html";
    }
  }

  init();

  /* Login */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (document.getElementById("email").value || "").trim().toLowerCase();
      const password = document.getElementById("password").value || "";

      try {
        showToast("ok", "Signing in", "Checking your credentials…");
        await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: email, password }),
        });
        showToast("ok", "Signed in", "Taking you through…");
        setTimeout(() => {
          const onboarded = localStorage.getItem(ONBOARD_KEY) === "complete";
          window.location.href = onboarded ? "dashboard.html" : "onboarding.html";
        }, 700);
      } catch (err) {
        showToast("err", "Sign-in failed", err.message || "Check your email and password.");
      }
    });
  }

  /* Register */
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = (document.getElementById("name").value || "").trim();
      const email = (document.getElementById("email").value || "").trim().toLowerCase();
      const password = document.getElementById("password").value || "";
      const confirm = document.getElementById("confirm").value || "";

      if (password.length < 8) {
        showToast("err", "Password too short", "Use at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        showToast("err", "Passwords do not match", "Please check both password fields.");
        return;
      }

      try {
        showToast("ok", "Creating account", "Setting everything up…");
        await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, full_name: name }),
        });
        await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: email, password }),
        });
        localStorage.removeItem(ONBOARD_KEY);
        showToast("ok", "Account created", "Next: a short setup…");
        setTimeout(() => {
          window.location.href = "onboarding.html";
        }, 800);
      } catch (err) {
        showToast("err", "Registration failed", err.message || "Something went wrong.");
      }
    });
  }

  /* Social buttons */
  document.querySelectorAll("[data-provider]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.getAttribute("data-provider");
      showToast("err", "Not configured", `Social login with ${provider} requires backend OAuth configuration.`);
    });
  });
})();