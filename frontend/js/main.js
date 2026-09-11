(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector("header.site");
  if (nav) {
    const updateNav = () => nav.classList.toggle("scrolled", window.scrollY > 24);
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  const dropdowns = document.querySelectorAll(".nav-dropdown");
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".nav-dropdown-trigger");
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    if (!trigger || !menu) {return;}

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      dropdowns.forEach((d) => {
        d.classList.remove("open");
        d.querySelector(".nav-dropdown-trigger")?.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        dropdown.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    menu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        dropdown.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("click", () => {
    dropdowns.forEach((d) => {
      d.classList.remove("open");
      d.querySelector(".nav-dropdown-trigger")?.setAttribute("aria-expanded", "false");
    });
  });

  const motionImages = document.querySelectorAll(".hero img");
  const markReady = (img) => img.classList.add("is-ready");
  motionImages.forEach((img) => {
    if (img.complete && img.naturalWidth) {markReady(img);}
    else {
      img.addEventListener("load", () => markReady(img), { once: true });
      img.addEventListener("error", () => markReady(img), { once: true });
    }
  });

  if (!prefersReduced && motionImages.length) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) {return;}
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        motionImages.forEach((img) => {
          const rect = img.getBoundingClientRect();
          if (rect.bottom < -80 || rect.top > vh + 80) {return;}
          const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
          const shift = Math.max(-22, Math.min(22, progress * 36));
          img.style.setProperty("--parallax", `${shift.toFixed(2)}px`);
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  const bridge = document.getElementById("heroBridge");
  if (bridge) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      bridge.classList.add("visible");
    } else {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {return;}
            bridge.classList.add("visible");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.35 }
      );
      obs.observe(bridge);
    }
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {return;}
          const delay = parseInt(entry.target.getAttribute("data-delay") || "0", 10);
          setTimeout(() => entry.target.classList.add("visible"), delay);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
    );
    revealEls.forEach((el) => obs.observe(el));
  }

  const panel = document.getElementById("livePanel");
  if (!panel) {return;}

  const openBtn = document.getElementById("openChat");
  const closeBtn = document.getElementById("closeChat");
  const form = document.getElementById("liveForm");
  const input = document.getElementById("liveInput");
  const msgs = document.getElementById("liveMsgs");

  const conversation = [
    { keywords: ["campaign", "atlas", "content", "approval", "approved"], reply: "The Atlas campaign is currently marked as approved. If you need the approval history, open the campaign activity log." },
    { keywords: ["payout", "payment", "money", "revenue", "paid"], reply: "I can help you check that. Payout status and the related revenue events are available from the Revenue workspace." },
    { keywords: ["creator", "creator profile", "onboarding"], reply: "Creator onboarding is handled from the Creators workspace. You can see outstanding tasks, assigned owners, and the current onboarding status there." },
    { keywords: ["client", "brief", "feedback"], reply: "Client updates stay attached to the relevant workspace. The latest brief, feedback, and campaign activity can be reviewed from the client record." },
    { keywords: ["task", "tasks", "deadline", "due"], reply: "You can review outstanding tasks from the Tasks workspace. Each task includes its owner, status, due date, and related campaign." },
  ];

  const toggleChat = (open) => {
    panel.classList.toggle("open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    if (open && input) {setTimeout(() => input.focus(), 100);}
  };

  const addMessage = (text, type) => {
    if (!msgs) {return null;}
    const el = document.createElement("div");
    el.className = `bubble ${type}`;
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  };

  const addTypingIndicator = () => {
    if (!msgs) {return null;}
    const typing = document.createElement("div");
    typing.className = "bubble in typing";
    typing.setAttribute("aria-label", "Aries desk is typing");
    for (let i = 0; i < 3; i++) {typing.appendChild(document.createElement("span"));}
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    return typing;
  };

  const findReply = (text) => {
    const normalized = text.toLowerCase();
    for (const item of conversation) {
      if (item.keywords.some((k) => normalized.includes(k))) {return item.reply;}
    }
    return "Thanks. I've added that to the conversation. For account-specific changes, the relevant workspace record is the best place to continue.";
  };

  openBtn?.addEventListener("click", () => toggleChat(!panel.classList.contains("open")));
  closeBtn?.addEventListener("click", () => {
    toggleChat(false);
    openBtn?.focus();
  });

  if (form && input && msgs) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) {return;}
      addMessage(text, "out");
      input.value = "";
      input.focus();
      const typing = addTypingIndicator();
      const reply = findReply(text);
      setTimeout(() => {
        typing?.remove();
        addMessage(reply, "in");
      }, prefersReduced ? 0 : 700);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      toggleChat(false);
      openBtn?.focus();
    }
  });
})();