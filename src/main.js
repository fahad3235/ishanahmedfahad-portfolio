import "./webgl/portfolio-engine.js";

function initLuffyHudControls() {
  const jumpButtons = [...document.querySelectorAll("[data-luffy-jump]")];
  const nikaBtn = document.getElementById("luffy-nika-btn");
  const ftTopBtn = document.getElementById("ft-top");
  const scrollEl = document.getElementById("scroll");

  const getMaxScroll = () =>
    Math.max(1, (scrollEl ? scrollEl.offsetHeight : document.body.scrollHeight) - window.innerHeight);

  // 1. Quick-Jump buttons to Luffy chapters (Origin, Memory, Egg Awakening, Spline Flight)
  jumpButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
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

  // Update active state on scroll
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
  };
  window.addEventListener("scroll", syncActivePill, { passive: true });
  syncActivePill();

  // 2. Gear 5 Nika Mode Toggle (switches between Gear 5 Sun God Nika and Classic Red-Vest Straw Hat Luffy)
  let nikaOn = true;
  if (nikaBtn) {
    nikaBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      nikaOn = !nikaOn;
      nikaBtn.setAttribute("aria-pressed", String(nikaOn));
      nikaBtn.classList.toggle("nika-active", nikaOn);
      nikaBtn.textContent = nikaOn ? "Gear 5 Nika: ON" : "Straw Hat Base";

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 4. Skills Arsenal Drawer Modal
  const skillsBtn = document.getElementById("skills-btn");
  const skillsModal = document.getElementById("skills-modal");
  if (skillsBtn && skillsModal) {
    const openSkills = (e) => {
      if (e) e.stopPropagation();
      skillsModal.classList.add("open");
      skillsModal.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("modal-open");
      window.dispatchEvent(new CustomEvent("sfx", { detail: "open" }));
    };
    const closeSkills = (e) => {
      if (e) e.stopPropagation();
      skillsModal.classList.remove("open");
      skillsModal.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("modal-open");
      window.dispatchEvent(new CustomEvent("sfx", { detail: "close" }));
    };

    skillsBtn.addEventListener("click", openSkills);

    skillsModal.addEventListener("click", (e) => {
      if (e.target.closest("[data-close-skills]")) {
        closeSkills(e);
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && skillsModal.classList.contains("open")) {
        closeSkills(e);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLuffyHudControls);
} else {
  initLuffyHudControls();
}
