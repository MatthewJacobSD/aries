(function () {
  "use strict";

  const { checkSession, signOut } = window.Aries;

  document.querySelectorAll("[data-sign-out]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      signOut();
    });
  });

  async function initNav() {
    const slot = document.getElementById("authSlot");
    if (!slot) {return;}

    const user = await checkSession();
    if (user) {
      const roleLabel = user.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "";
      slot.innerHTML = `
        ${roleLabel ? `<span class="role-badge">${roleLabel}</span>` : ""}
        <a href="settings.html">${user.full_name || user.email}</a>
        <a href="#" data-sign-out>Sign out</a>
      `;
      slot.querySelector("[data-sign-out]")?.addEventListener("click", (e) => {
        e.preventDefault();
        signOut();
      });
    } else {
      slot.innerHTML = `<a href="login.html">Sign in</a>`;
    }
  }

  initNav();
  window.AriesSession = { checkSession, signOut };
})();