/**
 * Energy Management Animation
 * 지능형 에너지 관리 섹션의 순차적 하이라이트 애니메이션
 */

(function() {
  'use strict';

  // 애니메이션 설정
  const ANIMATION_CONFIG = {
    itemDelay: 300, // 각 항목당 딜레이 (밀리초)
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

    if (!featureList || !iconDisplay) {
      console.warn('Energy management animation: Required elements not found');
      return;
    }

    featureItems = featureList.querySelectorAll('li[data-icon]');

    if (featureItems.length === 0) {
      console.warn('Energy management animation: No feature items found');
      return;
    }

    // GSAP ScrollTrigger 설정
    setupScrollTrigger();
  }

  /**
   * ScrollTrigger 설정
   * 섹션이 화면에 보일 때 애니메이션 시작
   */
  function setupScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded, starting animation immediately');
      startAnimation();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '.energy-feature-list',
      start: 'top 80%', // 화면의 80% 지점에서 트리거
      onEnter: () => {
        console.log('Energy management animation: Section entered viewport');
        startAnimation();
      },
      onLeave: () => {
        console.log('Energy management animation: Section left viewport');
        // 섹션을 벗어나도 애니메이션 계속 진행
      },
      onEnterBack: () => {
        console.log('Energy management animation: Section re-entered viewport');
        // 다시 들어와도 애니메이션이 이미 실행 중이면 그대로 유지
        if (!animationInterval) {
          startAnimation();
        }
      },
      markers: false // 개발 시 true로 설정하면 트리거 위치 확인 가능
    });
  }

  /**
   * 애니메이션 시작
   */
  function startAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
    }

    currentIndex = 0;

    // 첫 번째 항목 즉시 표시
    highlightItem(currentIndex);

    // 순차적으로 나머지 항목 표시
    animationInterval = setInterval(() => {
      currentIndex++;

      if (currentIndex >= featureItems.length) {
        // 마지막 항목까지 표시 후 처음부터 다시 시작 (루프)
        currentIndex = 0;
      }

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
