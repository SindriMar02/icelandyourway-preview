/* Match CDN font timing before SplitText measures. Deliver the app's load handler
 * if local font readiness delayed its registration beyond window.load. */
(() => {
  const originalOn = jQuery.fn.on;
  jQuery.fn.on = function (event, ...args) {
    const result = originalOn.call(this, event, ...args);
    if (this[0] === window && event === 'load' && document.readyState === 'complete') {
      const handler = args.findLast(arg => typeof arg === 'function');
      if (handler) queueMicrotask(() => handler.call(window, jQuery.Event('load')));
    }
    return result;
  };
  jQuery.holdReady(true);
  document.fonts.ready.then(() => jQuery.holdReady(false));
})();
