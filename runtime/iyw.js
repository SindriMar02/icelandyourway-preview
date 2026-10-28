/* Functional additions are outside the decorative-motion early return. */
addEventListener('DOMContentLoaded', () => {
 if (document.documentElement.dataset.brand !== 'iyw') return;
 window.jQuery(() => {
  document.querySelectorAll('.inclusion-toggle').forEach(button => {
   const panel = document.getElementById(button.getAttribute('aria-controls'));
   if (!panel) return;
   button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('span').textContent = open ? '−' : '+';
    panel.inert = !open;
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .3;
    window.gsap.to(panel, {height:open ? panel.scrollHeight : 0, duration, ease:'power2.out', overwrite:true,
     onComplete:() => {if(open) panel.style.height='auto'; window.ScrollTrigger?.refresh(true);}});
   });
  });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
   if(event.matches) document.querySelectorAll('.inclusion-toggle').forEach(button => {
    const panel=document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    window.gsap.killTweensOf(panel);panel.style.height=button.getAttribute('aria-expanded')==='true'?'auto':'0px';
   });
  });
  document.querySelectorAll('[data-guide]').forEach((card, index) => {
   const trigger = card.querySelector('.guide-toggle'), panel = card.querySelector('.coaches-person-info');
   card.removeAttribute('tabindex'); card.removeAttribute('aria-controls');
   if (!trigger || !panel) return;
   panel.id = 'guide-panel-' + index; trigger.setAttribute('aria-controls', panel.id);
   const close = (restore = false) => {
    card.classList.remove('is-open'); trigger.setAttribute('aria-expanded','false'); panel.inert = true;
    if(restore) trigger.focus({preventScroll:true});
   };
   trigger.addEventListener('click', e => {
    if (trigger.getAttribute('aria-expanded') === 'true') { close(true); return; }
    card.classList.add('is-open'); trigger.setAttribute('aria-expanded','true');panel.inert=false;
    (e.detail === 0 ? (panel.querySelector('a,button') || panel) : panel).focus({preventScroll:true});
   });
   panel.querySelector('.guide-close')?.addEventListener('click',() => close(true));
   card.addEventListener('keydown', e => {if(e.key === 'Escape'){e.preventDefault();close(true);}});
   document.addEventListener('pointerdown',e => {if(!card.contains(e.target)) close();});

  });
  document.querySelectorAll('.form .inp-group').forEach((group, index) => {
   const field = group.querySelector('input,textarea');
   if (!field) return;
   const error = document.createElement('p');
   error.id = 'form-error-' + index; error.className = 'body-sm'; error.hidden = true;
   error.textContent = field.type === 'email' ? 'Enter a valid email address.' : 'Complete this field.';
   error.setAttribute('aria-live','polite'); group.appendChild(error);
   field.setAttribute('aria-describedby',error.id);
   const update = () => { const invalid = group.classList.contains('is-error'); field.setAttribute('aria-invalid',String(invalid)); error.hidden = !invalid; };
   new MutationObserver(update).observe(group,{attributes:true,attributeFilter:['class']}); update();
  });
  const message = document.querySelector('.form textarea[name="message"]');
  const tripName = new URLSearchParams(location.search).get('trip');
  if (message && tripName) message.value = tripName.slice(0, message.maxLength > 0 ? message.maxLength : 5000);
  const mapBox = document.querySelector('.destination__code');
  if (mapBox) {
   const tip = document.createElement('div');
   tip.className = 'map-tip'; tip.setAttribute('aria-hidden','true'); tip.hidden = true; mapBox.appendChild(tip);
   let active = null;
   const show = pin => {
    active = pin;
    const meta = [pin.dataset.place].filter(Boolean).join(' · ');
    tip.innerHTML = '';
    [['map-tip__title', pin.getAttribute('aria-label')], ['map-tip__meta', meta], ['map-tip__place', pin.dataset.place]].forEach(([cls, text]) => {
     if (!text) return; const el = document.createElement('span'); el.className = cls; el.textContent = text; tip.appendChild(el);
    });
    tip.hidden = false;
    const dot = pin.querySelector('.map-hit').getBoundingClientRect(), box = mapBox.getBoundingClientRect();
    const x = dot.left + dot.width / 2 - box.left, y = dot.top - box.top;
    const half = tip.offsetWidth / 2, left = Math.min(Math.max(x, half + 8), box.width - half - 8);
    tip.style.left = left + 'px'; tip.style.top = y + 'px';
    tip.classList.toggle('is-below', y < tip.offsetHeight + 16);
    if (tip.classList.contains('is-below')) tip.style.top = (dot.bottom - box.top) + 'px';
   };
   const hide = () => { active = null; tip.hidden = true; };
   mapBox.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(pin); });
    pin.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(); });
    pin.addEventListener('focus', () => show(pin));
    pin.addEventListener('blur', hide);
    // Touch: first tap names the trip, a second tap on the same pin opens it.
    pin.addEventListener('click', e => { if (e.pointerType === 'touch' && active !== pin) { e.preventDefault(); show(pin); } });
   });
   document.addEventListener('pointerdown', e => { if (active && !e.target.closest?.('.map-pin')) hide(); });
   addEventListener('scroll', () => { if (active && document.activeElement !== active) hide(); }, {passive:true});
  }
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrive = el => {
   if (!el) return;
   window.gsap?.killTweensOf(el);
   if (reduced()) { el.style.opacity = '1'; return; }
   window.gsap?.fromTo(el, {opacity:.4}, {opacity:1,duration:.2,ease:'power2.out',overwrite:true});
  };
  const tabs = [...document.querySelectorAll('.iyw-tabs [role="tab"]')];
  let tabTransition = null;
  function chooseTab(index, focus = false) {
   const next=document.getElementById(tabs[index]?.getAttribute('aria-controls'));
   if(!next)return;
   tabTransition?.kill();
   const panels=tabs.map(t=>document.getElementById(t.getAttribute('aria-controls'))).filter(Boolean);
   const previous=panels.find(p=>!p.hidden);
   tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
   panels.forEach(panel=>{window.gsap?.killTweensOf(panel);panel.inert=panel!==next;panel.setAttribute('aria-hidden',String(panel!==next));});
   if(focus) tabs[index]?.focus({preventScroll:true});
   const show=()=>{
    panels.forEach(panel=>{panel.hidden=panel!==next;panel.style.opacity='1';});
    arrive(next);window.ScrollTrigger?.refresh(true);
   };
   if(previous&&previous!==next&&!reduced()&&window.gsap){
    tabTransition=window.gsap.to(previous,{opacity:0,duration:.1,ease:'power2.out',overwrite:true,onComplete:show});
   }else show();
  }
  tabs.forEach((tab,i) => {
   tab.addEventListener('click',()=>chooseTab(i));
   tab.addEventListener('keydown',e=>{
    let next=i;
    if(e.key==='ArrowRight') next=(i+1)%tabs.length;
    else if(e.key==='ArrowLeft') next=(i+tabs.length-1)%tabs.length;
    else if(e.key==='Home') next=0;
    else if(e.key==='End') next=tabs.length-1;
    else return;
    e.preventDefault();chooseTab(next,true);
   });
  });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches && tabs.length)chooseTab(Math.max(0,tabs.findIndex(t=>t.getAttribute('aria-selected')==='true')));});
  const audience=document.querySelector('#tour-audience'), category=document.querySelector('#tour-category');
  if(audience && category) {
   const params=new URLSearchParams(location.search);
   audience.value=params.get('for')||'';category.value=params.get('category')||'';
   const grid=document.querySelector('.featured__items');
   function filter(immediate=false) {
    const choices=[...document.querySelectorAll('[data-tour]')].map(card=>({card,visible:(!audience.value || card.dataset.audience===audience.value)&&(!category.value || card.dataset.category===category.value)}));
    document.querySelector('#tour-count').textContent=choices.filter(x=>x.visible).length+' programmes';
    const url=new URL(location.href);
    for(const [key,value] of [['for',audience.value],['category',category.value]]) value?url.searchParams.set(key,value):url.searchParams.delete(key);
    history.replaceState(null,'',url);
    const apply=()=>{
     choices.forEach(({card,visible})=>{card.hidden=!visible;});
     if(grid){grid.removeAttribute('aria-busy');arrive(grid);}window.ScrollTrigger?.refresh(true);
    };
    if(grid)window.gsap?.killTweensOf(grid);
    if(grid && immediate!==true && !reduced() && window.gsap){
     grid.setAttribute('aria-busy','true');window.gsap.to(grid,{opacity:0,duration:.1,ease:'power2.out',overwrite:true,onComplete:apply});
    }else apply();
   }
   audience.addEventListener('change',filter);category.addEventListener('change',filter);filter(true);
   matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches)filter(true);});
  }
  document.querySelectorAll('[data-map-select]').forEach(select=>{
   const box=select.closest('.destination__code');if(!box)return;
   const update=()=>{
    box.querySelectorAll('[data-map-tour]').forEach(el=>{const hidden=el.dataset.mapTour!==select.value;el.toggleAttribute('hidden',hidden);el.style.display=hidden?'none':'';});
    arrive(box.querySelector('.destination__dots'));window.ScrollTrigger?.refresh(true);
   };
   select.addEventListener('change',update);update();
  });
  document.querySelectorAll('.header-nav__link').forEach(a=>{
   const current=location.pathname.replace(/\/$/,'')===new URL(a.href).pathname;
   a.classList.toggle('w--current',current);if(current)a.setAttribute('aria-current','page');
  });
  document.querySelectorAll('.header__l,.footer-logo').forEach(a => {
   a.addEventListener('click', e => {
    if (location.pathname !== '/icelandyourway-preview/') return;
    e.preventDefault();
    const smoother = window.ScrollSmoother?.get();
    if(smoother) smoother.scrollTo(0,true); else scrollTo({top:0,behavior:'instant'});
   });
  });
 });
});
