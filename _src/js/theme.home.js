/**
 * 홈페이지 전용 테마 초기화.
 * Sandbox 테마의 assets/js/theme.js 에서 index.html 이 실제로 쓰는 컴포넌트만 남겼다
 * (전략 문서 J3). 필요한 플러그인은 _src/js/plugins.home.js (jQuery Easing, Headhesive, Owl Carousel).
 */
(function($) {
  'use strict';
  var theme = {
    init: () => {
      theme.stickyHeader();
      theme.headerButtons();
      theme.anchorSmoothScroll();
      theme.pageProgress();
    },
    /**
     * Sticky Header
     * Enables sticky behavior on navigation on page scroll
     * Requires assets/js/vendor/headhesive.min.js
    */
    stickyHeader: () => {
      if ($(".navbar").length) {
        var options = {
          offset: 350,
          offsetSide: 'top',
          classes: {
            clone: 'banner--clone fixed ',
            stick: 'banner--stick',
            unstick: 'banner--unstick'
          },
          onStick: function() {
            var $language_dropdown = $('.navbar:not(.fixed) .language-select .dropdown-menu');
            $language_dropdown.removeClass('show');
          },
          onUnstick: function() {
            var $language_sticky_dropdown = $('.navbar.fixed .language-select .dropdown-menu');
            $language_sticky_dropdown.removeClass('show');
          }
        };
        var banner = new Headhesive('.navbar', options);
      }
    },
    /**
     * Header Buttons
     * Open/close offcanvas menus on click of header buttons
    */
    headerButtons: () => {
      var $header_hamburger = $('.hamburger.animate');
      var $language_select = $('.language-select .dropdown-menu');
      var $navbar_offcanvas = $('.offcanvas-nav');
      var $navbar_offcanvas_toggle = $('[data-toggle="offcanvas-nav"]');
      var $navbar_offcanvas_close = $('.offcanvas-nav-close');
      var $info_offcanvas = $('.offcanvas-info');
      var $info_offcanvas_close = $('.offcanvas-info-close');
      var $info_offcanvas_toggle = $('[data-toggle="offcanvas-info"]');
      $header_hamburger.on("click", function() {
        $header_hamburger.toggleClass("active");
      });
      $navbar_offcanvas_toggle.on("click", function(e) {
        e.stopPropagation();
        $navbar_offcanvas.toggleClass('open');
        $('body').toggleClass('offcanvas-open');
      });
      $navbar_offcanvas.on("click", function(e) {
        e.stopPropagation();
      });
      $navbar_offcanvas_close.on("click", function(e) {
        $navbar_offcanvas.removeClass('open');
        $header_hamburger.removeClass('active');
        $('body').removeClass('offcanvas-open');
      });
      $info_offcanvas_toggle.on("click", function(e) {
        e.stopPropagation();
        $info_offcanvas.toggleClass('open');
      });
      $info_offcanvas.on("click", function(e) {
        e.stopPropagation();
      });
      $(document).on('click', function() {
        $navbar_offcanvas.removeClass('open');
        $info_offcanvas.removeClass('open');
        $header_hamburger.removeClass('active');
        $('body').removeClass('offcanvas-open');
      });
      $info_offcanvas_close.on("click", function(e) {
        $info_offcanvas.removeClass('open');
      });
      $('.onepage .navbar li a.scroll').on('click', function() {
        $navbar_offcanvas.removeClass('open');
        $header_hamburger.removeClass('active');
        $('body').removeClass('offcanvas-open');
      });
      // Close offcanvas when any nav link is clicked
      $('.offcanvas-nav .nav-link').on('click', function() {
        $navbar_offcanvas.removeClass('open');
        $header_hamburger.removeClass('active');
        $('body').removeClass('offcanvas-open');
      });
    },
    /**
     * Anchor Smooth Scroll
     * Adds smooth scroll animation to anchor links
    */
    anchorSmoothScroll: () => {
      $(function() {
        setTimeout(function() {
          if (location.hash) {
            window.scrollTo(0, 0);
            var target = location.hash.split('#');
            smoothScrollTo($('#' + target[1]));
          }
        }, 1);
        $('a.scroll[href*="#"]:not([href="#"])').on('click', function() {
          if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            smoothScrollTo($(this.hash));
            return false;
          }
        });
    
        function smoothScrollTo(target) {
          var target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
          if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top
            }, 1500, 'easeInOutExpo');
          }
        }
      });
    },
    /**
     * Page Progress
     * Shows page progress on the bottom right corner of the page
     * 스크롤 이벤트마다 문서 높이를 다시 계산하지 않도록 높이를 캐시하고,
     * 갱신은 한 프레임에 한 번만 한다 (전략 문서 A5)
    */
    pageProgress: () => {
      var wrap = document.querySelector('.progress-wrap');
      if (!wrap) return;
      var progressPath = wrap.querySelector('path');
      var pathLength = progressPath.getTotalLength();
      progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
      progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
      progressPath.style.strokeDashoffset = pathLength;
      progressPath.getBoundingClientRect();
      progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
      var offset = 50;
      var duration = 550;
      var scrollable = 1;
      var measure = function() {
        scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      };
      var frame = null;
      var update = function() {
        frame = null;
        var scroll = window.pageYOffset;
        progressPath.style.strokeDashoffset = pathLength - (Math.min(scroll, scrollable) * pathLength / scrollable);
        wrap.classList.toggle('active-progress', scroll > offset);
      };
      var request = function() {
        if (!frame) frame = requestAnimationFrame(update);
      };
      measure();
      update();
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', function() { measure(); request(); });
      window.addEventListener('load', function() { measure(); request(); });
      // 프로젝트·블로그처럼 나중에 그려지는 섹션 때문에 문서 높이가 바뀌면 다시 잰다
      if ('ResizeObserver' in window) new ResizeObserver(function() { measure(); request(); }).observe(document.body);
      jQuery(wrap).on('click', function(event) {
        event.preventDefault();
        jQuery('html, body').animate({
          scrollTop: 0
        }, duration);
        return false;
      });
    },
  }
  theme.init();
})(jQuery);
