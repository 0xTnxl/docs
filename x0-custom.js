/**
 * x0 Protocol Docs — Sidebar Toggle + Lenis Smooth Scrolling
 *
 * - Collapsible sidebar with localStorage persistence (desktop only)
 * - Lenis smooth scrolling loaded from CDN, with CSS smooth-scroll fallback
 * - Anchor link interception for smooth scroll-to
 */
(function () {
  'use strict';

  // Guard against re-initialization in SPA navigation
  if (window.__x0_custom_init) return;
  window.__x0_custom_init = true;

  var LENIS_CDN = 'https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js';
  var STORAGE_KEY = 'x0-sidebar-collapsed';

  // ─────────────────────────────────────────────
  //  Sidebar Toggle
  // ─────────────────────────────────────────────

  function initSidebarToggle() {
    // Don't double-create
    if (document.getElementById('x0-sidebar-toggle')) return;

    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Restore saved state
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      document.body.setAttribute('data-sidebar-collapsed', 'true');
    }

    // Create toggle button
    var btn = document.createElement('button');
    btn.id = 'x0-sidebar-toggle';
    btn.setAttribute('aria-label', 'Toggle sidebar');
    btn.setAttribute('title', 'Toggle sidebar');
    btn.innerHTML =
      '<svg class="x0-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M9 11L5 7L9 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    btn.addEventListener('click', function () {
      var isCollapsed = document.body.getAttribute('data-sidebar-collapsed') === 'true';
      if (isCollapsed) {
        document.body.removeAttribute('data-sidebar-collapsed');
        localStorage.setItem(STORAGE_KEY, 'false');
      } else {
        document.body.setAttribute('data-sidebar-collapsed', 'true');
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    });

    // Keyboard shortcut: [ (bracket left) to toggle sidebar
    document.addEventListener('keydown', function (e) {
      if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger when typing in inputs
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
        btn.click();
      }
    });

    document.body.appendChild(btn);
  }

  // ─────────────────────────────────────────────
  //  Lenis Smooth Scrolling
  // ─────────────────────────────────────────────

  function loadLenis() {
    // Already loaded?
    if (window.Lenis) {
      initLenis();
      return;
    }

    var script = document.createElement('script');
    script.src = LENIS_CDN;
    script.onload = initLenis;
    script.onerror = function () {
      // CDN failed — CSS smooth-scroll fallback is already active
      console.warn('[x0] Lenis CDN failed to load; using CSS smooth-scroll fallback.');
    };
    document.head.appendChild(script);
  }

  function initLenis() {
    if (window.__x0_lenis) return;
    if (typeof window.Lenis === 'undefined') return;

    var lenis = new window.Lenis({
      duration: 1.2,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    window.__x0_lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Intercept anchor clicks for smooth scroll-to
    document.addEventListener(
      'click',
      function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;

        var hash = link.getAttribute('href');
        if (!hash || hash === '#') return;

        var target;
        try {
          target = document.querySelector(hash);
        } catch (_) {
          return;
        }
        if (!target) return;

        e.preventDefault();
        lenis.scrollTo(target, { offset: -100, duration: 1.2 });

        // Update URL hash without jumping
        if (history.pushState) {
          history.pushState(null, null, hash);
        }
      },
      true
    );

    // Prevent Lenis from intercepting sidebar scrolling
    var sidebarContent = document.getElementById('sidebar-content');
    if (sidebarContent) {
      sidebarContent.setAttribute('data-lenis-prevent', '');
    }
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.setAttribute('data-lenis-prevent', '');
    }
  }

  // ─────────────────────────────────────────────
  //  Initialization
  // ─────────────────────────────────────────────

  function init() {
    initSidebarToggle();
    loadLenis();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
