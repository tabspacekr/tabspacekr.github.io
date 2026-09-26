/**
 * Contact Reveal — 이메일 주소 공개 게이트
 *
 * 이메일 주소를 자동 수집 프로그램으로부터 보호한다.
 * 주소는 소스 어디에도 평문으로 존재하지 않으며, 사용자가 버튼을 직접 누른 경우에만 복원된다.
 *
 *   1. 정적 파일을 정규식으로 훑는 수집기 → 인코딩된 문자열뿐이라 아무것도 찾지 못한다
 *   2. 페이지를 렌더링만 하는 수집기      → 클릭 전에는 DOM에 주소가 없다
 *   3. 스크립트로 클릭을 합성하는 수집기  → event.isTrusted 검사에 걸린다
 *
 * 주소를 바꿀 때는 index.html의 data-contact 값만 교체한다. (인코딩: XOR + Base64)
 */
(function () {
  'use strict';

  var KEY = 'tabspace';

  function decode(encoded) {
    var raw = atob(encoded);
    var out = '';
    for (var i = 0; i < raw.length; i++) {
      out += String.fromCharCode(raw.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
    }
    return out;
  }

  function buildCopyButton(address) {
    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'contact-reveal-copy';
    copy.textContent = '복사';

    copy.addEventListener('click', function () {
      if (!navigator.clipboard) {
        copy.textContent = '직접 복사해 주세요';
        return;
      }
      navigator.clipboard.writeText(address).then(function () {
        copy.textContent = '복사됨';
        setTimeout(function () { copy.textContent = '복사'; }, 2000);
      }, function () {
        copy.textContent = '직접 복사해 주세요';
      });
    });

    return copy;
  }

  function reveal(root) {
    var out = root.querySelector('.contact-reveal-out');
    var button = root.querySelector('.contact-reveal-btn');
    var address = decode(root.getAttribute('data-contact'));

    var link = document.createElement('a');
    link.href = 'mailto:' + address;
    link.className = 'cyber-link contact-reveal-address';
    link.textContent = address;

    out.appendChild(link);
    out.appendChild(buildCopyButton(address));
    out.hidden = false;
    button.hidden = true;
    link.focus();
  }

  function init() {
    var roots = document.querySelectorAll('.contact-reveal[data-contact]');

    Array.prototype.forEach.call(roots, function (root) {
      var button = root.querySelector('.contact-reveal-btn');
      if (!button) return;

      button.addEventListener('click', function (event) {
        // 스크립트가 합성한 클릭(element.click() 등)은 무시한다
        if (!event.isTrusted) return;
        reveal(root);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
