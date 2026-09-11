(function () {
  "use strict";

  const { api, getParam, formatNum, escapeHtml } = window.Aries;

  window.AriesDetail = {
    api,
    getParam,
    formatNum,
    escapeHtml,
    showEmpty: (id) => {
      const el = document.getElementById(id);
      if (el) {el.style.display = "";}
    },
    showContent: (id) => {
      const el = document.getElementById(id);
      if (el) {el.style.display = "";}
    },
  };
})();