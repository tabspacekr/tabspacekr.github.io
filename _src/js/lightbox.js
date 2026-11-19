/**
 * 이미지 모달 팝업(라이트박스) — <a data-lightbox="묶음" href="큰 이미지"> 를 누르면 같은 페이지 위 <dialog> 로 크게 보여 준다.
 *  - 같은 묶음끼리 이전·다음(버튼, ←/→ 키)으로 넘긴다. Esc·닫기 버튼·바깥 클릭으로 닫는다.
 *  - <dialog> 가 초점 가두기와 Esc 를 처리하고, 닫으면 누른 링크로 초점을 돌려준다.
 *  - 스크립트가 없으면 링크가 원본 이미지를 그대로 연다.
 */
(function () {
  'use strict';

  var dialog = null;
  var group = [];
  var index = 0;
  var opener = null;

  function caption(link) {
    var fig = link.closest('figure');
    var cap = fig && fig.querySelector('figcaption');
    if (!cap) return { title: (link.querySelector('img') || {}).alt || '', desc: '' };
    var title = cap.querySelector('b');
    var desc = cap.querySelector('span');
    return { title: (title || cap).textContent.trim(), desc: desc ? desc.textContent.trim() : '' };
  }

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', '이미지 크게 보기');
    dialog.innerHTML =
      '<div class="lightbox-box">' +
        '<img class="lightbox-img" alt="">' +
        '<p class="lightbox-cap"><b></b><span></span></p>' +
        '<p class="lightbox-count" aria-live="polite"></p>' +
        '<button type="button" class="lightbox-btn lightbox-prev"><span aria-hidden="true">‹</span><span class="sr-only">이전 이미지</span></button>' +
        '<button type="button" class="lightbox-btn lightbox-next"><span aria-hidden="true">›</span><span class="sr-only">다음 이미지</span></button>' +
        '<button type="button" class="lightbox-btn lightbox-x"><span aria-hidden="true">×</span><span class="sr-only">닫기</span></button>' +
      '</div>';
    document.body.appendChild(dialog);
    dialog.querySelector('.lightbox-prev').addEventListener('click', function () { show(index - 1); });
    dialog.querySelector('.lightbox-next').addEventListener('click', function () { show(index + 1); });
    dialog.querySelector('.lightbox-x').addEventListener('click', function () { dialog.close(); });
    // 이미지·버튼 바깥(어두운 면)을 누르면 닫는다
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('lightbox-open');
      if (opener) opener.focus();
    });
  }

  function show(i) {
    index = (i + group.length) % group.length;
    var link = group[index];
    var img = dialog.querySelector('.lightbox-img');
    img.src = link.getAttribute('href');
    img.alt = (link.querySelector('img') || {}).alt || '';
    var cap = caption(link);
    dialog.querySelector('.lightbox-cap b').textContent = cap.title;
    dialog.querySelector('.lightbox-cap span').textContent = cap.desc;
    dialog.querySelector('.lightbox-count').textContent = group.length > 1 ? (index + 1) + ' / ' + group.length : '';
    dialog.classList.toggle('single', group.length < 2);
  }

  function open(link) {
    if (!dialog) build();
    var name = link.getAttribute('data-lightbox');
    group = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox="' + name + '"]'));
    opener = link;
    show(group.indexOf(link));
    document.documentElement.classList.add('lightbox-open');
    dialog.showModal();
    dialog.querySelector('.lightbox-x').focus();
  }

  function init() {
    if (typeof HTMLDialogElement !== 'function') return;   // 아주 옛 브라우저는 링크로 연다
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[data-lightbox]');
      if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;   // 새 탭 열기는 그대로 둔다
      e.preventDefault();
      open(link);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
