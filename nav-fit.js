/**
 * nav-fit.js — keeps the top navigation bar usable in every language.
 *
 * The desktop bar is sized for Hebrew. English, Russian and Georgian labels are
 * longer, so the bar used to overflow its 1200px container and crush the language
 * flags until they disappeared. This script measures the bar and, only when it
 * does not fit, applies one of two fallbacks:
 *
 *   html.nav-wide      the bar may use more of the screen width
 *   html.nav-compact   the bar collapses to the burger menu (same as ≤1280px)
 *
 * In the burger layout it also makes sure logo + flags + burger fit small phones:
 *
 *   html.nav-no-strip  hides the centered strip of key pages when it would collide
 *   html.nav-tight     smaller logo and flags
 *   html.nav-no-flags  flags stay only inside the menu (last resort)
 *
 * The matching CSS is the "NAV FIT" block in each page's <style>.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var inner = nav && nav.querySelector('.nav-inner');
  if (!inner) return;

  var burger = nav.querySelector('.nav-burger');
  var strip = nav.querySelector('.nav-cta-strip');
  var GAP_FULL = 20;   // px of breathing room between groups of the full bar
  var GAP_BURGER = 8;  // same, for the burger layout on small screens
  var STATES = ['nav-wide', 'nav-compact', 'nav-no-strip', 'nav-tight', 'nav-no-flags'];

  function displayed(el) {
    return !!el && getComputedStyle(el).display !== 'none';
  }

  // Top-level groups that take part in the bar's flow (the centered strip is absolute).
  function flowItems() {
    var items = [];
    for (var i = 0; i < inner.children.length; i++) {
      var el = inner.children[i];
      var cs = getComputedStyle(el);
      if (cs.display !== 'none' && cs.position !== 'absolute' && cs.position !== 'fixed') items.push(el);
    }
    return items;
  }

  function fits(gap) {
    var items = flowItems();
    var total = gap * Math.max(0, items.length - 1);
    for (var i = 0; i < items.length; i++) total += items[i].getBoundingClientRect().width;
    return total <= inner.clientWidth + 0.5;
  }

  // The centered strip of key pages must never sit on top of the logo or the flags.
  function stripCollides() {
    if (!displayed(strip)) return false;
    var s = strip.getBoundingClientRect();
    var items = flowItems();
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      if (Math.min(s.right, r.right) - Math.max(s.left, r.left) > -8) return true;
    }
    return false;
  }

  function fit() {
    root.classList.remove.apply(root.classList, STATES);

    // Above 1280px the full bar is shown: widen it, then collapse it, only if needed.
    if (!displayed(burger) && !fits(GAP_FULL)) {
      root.classList.add('nav-wide');
      if (!fits(GAP_FULL)) {
        root.classList.remove('nav-wide');
        root.classList.add('nav-compact');
      }
    }

    // Burger layout: keep logo + flags + burger inside the screen on small phones.
    if (displayed(burger) && !fits(GAP_BURGER)) {
      root.classList.add('nav-tight');
      if (!fits(GAP_BURGER)) root.classList.add('nav-no-flags');
    }
    if (stripCollides()) root.classList.add('nav-no-strip');

    // A menu left open while the full bar came back would have no button to close it.
    var menu = document.getElementById('navMobile');
    if (menu && menu.classList.contains('open') && !displayed(burger) &&
        typeof window.closeMobileMenu === 'function') {
      window.closeMobileMenu();
    }
  }

  var frame = 0;
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(function () { frame = 0; fit(); });
  }

  fit();
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  // Language switches rewrite the labels; re-measure before the next paint.
  if (window.MutationObserver) {
    new MutationObserver(fit).observe(inner, { childList: true, characterData: true, subtree: true });
  }
})();
