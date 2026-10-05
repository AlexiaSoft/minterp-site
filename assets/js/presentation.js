(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const controls = document.querySelector('.deck-controls');
  const picker = document.getElementById('slide-select');
  const previous = document.getElementById('prev-slide');
  const next = document.getElementById('next-slide');
  const count = document.getElementById('slide-count');
  const progress = document.getElementById('deck-progress');
  const fullscreen = document.getElementById('fullscreen-deck');
  const deck = document.getElementById('deck');
  let index = 0;

  function fit() {
    if (!window.matchMedia('(min-width: 901px)').matches) return;
    const headerHeight = document.querySelector('.deck-header').offsetHeight;
    const available = Math.max(1, window.innerHeight - headerHeight - controls.offsetHeight);
    const height = slides[index].offsetHeight;
    const scale = Math.min(1, available / height);
    deck.style.setProperty('--deck-scale', scale);
    deck.style.setProperty('--deck-top', `${headerHeight + Math.max(0, (available - height * scale) / 2)}px`);
  }

  slides.forEach((slide, i) => {
    picker.add(new Option(`${String(i + 1).padStart(2, '0')} · ${slide.dataset.title}`, slide.id));
    slide.tabIndex = -1;
  });
  progress.max = slides.length;

  function render(focus = false) {
    const found = slides.findIndex(slide => `#${slide.id}` === location.hash);
    index = found < 0 ? 0 : found;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    picker.value = slides[index].id;
    count.textContent = `${index + 1} / ${slides.length}`;
    progress.value = index + 1;
    if (focus) slides[index].focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    fit();
  }

  function go(target) {
    const slide = slides[Math.max(0, Math.min(slides.length - 1, target))];
    if (location.hash !== `#${slide.id}`) location.hash = slide.id;
  }

  previous.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  picker.addEventListener('change', () => go(slides.findIndex(slide => slide.id === picker.value)));
  window.addEventListener('hashchange', () => render(true));
  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      || event.target.closest('input, select, textarea, button, a, [contenteditable], [role="button"]')) return;
    const targets = { ArrowLeft: index - 1, ArrowRight: index + 1, PageUp: index - 1, PageDown: index + 1, Home: 0, End: slides.length - 1 };
    if (Object.hasOwn(targets, event.key)) {
      event.preventDefault();
      go(targets[event.key]);
    }
  });

  document.getElementById('print-deck').addEventListener('click', () => window.print());
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      document.getElementById('deck-status').textContent = 'เปิดเต็มหน้าจอไม่ได้ กรุณาใช้เมนูเต็มหน้าจอของเบราว์เซอร์';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? 'ออกจากเต็มหน้าจอ' : 'เปิดเต็มหน้าจอ';
    fullscreen.setAttribute('aria-label', label);
    fullscreen.title = label;
  });

  render();
  controls.hidden = false;
  document.body.classList.add('deck-ready');
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  document.fonts.ready.then(fit);
})();
