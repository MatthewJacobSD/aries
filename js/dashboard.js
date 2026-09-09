(function () {
  "use strict";

  /* ------------------------[Pane Switching]------------------------ */
  const buttons = document.querySelectorAll(".dash-nav button[data-pane]");
  const panes = document.querySelectorAll(".pane");
  const title = document.getElementById("deskTitle");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-pane");
      buttons.forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
      panes.forEach((p) => {
        p.classList.toggle("on", p.id === `pane-${id}`);
      });
      if (title) {
        title.textContent = `Workspace · North Atelier · ${btn.textContent.trim()}`;
      }
      history.pushState(null, "", `#${id}`);
    });
  });

  /* ------------------------[Hash Deep-Linking]------------------------ */
  const openPane = (id) => {
    if (id === "integrations") {
      id = "hooks"
    };
    const match = document.querySelector(`.dash-nav button[data-pane="${id}"]`);
    if (match) {
      match.click();
    }
  };

  if (location.hash) {
    openPane(location.hash.replace("#", ""));
  }

  window.addEventListener("hashchange", () => {
    openPane(location.hash.replace("#", ""));
  });

  /* ------------------------[Chat]------------------------ */
  const form = document.getElementById("deskForm");
  const input = document.getElementById("deskInput");
  const msgs = document.getElementById("deskMsgs");
  if (form && input && msgs) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {
        return;
      }
      const out = document.createElement("div");
      out.className = "bubble out";
      out.textContent = text;
      msgs.appendChild(out);
      input.value = "";
      msgs.scrollTop = msgs.scrollHeight;
      window.setTimeout(() => {
        const inn = document.createElement("div");
        inn.className = "bubble in";
        inn.textContent = "Noted on the file. Finance can see this next to the period ledger.";
        msgs.appendChild(inn);
        msgs.scrollTop = msgs.scrollHeight;
      }, 600);
    });
  }
})();
