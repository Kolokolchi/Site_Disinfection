(() => {
  'use strict';
  const ROUND = 15;
  const KEY = 'dis-cleaning-pest-total';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const words = {
    ru: { launch:'Игра: поймай вредителей', title:'Поймай всех вредителей!', close:'Закрыть игру', hit:'Уничтожено', left:'Осталось', total:'Всего поймано', hint:'Нажимайте на букашек • 15 вредителей за раунд', win:'Чисто. Ни одной букашки!', done:'Все 15 вредителей пойманы. Отличная работа!', again:'Ещё один раунд', catch:'Поймать', names:['Таракан','Комар','Муха','Муравей','Паук'] },
    kk: { launch:'Ойын: зиянкестерді ұста', title:'Барлық зиянкестерді ұста!', close:'Ойынды жабу', hit:'Жойылды', left:'Қалды', total:'Барлығы ұсталды', hint:'Жәндіктерді басыңыз • Әр айналымда 15 зиянкес', win:'Таза. Бірде-бір жәндік жоқ!', done:'Барлық 15 зиянкес ұсталды. Жарайсыз!', again:'Тағы бір айналым', catch:'Ұстау', names:['Тарақан','Маса','Шыбын','Құмырсқа','Өрмекші'] }
  };
  const shapes = [
    '<g stroke="#65422d" stroke-width="2.5" fill="none"><path d="M21 22 10 15M20 29 8 29M21 36 10 45M35 22 46 15M36 29 48 29M35 36 46 45M25 14 18 3M31 14 38 3"/></g><ellipse cx="28" cy="31" rx="11" ry="17" fill="#955735"/><path d="M28 17v29M21 27h14M20 34h16" stroke="#653b28" stroke-width="2"/><ellipse cx="28" cy="15" rx="6" ry="5" fill="#493024"/>',
    '<g stroke="#53635b" stroke-width="1.8" fill="none"><path d="m26 25-17-8m19 12L8 36m22-10 16-9M30 30l18 8M27 34 18 49m12-15 8 15M28 18V3"/></g><g fill="#d5e9ec" stroke="#8caeb6"><ellipse cx="18" cy="26" rx="7" ry="14" transform="rotate(-40 18 26)"/><ellipse cx="38" cy="26" rx="7" ry="14" transform="rotate(40 38 26)"/></g><ellipse cx="28" cy="30" rx="3" ry="15" fill="#61594a"/><circle cx="28" cy="16" r="4" fill="#3d443c"/>',
    '<path d="m23 25-13-8m13 17L9 40m23-15 14-8M33 34l14 6" stroke="#37483c" stroke-width="2.5"/><ellipse cx="28" cy="32" rx="9" ry="13" fill="#37483c"/><g fill="#dcecf0" fill-opacity=".9" stroke="#8cabb1"><ellipse cx="17" cy="25" rx="7" ry="13" transform="rotate(-35 17 25)"/><ellipse cx="39" cy="25" rx="7" ry="13" transform="rotate(35 39 25)"/></g><circle cx="28" cy="15" r="7" fill="#435748"/><g fill="#b8674e"><circle cx="23" cy="14" r="4"/><circle cx="33" cy="14" r="4"/></g>',
    '<path d="m25 24-14-8m13 13H8m17 5L12 45m19-21 14-8M32 29h16M31 34l13 11M25 14 19 5m12 9 6-9" stroke="#633c2d" stroke-width="2.5" fill="none"/><g fill="#7b4b35"><ellipse cx="28" cy="40" rx="8" ry="11"/><ellipse cx="28" cy="26" rx="5" ry="7"/><circle cx="28" cy="15" r="7"/></g>',
    '<path d="M22 23 13 12 6 15m17 13L9 23 3 29m20 3L8 36 4 44m20-7L15 46v7m19-30 9-11 7 3M33 28l14-5 6 6m-20 3 15 4 4 8m-20-7 9 9v7" stroke="#4e4656" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="28" cy="35" rx="10" ry="12" fill="#66586e"/><circle cx="28" cy="22" r="7" fill="#493e50"/><g fill="#fff"><circle cx="25" cy="20" r="2"/><circle cx="31" cy="20" r="2"/></g>'
  ];
  const svg = content => `<svg viewBox="0 0 56 56" aria-hidden="true">${content}</svg>`;
  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'pest-launcher';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.innerHTML = svg('<g transform="translate(10 10) scale(.64)">' + shapes[0] + '</g><g fill="none" stroke="currentColor" stroke-width="2"><circle cx="28" cy="28" r="20"/><path d="M28 2v12m0 28v12M2 28h12m28 0h12"/></g>');
  const dialog = document.createElement('dialog');
  dialog.className = 'pest-game';
  dialog.setAttribute('aria-labelledby', 'pest-game-title');
  dialog.innerHTML = `<div class="pest-game__bar"><div><div class="pest-game__brand">DIS CLEANING / MINI GAME</div><h2 class="pest-game__title" id="pest-game-title"></h2></div><button type="button" class="pest-game__close">×</button></div><div class="pest-game__stats"><div><strong data-score>0 / 15</strong><span data-word="hit"></span></div><div><strong data-left>15</strong><span data-word="left"></span></div><div><strong data-total>0</strong><span data-word="total"></span></div></div><p class="pest-game__hint"></p><div class="pest-game__arena"><div class="pest-game__finish" hidden><h3 data-word="win"></h3><p data-word="done"></p><button type="button" class="pest-game__again" data-word="again"></button></div></div><span class="sr-only" role="status" data-status></span>`;
  document.body.append(launcher, dialog);
  const arena = dialog.querySelector('.pest-game__arena');
  const finish = dialog.querySelector('.pest-game__finish');
  const close = dialog.querySelector('.pest-game__close');
  let bugs = [], score = 0, total = 0, frame = 0, lastTime = 0, previousOverflow = '';
  try { total = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER - ROUND, Math.floor(Number(localStorage.getItem(KEY))) || 0)); } catch { /* Storage may be disabled. */ }
  const copy = () => words[document.documentElement.lang === 'kk' ? 'kk' : 'ru'];
  function translate() {
    const t = copy();
    launcher.title = launcher.ariaLabel = t.launch;
    close.ariaLabel = t.close;
    dialog.querySelector('#pest-game-title').textContent = t.title;
    dialog.querySelector('.pest-game__hint').textContent = t.hint;
    dialog.querySelectorAll('[data-word]').forEach(el => { el.textContent = t[el.dataset.word]; });
  }
  translate();
  new MutationObserver(translate).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  function counters() {
    dialog.querySelector('[data-score]').textContent = `${score} / ${ROUND}`;
    dialog.querySelector('[data-left]').textContent = ROUND - score;
    dialog.querySelector('[data-total]').textContent = total;
  }
  function bounds() { return { w:Math.max(0, arena.clientWidth - 56), h:Math.max(0, arena.clientHeight - 56) }; }
  function place(bug) { bug.el.style.transform = `translate(${bug.x}px,${bug.y}px)`; }
  function tick(time) {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, .04) : 0;
    lastTime = time;
    const { w, h } = bounds();
    for (const bug of bugs) {
      if (!reducedMotion.matches && document.activeElement !== bug.el && !bug.el.matches(':hover')) {
        bug.x += bug.vx * dt; bug.y += bug.vy * dt;
        if (bug.x < 0 || bug.x > w) bug.vx *= -1;
        if (bug.y < 0 || bug.y > h) bug.vy *= -1;
      }
      bug.x = Math.max(0, Math.min(w, bug.x)); bug.y = Math.max(0, Math.min(h, bug.y));
      place(bug);
    }
    if (dialog.open && bugs.length && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function start() {
    cancelAnimationFrame(frame);
    arena.querySelectorAll('.pest-game__bug,.pest-game__hit').forEach(el => el.remove());
    bugs = []; score = 0; lastTime = 0; finish.hidden = true;
    dialog.querySelector('[data-status]').textContent = '';
    counters();
    const { w, h } = bounds();
    for (let i = 0; i < ROUND; i++) {
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'pest-game__bug';
      el.ariaLabel = `${copy().catch}: ${copy().names[i % shapes.length]} ${i + 1}`;
      el.innerHTML = svg(shapes[i % shapes.length]);
      // Enter at alternating edges; reduced motion uses a stationary grid.
      const bug = { el, x:reducedMotion.matches ? (i % 3) * w / 2 : (i % 2 ? w : 0), y:(Math.floor(i / 3) + .5) * h / 5, vx:(i % 2 ? -1 : 1) * (35 + Math.random() * 50), vy:(Math.random() - .5) * 75 };
      el.addEventListener('click', () => {
        if (!bugs.includes(bug)) return;
        const hadFocus = document.activeElement === el;
        bugs = bugs.filter(item => item !== bug);
        el.remove(); score++; total++;
        try { localStorage.setItem(KEY, String(total)); } catch { /* Game works without persistence. */ }
        counters();
        dialog.querySelector('[data-status]').textContent = `${copy().hit}: ${score}. ${copy().left}: ${ROUND - score}.`;
        const hit = document.createElement('span'); hit.className = 'pest-game__hit'; hit.textContent = '+1';
        hit.style.left = `${bug.x + 15}px`; hit.style.top = `${bug.y}px`; arena.append(hit);
        setTimeout(() => hit.remove(), 500);
        if (score === ROUND) {
          cancelAnimationFrame(frame); finish.hidden = false;
          dialog.querySelector('[data-status]').textContent = copy().win;
          dialog.querySelector('.pest-game__again').focus();
        } else if (hadFocus) bugs[0].el.focus({ preventScroll:true });
      });
      arena.append(el); bugs.push(bug); place(bug);
    }
    frame = requestAnimationFrame(tick);
  }
  launcher.addEventListener('click', () => {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal(); close.focus(); start();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.querySelector('.pest-game__again').addEventListener('click', () => { start(); close.focus(); });
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(frame); bugs = [];
    arena.querySelectorAll('.pest-game__bug,.pest-game__hit').forEach(el => el.remove());
    document.body.style.overflow = previousOverflow;
    launcher.focus({ preventScroll:true });
  });
  // Native dialog handles Escape and keeps keyboard focus inside the game.
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); lastTime = 0;
    if (dialog.open && bugs.length && !document.hidden) frame = requestAnimationFrame(tick);
  });
})();
