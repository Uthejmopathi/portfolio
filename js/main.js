(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year + clock
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const clock = document.getElementById("clock");
  const tickClock = () => {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
  };
  tickClock();
  setInterval(tickClock, 1000);

  // Boot sequence
  const boot = document.getElementById("boot");
  const bootLog = document.getElementById("boot-log");
  const bootFill = document.getElementById("boot-fill");
  const body = document.body;

  const bootLines = [
    "> uplink established",
    "> loading operator profile …… ok",
    "> mounting mission files …… ok",
    "> decrypting intel feed …… ok",
    "> hud calibration …… complete",
    "> systems online",
  ];

  const finishBoot = () => {
    if (!boot) {
      body.classList.add("is-ready");
      return;
    }
    boot.classList.add("is-done");
    body.classList.remove("is-booting");
    boot.setAttribute("aria-hidden", "true");
    requestAnimationFrame(() => body.classList.add("is-ready"));
  };

  if (boot && !reduced) {
    body.classList.add("is-booting");
    let i = 0;
    const step = () => {
      if (i < bootLines.length) {
        bootLog.textContent += `${bootLines[i]}\n`;
        bootFill.style.width = `${((i + 1) / bootLines.length) * 100}%`;
        i += 1;
        setTimeout(step, 220);
      } else {
        setTimeout(finishBoot, 350);
      }
    };
    setTimeout(step, 180);
  } else {
    finishBoot();
  }

  // Space canvas — constellation + drifting particles (not matrix rain)
  const canvas = document.getElementById("space");
  if (canvas && canvas.getContext && !reduced) {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let particles = [];
    let raf = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      spawn();
    };

    const spawn = () => {
      const count = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    };

    const drawGrid = (t) => {
      const gap = 64;
      const offset = (t * 0.02) % gap;
      ctx.save();
      ctx.strokeStyle = "rgba(53, 240, 217, 0.045)";
      ctx.lineWidth = 1;
      for (let x = -gap + offset; x < window.innerWidth + gap; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, window.innerHeight);
        ctx.stroke();
      }
      for (let y = -gap + offset * 0.6; y < window.innerHeight + gap; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(window.innerWidth, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const frame = (time) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawGrid(time);

      // links
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(53, 240, 217, ${((1 - dist / 120) * 0.18).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;
        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.y > window.innerHeight + 20) p.y = -20;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, "rgba(180, 255, 247, 0.95)");
        g.addColorStop(1, "rgba(53, 240, 217, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // scanning beam
      const beamY = ((time * 0.04) % (window.innerHeight + 160)) - 80;
      const beam = ctx.createLinearGradient(0, beamY - 40, 0, beamY + 40);
      beam.addColorStop(0, "rgba(53, 240, 217, 0)");
      beam.addColorStop(0.5, "rgba(53, 240, 217, 0.05)");
      beam.addColorStop(1, "rgba(53, 240, 217, 0)");
      ctx.fillStyle = beam;
      ctx.fillRect(0, beamY - 40, window.innerWidth, 80);

      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(frame);
    });
  }

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    const close = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  // UTHEJ.SYS → full reload
  const sysReload = document.getElementById("sys-reload");
  if (sysReload) {
    sysReload.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.reload();
    });
  }

  // Return to uplink → hard scroll to top
  const uplinkTop = document.getElementById("uplink-top");
  if (uplinkTop) {
    uplinkTop.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      history.replaceState(null, "", "#top");
    });
  }

  // Metrics count-up + scroll reveals
  const animateCount = (el) => {
    if (el.dataset.counted === "1") return;
    el.dataset.counted = "1";
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealEls = document.querySelectorAll("[data-animate]");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          entry.target.querySelectorAll("[data-count]").forEach(animateCount);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => {
      el.classList.add("is-in");
      el.querySelectorAll("[data-count]").forEach(animateCount);
    });
  }

  // Active nav spy
  const spySections = ["impact", "work", "writing", "experience", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));

  const setActiveNav = () => {
    const y = window.scrollY + 120;
    let current = null;
    spySections.forEach((section) => {
      if (section.offsetTop <= y) current = section.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", current !== null && href === `#${current}`);
    });
  };
  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  // Dossier tilt
  if (!reduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".dossier").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Article filters with animation
  const filters = document.querySelectorAll(".filter");
  const articles = document.querySelectorAll(".article");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.filter || "all";
      filters.forEach((f) => {
        const on = f === btn;
        f.classList.toggle("is-active", on);
        f.setAttribute("aria-selected", String(on));
      });
      articles.forEach((article) => {
        const match = value === "all" || article.dataset.source === value;
        if (!match) {
          if (article.classList.contains("is-hidden")) return;
          if (reduced) {
            article.classList.add("is-hidden");
            return;
          }
          article.classList.remove("is-filtering-in");
          article.classList.add("is-filtering-out");
          window.setTimeout(() => {
            article.classList.add("is-hidden");
            article.classList.remove("is-filtering-out");
          }, 250);
        } else {
          article.classList.remove("is-hidden", "is-filtering-out");
          if (!reduced) {
            article.classList.add("is-filtering-in");
            window.setTimeout(() => article.classList.remove("is-filtering-in"), 350);
          }
        }
      });
    });
  });

  // Interactive live terminal
  const terminalPanel = document.getElementById("terminal-panel");
  const terminalLog = document.getElementById("terminal-log");
  const terminalForm = document.getElementById("terminal-form");
  const terminalInput = document.getElementById("terminal-input");

  if (terminalPanel && terminalLog && terminalForm && terminalInput) {
    const history = [];
    let historyIndex = -1;

    const routes = {
      home: "#top",
      top: "#top",
      impact: "#impact",
      metrics: "#impact",
      about: "#about",
      work: "#work",
      projects: "#work",
      missions: "#work",
      clixor: "#work",
      vyra: "#work",
      writing: "#writing",
      intel: "#writing",
      articles: "#writing",
      experience: "#experience",
      ops: "#experience",
      contact: "#contact",
      link: "#contact",
    };

    const external = {
      github: "https://github.com/Uthejmopathi",
      linkedin: "https://www.linkedin.com/in/uthejm/",
      hackernoon: "https://hackernoon.com/u/uthejdeveloper",
      dzone: "https://dzone.com/users/5498482/mopathiuthej.html",
      medium: "https://medium.com/@mopathiuthej0711",
      email: "mailto:mopathiuthej4@gmail.com",
      mail: "mailto:mopathiuthej4@gmail.com",
    };

    const navFlash = document.getElementById("nav-flash");

    const appendLine = (html, className = "") => {
      const p = document.createElement("p");
      if (className) p.className = className;
      p.innerHTML = html;
      terminalLog.appendChild(p);
      terminalLog.scrollTop = terminalLog.scrollHeight;
    };

    const appendCommand = (cmd) => {
      appendLine(`<span class="prompt">$</span> <span class="cmd"></span>`);
      terminalLog.lastElementChild.querySelector(".cmd").textContent = cmd;
      terminalPanel.classList.remove("is-executing");
      void terminalPanel.offsetWidth;
      terminalPanel.classList.add("is-executing");
    };

    const pulseSection = (el) => {
      if (!el || reduced) return;
      el.classList.remove("is-target");
      void el.offsetWidth;
      el.classList.add("is-target");
      window.setTimeout(() => el.classList.remove("is-target"), 900);
    };

    const flashNav = () => {
      if (!navFlash || reduced) return;
      navFlash.classList.remove("is-on");
      void navFlash.offsetWidth;
      navFlash.classList.add("is-on");
      window.setTimeout(() => navFlash.classList.remove("is-on"), 550);
    };

    const goTo = (hash) => {
      const el = document.querySelector(hash);
      if (!el) return false;
      flashNav();
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", hash);
      window.setTimeout(() => pulseSection(el), reduced ? 0 : 380);
      return true;
    };

    const openResume = () => {
      const link = document.createElement("a");
      link.href = "UthejMopathiResume.pdf";
      link.download = "UthejMopathiResume.pdf";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    const helpText = [
      "available commands:",
      "  help                 show this menu",
      "  whoami / status      operator profile",
      "  clear                clear terminal",
      "  work | projects      → selected work",
      "  resume               download resume PDF",
      "  impact | about       → sections",
      "  writing | intel      → articles",
      "  experience | ops     → timeline",
      "  contact | email      → open channel",
      "  github | linkedin    open profiles",
      "  medium | hackernoon | dzone",
      "  ls                   list sections",
      "  clixor | vyra        → work (sealed)",
    ];

    const runCommand = (raw) => {
      const input = raw.trim();
      if (!input) return;

      appendCommand(input);
      history.unshift(input);
      if (history.length > 40) history.pop();
      historyIndex = -1;

      const parts = input.toLowerCase().split(/\s+/);
      const cmd = parts[0].replace(/^\/+/, "");
      const arg = parts.slice(1).join(" ");

      if (cmd === "help" || cmd === "?" || cmd === "man") {
        helpText.forEach((line) => appendLine(line, "out"));
        return;
      }

      if (cmd === "clear" || cmd === "cls") {
        terminalLog.innerHTML = "";
        appendLine(`&gt; buffer cleared · type <span class="hl">help</span>`, "out");
        return;
      }

      if (cmd === "whoami") {
        appendLine("&gt; uthej_mopathi — senior_ios_engineer / ai_systems", "out");
        return;
      }

      if (cmd === "status") {
        appendLine('&gt; <span class="ok">ONLINE</span> · austin.tx · portfolio systems nominal', "out");
        return;
      }

      if (cmd === "ls" || cmd === "sections") {
        appendLine("&gt; impact  about  work  writing  experience  contact  resume", "out");
        return;
      }

      if (cmd === "pwd") {
        appendLine("&gt; /uthej/portfolio", "out");
        return;
      }

      if (cmd === "date") {
        appendLine(`&gt; ${new Date().toString()}`, "out");
        return;
      }

      if (cmd === "echo") {
        appendLine(`&gt; ${arg || ""}`, "out");
        return;
      }

      if (cmd === "resume" || cmd === "cv") {
        appendLine("&gt; opening resume download…", "out");
        openResume();
        return;
      }

      if (routes[cmd]) {
        const ok = goTo(routes[cmd]);
        appendLine(ok ? `&gt; navigating → ${routes[cmd].slice(1)}` : "&gt; route not found", ok ? "out" : "out err");
        return;
      }

      if (cmd === "cd") {
        const target = (arg || "home").replace(/^\/+/, "").toLowerCase();
        if (target === "~" || target === "/" || target === "home") {
          goTo("#top");
          appendLine("&gt; navigating → home", "out");
          return;
        }
        if (routes[target]) {
          goTo(routes[target]);
          appendLine(`&gt; navigating → ${target}`, "out");
          return;
        }
        appendLine(`&gt; no such section: ${target}`, "out err");
        return;
      }

      if (cmd === "open" || cmd === "goto" || cmd === "go") {
        const target = (arg || "").toLowerCase();
        if (target === "resume" || target === "cv") {
          appendLine("&gt; opening resume download…", "out");
          openResume();
          return;
        }
        if (routes[target]) {
          goTo(routes[target]);
          appendLine(`&gt; navigating → ${target}`, "out");
          return;
        }
        if (external[target]) {
          appendLine(`&gt; opening ${target}…`, "out");
          window.open(external[target], "_blank", "noopener,noreferrer");
          return;
        }
        appendLine("&gt; usage: open work | open resume | open github", "out err");
        return;
      }

      if (external[cmd]) {
        appendLine(`&gt; opening ${cmd}…`, "out");
        window.open(external[cmd], "_blank", "noopener,noreferrer");
        return;
      }

      appendLine(`&gt; command not found: ${cmd} · type <span class="hl">help</span>`, "out err");
    };

    terminalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = terminalInput.value;
      terminalInput.value = "";
      runCommand(value);
    });

    terminalInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!history.length) return;
        historyIndex = Math.min(history.length - 1, historyIndex + 1);
        terminalInput.value = history[historyIndex] || "";
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (historyIndex <= 0) {
          historyIndex = -1;
          terminalInput.value = "";
          return;
        }
        historyIndex -= 1;
        terminalInput.value = history[historyIndex] || "";
      } else if (event.key === "Tab") {
        event.preventDefault();
        const partial = terminalInput.value.trim().toLowerCase();
        if (!partial) return;
        const suggestions = [
          "help", "clear", "whoami", "status", "ls", "resume", "work", "projects",
          "impact", "about", "writing", "intel", "experience", "ops", "contact",
          "github", "linkedin", "medium", "hackernoon", "dzone", "email", "open", "cd",
        ].filter((item) => item.startsWith(partial));
        if (suggestions.length === 1) terminalInput.value = suggestions[0];
        else if (suggestions.length > 1) {
          appendCommand(partial);
          appendLine(`&gt; ${suggestions.join("  ")}`, "out");
        }
      }
    });

    // Soft parallax on hero content
    if (!reduced && window.matchMedia("(pointer: fine)").matches) {
      const hero = document.querySelector(".hero");
      const heroBits = document.querySelectorAll("[data-hero-anim]");
      if (hero && heroBits.length) {
        hero.addEventListener("pointermove", (event) => {
          const rect = hero.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          heroBits.forEach((bit, index) => {
            const depth = index === 0 ? 10 : -8;
            bit.style.translate = `${x * depth}px ${y * depth}px`;
          });
        });
        hero.addEventListener("pointerleave", () => {
          heroBits.forEach((bit) => {
            bit.style.translate = "0px 0px";
          });
        });
      }
    }

    // Click / focus anywhere on terminal focuses input
    terminalPanel.addEventListener("click", () => terminalInput.focus());

    // After boot, lightly hint interactivity
    const focusTerminal = () => {
      // Don't steal focus on mobile keyboards automatically
      if (window.matchMedia("(pointer: fine)").matches) {
        setTimeout(() => terminalInput.focus(), 80);
      }
    };

    if (boot && !reduced) {
      const bootObserver = new MutationObserver(() => {
        if (boot.classList.contains("is-done")) {
          bootObserver.disconnect();
          focusTerminal();
        }
      });
      bootObserver.observe(boot, { attributes: true, attributeFilter: ["class"] });
    } else {
      focusTerminal();
    }
  }
})();
