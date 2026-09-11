(function () {
  "use strict";

  const API_URL = "http://localhost:8000";
  const TOKEN_KEY = "aries_token";

  window.AriesDetail = {
    api: async (endpoint, opts = {}) => {
      const token = localStorage.getItem(TOKEN_KEY);
      const headers = { "Content-Type": "application/json", ...opts.headers };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_URL}${endpoint}`, { ...opts, headers });
      if (res.status === 401) {
        window.location.href = "login.html";
        return null;
      }
      if (!res.ok) {
        return null;
      }
      return res.json();
    },

    getParam: (name) => {
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    },

    formatNum: (n) => {
      if (n === undefined || n === null) {
        return "0";
      }
      return Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
    },

    escapeHtml: (str) => {
      if (!str) {
        return "";
      }
      const div = document.createElement("div");
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    },

    showEmpty: (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = "";
      }
    },

    showContent: (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = "";
      }
    },
  };
})();
