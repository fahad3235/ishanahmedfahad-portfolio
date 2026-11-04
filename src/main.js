import "./webgl/portfolio-engine.js";

function initLuffyHudControls() {
  const jumpButtons = [...document.querySelectorAll("[data-luffy-jump]")];
  const nikaBtn = document.getElementById("luffy-nika-btn");
  const ftTopBtn = document.getElementById("ft-top");
  const scrollEl = document.getElementById("scroll");

  const getMaxScroll = () =>
    Math.max(1, (scrollEl ? scrollEl.offsetHeight : document.body.scrollHeight) - window.innerHeight);

  const triggerHaptic = (ms = 12) => {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (_) {}
  };

  // 1. Quick-Jump buttons to Luffy chapters (Origin, Memory, Egg Awakening, Spline Flight)
  jumpButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerHaptic(15);
      const targetRatio = parseFloat(btn.dataset.luffyJump || "0");
      const loader = document.getElementById("loader");
      if (loader && !loader.classList.contains("done")) {
        loader.classList.add("done");
        document.documentElement.classList.remove("gate");
      }
      window.scrollTo({
        top: targetRatio * getMaxScroll(),
        behavior: "smooth",
      });
    });
  });

  // Update active state on scroll & auto-center in mobile scrubber dock
  let lastActiveBtn = null;
  const syncActivePill = () => {
    const ratio = window.scrollY / getMaxScroll();
    let bestBtn = jumpButtons[0];
    let bestDist = Infinity;
    for (const btn of jumpButtons) {
      const r = parseFloat(btn.dataset.luffyJump || "0");
      const d = Math.abs(ratio - r);
      if (d < bestDist) {
        bestDist = d;
        bestBtn = btn;
      }
    }
    jumpButtons.forEach((btn) => btn.classList.toggle("active", btn === bestBtn));

    if (bestBtn !== lastActiveBtn) {
      lastActiveBtn = bestBtn;
      if (bestBtn && bestBtn.scrollIntoView && window.innerWidth <= 768) {
        bestBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };
  window.addEventListener("scroll", syncActivePill, { passive: true });
  syncActivePill();

  // 2. Gear 5 Nika Mode Toggle (switches between Gear 5 Sun God Nika and Classic Red-Vest Straw Hat Luffy)
  let nikaOn = true;
  if (nikaBtn) {
    nikaBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nikaOn = !nikaOn;
      triggerHaptic(25);
      nikaBtn.setAttribute("aria-pressed", String(nikaOn));
      nikaBtn.classList.toggle("nika-active", nikaOn);
      const labelFull = document.getElementById("nika-label-full");
      const labelMob = document.getElementById("nika-label-mob");
      if (labelFull && labelMob) {
        labelFull.textContent = nikaOn ? "Gear 5 Nika: ON" : "Straw Hat Base";
        labelMob.textContent = nikaOn ? "⚡ Nika" : "👒 Base";
      } else {
        nikaBtn.textContent = nikaOn ? "Gear 5 Nika: ON" : "Straw Hat Base";
      }

      const three = window.__three;
      if (three && three.hero && three.hero.figure && three.hero.figure.uniforms.uNika) {
        three.hero.figure.uniforms.uNika.value = nikaOn ? 1.0 : 0.0;
      }
      if (three && three.scene) {
        three.scene.traverse((obj) => {
          const u = obj.material && obj.material.userData && obj.material.userData.uniforms;
          if (u && u.uNika) {
            u.uNika.value = nikaOn ? 1.0 : 0.0;
          }
        });
      }
      window.dispatchEvent(
        new CustomEvent("sfx", { detail: { name: nikaOn ? "release" : "card" } })
      );
    });
  }

  // 3. Footer Back to Origin button
  if (ftTopBtn) {
    ftTopBtn.addEventListener("click", () => {
      triggerHaptic(10);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 4. Skills Arsenal Drawer Modal
  const skillsBtn = document.getElementById("skills-btn");
  const skillsModal = document.getElementById("skills-modal");
  if (skillsBtn && skillsModal) {
    const openSkills = (e) => {
      if (e) e.stopPropagation();
      triggerHaptic(15);
      skillsModal.classList.add("open");
      skillsModal.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("modal-open");
      window.dispatchEvent(new CustomEvent("sfx", { detail: "open" }));
    };
    const closeSkills = (e) => {
      if (e) e.stopPropagation();
      triggerHaptic(10);
      skillsModal.classList.remove("open");
      skillsModal.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("modal-open");
      window.dispatchEvent(new CustomEvent("sfx", { detail: "close" }));
    };

    skillsBtn.addEventListener("click", openSkills);

    skillsModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close-skills]") || e.target === skillsModal) {
        closeSkills(e);
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && skillsModal.classList.contains("open")) {
        closeSkills(e);
      }
    });
  }

  // 5. Mobile Index Drawer Dismiss
  const indexNav = document.getElementById("index");
  if (indexNav) {
    indexNav.addEventListener("click", (e) => {
      if (e.target === indexNav || e.target.closest("[data-close-index]")) {
        triggerHaptic(10);
        indexNav.classList.remove("open");
        indexNav.setAttribute("aria-hidden", "true");
        const indexBtn = document.getElementById("index-btn");
        if (indexBtn) indexBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 6. Mobile Safe Work Modal Backdrop & Close Dismiss
  const workModal = document.getElementById("work-modal");
  if (workModal) {
    workModal.addEventListener("click", (e) => {
      if (e.target === workModal || e.target.classList.contains("wm-backdrop") || e.target.closest("[data-close]")) {
        triggerHaptic(10);
        workModal.classList.remove("open");
        workModal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("modal-open");
        window.dispatchEvent(new CustomEvent("sfx", { detail: "close" }));
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLuffyHudControls);
} else {
  initLuffyHudControls();
}
