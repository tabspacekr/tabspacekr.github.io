/**
 * 홈페이지 초기화 (index.html 인라인 스크립트에서 옮김)
 *
 *  - 차트 4개는 해당 섹션이 화면 600px 이내로 다가올 때 Chart.js 를 받아 만든다 (전략 문서 J1)
 *  - window.dataVizInstance 는 DOMContentLoaded 에 바로 만들어 둔다 (환경 모니터링 버튼이 참조)
 */
(function () {
  'use strict';

  var CHART_SRC = './assets/vendor/chart-4.4.1.umd.min.js';
  var chartPromise = null;

  function loadChartJs() {
    if (window.Chart) return Promise.resolve();
    if (!chartPromise) {
      chartPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = CHART_SRC;
        script.async = true;
        script.onload = resolve;
        script.onerror = function () {
          chartPromise = null;
          reject(new Error('Chart.js load failed'));
        };
        document.head.appendChild(script);
      });
    }
    return chartPromise;
  }

  function initCharts() {
    if (!window.DataVisualization || !document.getElementById('energy-chart')) return;

    var dataViz = new DataVisualization();
    window.dataVizInstance = dataViz;

    var created = false;
    var create = function () {
      if (created) return;
      created = true;
      loadChartJs().then(function () {
        dataViz.init();
        dataViz.createEnergyChart('energy-chart');
        dataViz.createDeviceStatusChart('device-status-chart');
        dataViz.createEnvironmentChart('environment-chart');
        dataViz.createProjectStatsChart('project-stats-chart');
        dataViz.startAutoUpdate('energy-chart', 5000);
      }).catch(function (error) {
        created = false;
        console.error('Data Visualization initialization failed:', error);
      });
    };

    var targets = ['project-stats-chart', 'energy-chart', 'device-status-chart', 'environment-chart']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (!('IntersectionObserver' in window)) {
      create();
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        create();
      }
    }, { rootMargin: '600px 0px' });
    targets.forEach(function (el) { observer.observe(el); });
  }

  /**
   * 환경 모니터링 "실시간 업데이트 시작" 버튼
   */
  window.startEnvironmentUpdates = function () {
    if (!window.dataVizInstance) return;
    window.dataVizInstance.startAutoUpdate('environment-chart', 5000);
    alert('실시간 업데이트가 시작되었습니다!');
  };

  /**
   * 챗봇 데모 새로고침 버튼
   * @param {Event} event - 클릭 이벤트
   */
  window.refreshChatbotDemo = function (event) {
    if (!window.chatbotDemoInstance) return;
    var icon = event && event.currentTarget ? event.currentTarget.querySelector('i') : null;
    if (icon) {
      icon.style.transform = 'rotate(360deg)';
      setTimeout(function () { icon.style.transform = 'rotate(0deg)'; }, 300);
    }
    window.chatbotDemoInstance.refresh();
  };

  function init() {
    var yearElement = document.getElementById('current-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
    initCharts();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
