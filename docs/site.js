/* Shared behaviour for every page: theme, mobile menu, gentle reveal,
   "show more" lists, and the publications search/filters. */
(function () {
  var root = document.documentElement;

  /* ---- Light / dark theme (remembered in this browser when possible) ---- */
  var themeBtn = document.getElementById('themeToggle');
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  function setTheme(d) {
    root.classList.toggle('dark', d);
    if (themeBtn) {
      themeBtn.querySelector('i').className = d ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      themeBtn.querySelector('.theme-label').textContent = d ? 'Light' : 'Dark';
    }
  }
  setTheme(dark);
  if (themeBtn) themeBtn.addEventListener('click', function () {
    dark = !dark;
    setTheme(dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  });

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById('menuToggle');
  var nav = document.querySelector('.nav');
  if (menuBtn && nav) menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---- Footer year ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- "Show all" for long timelines (News) ---- */
  document.querySelectorAll('[data-expand]').forEach(function (btn) {
    var list = document.getElementById(btn.dataset.expand);
    if (!list || !list.querySelector('.more-item')) { btn.hidden = true; return; }
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('expanded');
      btn.textContent = open ? 'Show less' : 'Show all updates';
    });
  });

  /* ---- Publications page ---- */
  var lists = document.querySelectorAll('ol.numbered');
  if (!lists.length) return;

  var counts = {};
  lists.forEach(function (list) {
    var items = list.querySelectorAll(':scope > li');
    counts[list.dataset.prefix] = items.length;
    items.forEach(function (li, i) {
      // The newest paper sits at the top and is numbered 1: [J1], [J2], ...
      li.setAttribute('data-num', '[' + list.dataset.prefix + (i + 1) + ']');

      var actions = document.createElement('span');
      actions.className = 'pub-actions';
      if (li.dataset.status) {
        var st = document.createElement('span');
        st.className = 'tag status';
        st.textContent = li.dataset.status;
        actions.appendChild(st);
      }
      if (actions.childNodes.length) li.appendChild(actions);
    });
  });

  // Tab labels with live counts, e.g. "9 journal articles"
  var names = { J: ['Journal article', 'Journal articles'], C: ['Conference paper', 'Conference papers'], P: ['Patent', 'Patents'] };
  var total = 0;
  document.querySelectorAll('.pub-tab').forEach(function (tab) {
    var k = tab.dataset.show;
    if (k === 'all') return;
    var n = counts[k] || 0;
    total += n;
    tab.textContent = n + ' ' + names[k][n === 1 ? 0 : 1];
    if (!n) tab.hidden = true;
  });
  var allTab = document.querySelector('.pub-tab[data-show="all"]');
  if (allTab) allTab.textContent = 'All (' + total + ')';

  function show(k) {
    document.querySelectorAll('.pub-tab').forEach(function (t) {
      var on = t.dataset.show === k;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.pub-group').forEach(function (g) {
      g.hidden = !(k === 'all' || g.dataset.type === k);
    });
  }
  document.querySelectorAll('.pub-tab').forEach(function (t) {
    t.addEventListener('click', function () { show(t.dataset.show); });
  });
  var start = new URLSearchParams(window.location.search).get('type');
  show(start && document.querySelector('.pub-tab[data-show="' + start + '"]') ? start : 'all');
})();
