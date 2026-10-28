/* Re-measure scroll ranges when lazy images change the document's height.
 * Keep the recovered choreography intact; refresh safely after scrolling settles. */
(() => {
  let initialized = false;
  let timer;
  function scheduleRefresh() {
    if (!initialized) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.vitaMotionPreference?.reduced) return;
      if (window.ScrollTrigger?.getAll().length) {
        window.ScrollTrigger.refresh(true);
      }
    }, 100);
  }
  document.addEventListener("load", event => {
    if (event.target instanceof HTMLImageElement) scheduleRefresh();
  }, true);
  window.addEventListener("pageshow", scheduleRefresh);
  window.jQuery(() => {
    initialized = true;
    scheduleRefresh();
  });
})();
