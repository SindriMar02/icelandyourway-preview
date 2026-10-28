/* Non-visual semantics and an alternate reduced-motion branch. Source archive stays untouched. */
(() => {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const splitInstances = [],
    initialStyles = new Map();
  window.vitaMotionPreference = { reduced: preference.matches };
  window.prepareVitaAccessibility = () => {
    const originalTo = window.gsap?.to;
    if (originalTo)
      window.gsap.to = function (target, vars, ...rest) {
        return originalTo.call(
          this,
          target,
          preference.matches && vars?.scrollTo
            ? { ...vars, duration: 0, delay: 0 }
            : vars,
          ...rest,
        );
      };
    if (preference.matches) {
      window.jQuery.fx.off = true;
      if (window.ScrollToPlugin) window.gsap.registerPlugin(window.ScrollToPlugin);
    }
    document
      .querySelectorAll(
        "[style],[data-anim],[data-animation],.header,.page-wrapper,.main-wrapper,.coaches-person__visual,.coaches-person__head,.coaches-person-info__head,.retreat-page-info,.retreat-page-intro__photos,.footer,.footer *,.destination__dots,.map-pin,.map-pin > g,.map-pin > circle,.featured__items,[role=tabpanel],.inclusion-panel",
      )
      .forEach((el) => initialStyles.set(el, el.getAttribute("style")));
    if (window.SplitText) {
      const Original = window.SplitText;
      window.SplitText = new Proxy(Original, {
        construct(target, args, newTarget) {
          const instance = Reflect.construct(target, args, newTarget);
          splitInstances.push(instance);
          return instance;
        },
      });
    }
  };
  function reduceLiveMotion() {
    window.vitaMotionPreference.reduced = true;
    window.jQuery.fx.off = true;
    window.ScrollTrigger?.getAll().forEach((t) => t.kill(true));
    window.ScrollSmoother?.get()?.kill();
    window.gsap?.globalTimeline
      .getChildren(true, true, true)
      .forEach((t) => t.kill());
    for (const instance of splitInstances.slice().reverse())
      try {
        instance.revert();
      } catch {}
    for (const [el, style] of initialStyles) {
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    }
    document.querySelectorAll("[data-anim],[data-animation]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
    });
    const cookie = document.querySelector(".cookie.is-active");
    document.body.style.paddingBottom = cookie
      ? cookie.offsetHeight + "px"
      : "";
    document
      .querySelectorAll(".slick-initialized")
      .forEach((el) => window.jQuery(el).slick("slickSetOption", "speed", 0));
  }
  preference.addEventListener("change", (event) => {
    if (event.matches) reduceLiveMotion();
  });
  document.addEventListener("DOMContentLoaded", () =>
    window.jQuery(() => {
      const root = document.documentElement;
      root.lang ||= "en";
      document
        .querySelectorAll(
          ".form:not(.is-hidden) input,.form:not(.is-hidden) textarea",
        )
        .forEach((input, i) => {
          input.id = "vita-field-" + i;
          const group = input.closest(".inp-group");
          const label = group?.querySelector("label");
          if (label) label.htmlFor = input.id;
          if (input.name === "name") input.autocomplete = "name";
          if (input.type === "email") {
            input.autocomplete = "email";
            input.spellcheck = false;
          }
        });
      const burger = document.querySelector(".btn-burger"),
        panel = document.querySelector(".mobile-menu");
      if (burger && panel) {
        panel.id = "vita-mobile-menu";
        panel.tabIndex = -1;
        burger.setAttribute("aria-label", root.lang === "is" ? "Menu" : "Menu");
        burger.setAttribute("role", "button");
        burger.setAttribute("aria-controls", panel.id);
        const update = () => {
          const open = panel.classList.contains("is-active");
          burger.setAttribute("aria-expanded", String(open));
          panel.setAttribute("aria-hidden", String(!open));
          panel.inert = !open;
        };
        update();
        new MutationObserver(update).observe(panel, {
          attributes: true,
          attributeFilter: ["class"],
        });
        burger.addEventListener("click", (e) => {
          update();
          if (panel.classList.contains("is-active")) {
            const focus = e.detail === 0 ? panel.querySelector("a") : panel;
            focus?.focus({ preventScroll: true });
          }
        });
        burger.addEventListener("keydown", (e) => {
          if (e.key === " ") {
            e.preventDefault();
            burger.click();
          }
        });
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && panel.classList.contains("is-active")) {
            burger.click();
            burger.focus({ preventScroll: true });
          }
        });
        document.addEventListener("keydown", (e) => {
          if (e.key !== "Tab" || !panel.classList.contains("is-active")) return;
          const items = [
            burger,
            ...panel.querySelectorAll(
              'a[href],button,input,select,textarea,[tabindex="0"]',
            ),
          ].filter((el) => el.getClientRects().length);
          const at = items.indexOf(document.activeElement);
          if (e.shiftKey && at <= 0) {
            e.preventDefault();
            items.at(-1)?.focus();
          } else if (!e.shiftKey && (at === items.length - 1 || at === -1)) {
            e.preventDefault();
            items[0]?.focus();
          }
        });
      }
      document.querySelectorAll(".cookie__close").forEach((wrapper) => {
        const el = wrapper.querySelector("a,button") || wrapper;
        el.setAttribute("aria-label", "Close notice");
        el.setAttribute("role", "button");
        el.tabIndex = 0;
        el.addEventListener("keydown", (e) => {
          if (e.key === " ") {
            e.preventDefault();
            el.click();
          }
        });
      });
      document.querySelectorAll(".cookie").forEach((el) => {
        const update = () => (el.inert = !el.classList.contains("is-active"));
        update();
        new MutationObserver(update).observe(el, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });
      document.querySelectorAll(".coaches-person").forEach((el, i) => {
        el.tabIndex = 0;
        el.setAttribute(
          "aria-label",
          (
            el.querySelector(".coaches-person__head")?.textContent || "Programme"
          ).trim(),
        );
        const panel = el.querySelector(".coaches-person-info");
        if (panel) {
          panel.id = "vita-coach-" + i;
          el.setAttribute("aria-controls", panel.id);
        }
      });
      const header = document.querySelector(".header");
      if (preference.matches) {
        window.jQuery(".slick-initialized").slick("slickSetOption", "speed", 0);
        const update = () =>
          header?.classList.toggle("is-active", scrollY > 20);
        addEventListener("scroll", update, { passive: true });
        update();
      }
    }),
  );
})();
