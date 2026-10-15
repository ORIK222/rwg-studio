(() => {
  const root = document.documentElement;
  const animated = root.classList.contains('anim');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Заголовок hero: розбиваємо на слова для поетапної появи
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    let i = 0;
    const wrap = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
            w.append(inner); frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrap(child);
        }
      });
    };
    wrap(h1);
  }

  // Поява блоків при скролі, з затримкою всередині групи
  const groups = [
    '.sec-head', '.dirs > .dir', '.inds', '.cases > .case', '.more-list > .row', '.sub-h',
    '.steps > .step', '.ai', '.reviews > .quote', '.badges', '.stack > div', '.contact .wrap > *'
  ];
  const targets = [];
  groups.forEach(sel => {
    const els = document.querySelectorAll(sel);
    els.forEach((el, idx) => {
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min(idx % 8, 6));
      targets.push(el);
    });
  });
  if (animated && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('in'));
  }

  // Лічильники в цифрах
  const counters = document.querySelectorAll('.stat b');
  const runCounter = b => {
    const node = b.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const raw = node.textContent.trim();
    const m = raw.match(/^([\d.]+)(\D*)$/);
    if (!m) return;
    const target = parseFloat(m[1]);
    const decimals = (m[1].split('.')[1] || '').length;
    const suffix = m[2];
    const start = performance.now(), dur = 1400;
    const tick = now => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      node.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    node.textContent = (0).toFixed(decimals) + suffix;
    requestAnimationFrame(tick);
  };
  if (animated && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(b => cio.observe(b));
  }

  // Перемикач мов: запам'ятовуємо вибір, щоб не перекидало автоматично
  document.querySelectorAll('.lang a').forEach(a => a.addEventListener('click', () => {
    try { localStorage.setItem('rwg-lang', a.getAttribute('lang')); } catch (e) {}
  }));

  // Шапка стискається після скролу
  const top = document.querySelector('.top');
  const onScroll = () => top && top.classList.toggle('compact', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!animated || !canHover) return;

  // Лого в hero повертається слідом за курсором
  const hero = document.querySelector('.hero');
  const emblem = document.querySelector('.emblem');
  if (hero && emblem) {
    hero.addEventListener('pointermove', e => {
      const r = emblem.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      emblem.style.transform = `perspective(900px) rotateY(${dx * 22}deg) rotateX(${-dy * 22}deg)`;
    });
    hero.addEventListener('pointerleave', () => { emblem.style.transform = ''; });
  }

  // Картки проєктів: нахил і відблиск
  document.querySelectorAll('.case').forEach(card => {
    const shot = card.querySelector('.shot');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.classList.add('tilting');
      card.style.setProperty('--ry', `${(px - .5) * 7}deg`);
      card.style.setProperty('--rx', `${(.5 - py) * 7}deg`);
      if (shot) {
        const s = shot.getBoundingClientRect();
        shot.style.setProperty('--mx', `${e.clientX - s.left}px`);
        shot.style.setProperty('--my', `${e.clientY - s.top}px`);
      }
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();
