/* Local preview adapter. No enquiry is delivered to Vita or any third party. */
(() => {
  // Static reply next to this script, so the demo form works on any static host (GitHub Pages included).
  const reply = new URL('preview-form.json', document.currentScript.src).href;
  const isForm = url => /https:\/\/(?:webflow\.com|forms\.webflow\.com)\/api\/v1\/form\/|\/__preview\/form(?:[?#]|$)/.test(String(url));
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    return isForm(url) ? open.call(this, 'GET', reply, ...args) : open.call(this, method, url, ...args);
  };
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = input instanceof Request ? input.url : input;
    if (isForm(url)) return originalFetch.call(this, reply);
    return originalFetch.call(this, input, init);
  };
  document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.contact-us__content.is-sended').forEach(el => {
        const form = el.querySelector('.form'); if (form) form.inert = true;
        if (el.querySelector('[data-preview-notice]')) return;
        const note = document.createElement('p');
        note.dataset.previewNotice = ''; note.setAttribute('role','status');
        note.textContent = 'Local demo only. Nothing was sent or stored.';
        note.style.cssText = 'position:absolute;bottom:1rem;left:1rem;right:1rem;font:14px/1.5 sans-serif;color:white;z-index:20';
        el.appendChild(note);
      });
    });
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  });
})();
