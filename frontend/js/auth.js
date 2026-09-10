(function () {
  "use strict";

  /* ------------------------[Storage Keys]------------------------ */
  const USERS_KEY = "aries_users";
  const SESSION_KEY = "aries_session";
  const ONBOARD_KEY = "aries_onboarding";

  /* ------------------------[Helpers]------------------------ */
  const users = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const saveUsers = (list) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  };

  const session = () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  };

  const setSession = (user) => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        email: user.email,
        name: user.name,
        provider: user.provider || "email",
        at: Date.now()
      })
    );
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

  /* ------------------------[Social Auth]------------------------ */
  const upsertSocial = (provider, name) => {
    const email = `${provider}.user@aries.local`;
    const list = users();
    let found = list.find((u) => {
      return u.email === email;
    });
    if (!found) {
      found = {name, email, password: "", provider};
      list.push(found);
      saveUsers(list);
    }
    setSession(found);
    afterAuth();
  };

  /* ------------------------[Login Form]------------------------ */
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const alertBox = document.getElementById("authAlert");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (document.getElementById("email").value || "").trim().toLowerCase();
      const password = document.getElementById("password").value || "";
      const found = users().find((u) => {
        return u.email === email && u.password === password;
      });
      if (!found) {
        showAlert(
          alertBox,
          "err",
          "No matching account. Check the email and password, or create one."
        );
        return;
      }
      setSession(found);
      showAlert(alertBox, "ok", "Signed in. Taking you through.");
      window.setTimeout(afterAuth, 400);
    });
  }

  /* ------------------------[Register Form]------------------------ */
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
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
      const list = users();
      if (
        list.some((u) => {
          return u.email === email;
        })
      ) {
        showAlert(alertBox, "err", "That email already has an account. Sign in instead.");
        return;
      }
      const user = {name, email, password, provider: "email"};
      list.push(user);
      saveUsers(list);
      localStorage.removeItem(ONBOARD_KEY);
      setSession(user);
      showAlert(alertBox, "ok", "Account created. Next: a short setup.");
      window.setTimeout(afterAuth, 450);
    });
  }

  /* ------------------------[Social Buttons]------------------------ */
  document.querySelectorAll("[data-provider]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.getAttribute("data-provider");
      const label = provider === "google" ? "Google workspace user" : "Facebook workspace user";
      showAlert(
        alertBox,
        "ok",
        `Demo sign-in with ${provider}. Real Google/Facebook login needs app keys from those platforms.`
      );
      window.setTimeout(() => {
        upsertSocial(provider, label);
      }, 500);
    });
  });

  /* ------------------------[Export]------------------------ */
  window.AriesAuth = {
    session,
    needsOnboarding,
    signOut() {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "login.html";
    }
  };
})();
