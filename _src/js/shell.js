/**
 * 공용 화면 틀 동작 — 머리·메뉴·푸터 마크업은 빌드(tools/build)가 각 페이지에 미리 넣는다.
 *  - 테마 전환(자동/라이트/다크). 첫 그리기 전 적용은 <head> 인라인 스크립트가 한다.
 *  - 넓은 화면 펼침 메뉴: 메인 메뉴에 마우스를 올리거나 초점이 들어오면 모든 묶음의 하위 메뉴를 열로 펼친다.
 *  - 전체 메뉴 창(☰): 좁은 화면에서는 이것이 유일한 내비게이션이다.
 *  - 빠른 메뉴 접기·펴기, 맨 위로 버튼, 저작권 연도.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'ts-theme';
  var QUICK_KEY = 'ts-quickmenu';

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* 저장소를 못 쓰는 브라우저(사생활 보호 창 등)는 기기 설정을 따른다 */ }
    return null;
  }

  /* ── 테마 ── */
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function resolveTheme(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return darkQuery && darkQuery.matches ? 'dark' : 'light';
  }
  function applyTheme(pref) {
    var theme = resolveTheme(pref);
    var changed = root.getAttribute('data-theme') !== theme;
    root.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-set') === pref));
    });
    if (changed) document.dispatchEvent(new CustomEvent('ts:themechange', { detail: { theme: theme } }));
  }
  function initTheme() {
    var pref = store(THEME_KEY) || 'auto';
    applyTheme(pref);
    document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pref = btn.getAttribute('data-theme-set');
        store(THEME_KEY, pref);
        applyTheme(pref);
      });
    });
    if (darkQuery && darkQuery.addEventListener) {
      darkQuery.addEventListener('change', function () { if (pref === 'auto') applyTheme(pref); });
    }
  }

  /* ── 펼침 메뉴(넓은 화면) ── */
  function initMegaMenu() {
    var bar = document.querySelector('.gnb-bar');
    if (!bar) return;
    var wide = window.matchMedia('(min-width: 1024px)');
    var items = bar.querySelectorAll('.gnb > li');
    var closeTimer = null;

    function measure() {
      var tallest = 0;
      bar.querySelectorAll('.gnb-sub').forEach(function (sub) {
        sub.style.height = 'auto';
        tallest = Math.max(tallest, sub.scrollHeight);
        sub.style.height = '';
      });
      bar.style.setProperty('--mega-h', tallest + 'px');
    }
    function open(li) {
      if (!wide.matches) return;
      clearTimeout(closeTimer);
      if (!bar.classList.contains('is-mega')) {
        bar.classList.add('is-mega');
        measure();
      }
      items.forEach(function (x) { x.classList.toggle('is-hot', x === li); });
      bar.querySelectorAll('.gnb-main').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    }
    function close() {
      bar.classList.remove('is-mega');
      items.forEach(function (x) { x.classList.remove('is-hot'); });
      bar.querySelectorAll('.gnb-main').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    }
    function closeSoon() { closeTimer = setTimeout(close, 120); }

    items.forEach(function (li) {
      li.addEventListener('mouseenter', function () { open(li); });
      li.addEventListener('focusin', function () { open(li); });
    });
    bar.addEventListener('mouseleave', closeSoon);
    bar.addEventListener('focusout', function (e) { if (!bar.contains(e.relatedTarget)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bar.classList.contains('is-mega')) close(); });
    wide.addEventListener && wide.addEventListener('change', close);
  }

  /* ── 전체 메뉴 창 ── */
  function initAllMenu() {
    var btn = document.querySelector('.allmenu-btn');
    var dialog = document.getElementById('allmenu');
    if (!btn || !dialog) return;
    var closeBtn = dialog.querySelector('.allmenu-x');

    function focusables() {
      return Array.prototype.slice.call(dialog.querySelectorAll('a[href], button:not([disabled])'));
    }
    function open() {
      dialog.hidden = false;
      root.classList.add('allmenu-open');
      btn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }
    function close() {
      dialog.hidden = true;
      root.classList.remove('allmenu-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
    btn.addEventListener('click', function () { dialog.hidden ? open() : close(); });
    closeBtn.addEventListener('click', close);
    dialog.querySelector('.allmenu-dim').addEventListener('click', close);
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var list = focusables();
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ── 빠른 메뉴 + 맨 위로 ── */
  function initQuickMenu() {
    var box = document.querySelector('.quickmenu');
    if (!box) return;
    var list = box.querySelector('.quickmenu-list');
    var tog = box.querySelector('.quickmenu-tog');
    var top = box.querySelector('.to-top');

    if (list && tog) {
      var saved = store(QUICK_KEY);
      // 본문 밖 여백이 카드보다 넓은 화면(1500px 이상)만 펼친 채 시작한다
      var openState = saved ? saved === 'open' : window.innerWidth >= 1500;
      var render = function () {
        list.hidden = !openState;
        tog.setAttribute('aria-expanded', String(openState));
        tog.querySelector('.sr-only').textContent = openState ? '빠른 메뉴 접기' : '빠른 메뉴 펴기';
      };
      render();
      tog.addEventListener('click', function () {
        openState = !openState;
        store(QUICK_KEY, openState ? 'open' : 'closed');
        render();
      });
    }

    if (top) {
      var ticking = false;
      var update = function () {
        ticking = false;
        top.classList.toggle('on', window.pageYOffset > 400);
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();
      top.addEventListener('click', function () {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        var skip = document.getElementById('main');
        if (skip) skip.focus({ preventScroll: true });
      });
    }
  }

  function init() {
    initTheme();
    initMegaMenu();
    initAllMenu();
    initQuickMenu();
    var year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
