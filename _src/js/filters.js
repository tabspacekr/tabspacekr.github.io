/**
 * 목록 분류 필터(프로젝트·기술 인사이트). 목록은 빌드가 data/*.json 으로 미리 그려 둔다.
 * 마크업: <ul class="chips" data-filter-for="목록 id"> <button class="chip" data-filter="all|분류">…
 *         목록 항목은 data-category="분류", 건수 표시는 [data-count-for="목록 id"].
 */
(function () {
  'use strict';

  function apply(group, list, value) {
    var shown = 0;
    list.querySelectorAll('[data-category]').forEach(function (item) {
      var match = value === 'all' || item.getAttribute('data-category') === value;
      item.hidden = !match;
      if (match) shown++;
    });
    group.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-filter') === value));
    });
    var count = document.querySelector('[data-count-for="' + list.id + '"]');
    if (count) count.textContent = shown;
  }

  function init() {
    document.querySelectorAll('[data-filter-for]').forEach(function (group) {
      var list = document.getElementById(group.getAttribute('data-filter-for'));
      if (!list) return;
      group.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-filter]');
        if (btn) apply(group, list, btn.getAttribute('data-filter'));
      });
      // projects.html#unmanned 처럼 분류를 주소로 넘기면 그 분류로 시작한다(사업 분야 페이지의 사례 링크)
      var fromHash = function () {
        var value = location.hash.slice(1);
        if (value && group.querySelector('[data-filter="' + value + '"]')) apply(group, list, value);
      };
      fromHash();
      window.addEventListener('hashchange', fromHash);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
