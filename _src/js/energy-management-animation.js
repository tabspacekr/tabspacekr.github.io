/**
 * Energy Management Animation
 * 지능형 에너지 관리 섹션의 순차적 하이라이트 애니메이션
 */

(function() {
  'use strict';

  // 애니메이션 설정
  const ANIMATION_CONFIG = {
    itemDelay: 2500, // 각 항목당 딜레이 (밀리초)
    iconTransitionDelay: 200, // 아이콘 전환 딜레이
    loopDelay: 1000, // 루프 반복 전 딜레이
  };

  // DOM 요소
  let featureList = null;
  let featureItems = null;
  let iconDisplay = null;
  let animationInterval = null;
  let currentIndex = 0;

  /**
   * 초기화 함수
   */
  function init() {
    // DOM 요소 가져오기
    featureList = document.querySelector('.energy-feature-list');
    iconDisplay = document.getElementById('energy-feature-icon');

    if (!featureList || !iconDisplay) return;

    featureItems = featureList.querySelectorAll('li[data-icon]');

    if (featureItems.length === 0) return;

    // 감속 모드에서는 첫 항목만 정적으로 보여준다
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      highlightItem(0);
      return;
    }

    setupVisibility();
  }

  /**
   * 섹션이 화면에 보이고 탭이 활성일 때만 순환한다.
   * (GSAP ScrollTrigger 의 'top 80%' 트리거를 IntersectionObserver 로 대체)
   */
  let inView = false;

  function setupVisibility() {
    if (!('IntersectionObserver' in window)) {
      startAnimation();
      return;
    }
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      updateRunning();
    }, { rootMargin: '0px 0px -20% 0px' }).observe(featureList);
    document.addEventListener('visibilitychange', updateRunning);
  }

  function updateRunning() {
    if (inView && !document.hidden) {
      if (!animationInterval) resumeAnimation();
    } else {
      stopAnimation();
    }
  }

  /**
   * 애니메이션 시작 (처음 항목부터)
   */
  function startAnimation() {
    currentIndex = 0;
    stopAnimation();
    highlightItem(currentIndex);
    schedule();
  }

  /**
   * 멈췄던 위치에서 이어서 순환
   */
  function resumeAnimation() {
    if (!featureList.querySelector('li.highlight')) {
      startAnimation();
      return;
    }
    schedule();
  }

  function schedule() {
    animationInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % featureItems.length;
      highlightItem(currentIndex);
    }, ANIMATION_CONFIG.itemDelay);
  }

  /**
   * 특정 항목 하이라이트
   * @param {number} index - 하이라이트할 항목의 인덱스
   */
  function highlightItem(index) {
    if (index < 0 || index >= featureItems.length) {
      return;
    }

    const item = featureItems[index];
    const iconClass = item.getAttribute('data-icon');
    const iconColor = item.getAttribute('data-color');

    // 모든 항목에서 하이라이트 제거
    featureItems.forEach(li => li.classList.remove('highlight'));

    // 현재 항목 하이라이트
    item.classList.add('highlight');

    // 아이콘 변경
    updateIcon(iconClass, iconColor);
  }

  /**
   * 아이콘 업데이트 (fade out -> change -> fade in)
   * @param {string} iconClass - 새 아이콘 클래스
   * @param {string} iconColor - 아이콘 색상
   */
  function updateIcon(iconClass, iconColor) {
    if (!iconDisplay) return;

    // Fade out
    iconDisplay.classList.remove('fade-in');
    iconDisplay.classList.add('fade-out');

    // 아이콘 변경 및 Fade in
    setTimeout(() => {
      // 기존 클래스 제거 (uil-로 시작하는 클래스만)
      const currentClasses = Array.from(iconDisplay.classList);
      currentClasses.forEach(cls => {
        if (cls.startsWith('uil-')) {
          iconDisplay.classList.remove(cls);
        }
      });

      // 새 아이콘 클래스 추가
      iconDisplay.classList.add(iconClass);

      // 색상 변경
      iconDisplay.style.color = iconColor;

      // Fade in
      iconDisplay.classList.remove('fade-out');
      iconDisplay.classList.add('fade-in');
    }, ANIMATION_CONFIG.iconTransitionDelay);
  }

  /**
   * 애니메이션 정지
   */
  function stopAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }

  /**
   * 정리 함수
   */
  function cleanup() {
    stopAnimation();
    if (featureItems) {
      featureItems.forEach(li => li.classList.remove('highlight'));
    }
  }

  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', cleanup);

  // 전역 객체에 노출 (디버깅 및 제어용)
  window.EnergyManagementAnimation = {
    start: startAnimation,
    stop: stopAnimation,
    cleanup: cleanup
  };

})();
