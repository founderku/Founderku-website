/* fk-shell: laci menu + latar bergerak buat semua halaman statis.
   - Bahasa label ikut <html lang> yang diatur tiap halaman (id/en/tr).
   - Kalau pengunjung sudah login (/api/me), tombol "Masuk" jadi "Akun Saya".
   - Di beranda (yang sudah punya laci sendiri) cuma latarnya yang dipasang. */
(function () {
  var LABELS = {
    id: { talk: 'Ngobrol soal proyek', menu: 'Menu', home: 'Beranda', tools: 'Tools', pricing: 'Harga', catalog: 'Katalog', blog: 'Blog', cases: 'Studi Kasus', store: 'Founder Starterpack', login: 'Masuk', account: 'Akun Saya', open: 'buka menu', close: 'tutup menu', terms: 'Syarat & Ketentuan', privacy: 'Kebijakan Privasi' },
    en: { talk: 'Talk about a project', menu: 'Menu', home: 'Home', tools: 'Tools', pricing: 'Pricing', catalog: 'Catalog', blog: 'Blog', cases: 'Case Studies', store: 'Founder Starterpack', login: 'Sign in', account: 'My Account', open: 'open menu', close: 'close menu', terms: 'Terms', privacy: 'Privacy' },
    tr: { talk: 'Proje hakkında konuş', menu: 'Menü', home: 'Ana Sayfa', tools: 'Araçlar', pricing: 'Fiyatlar', catalog: 'Katalog', blog: 'Blog', cases: 'Vaka Çalışmaları', store: 'Founder Starterpack', login: 'Giriş', account: 'Hesabım', open: 'menüyü aç', close: 'menüyü kapat', terms: 'Koşullar', privacy: 'Gizlilik' }
  };
  var LINKS = [
    { key: 'home', href: '/' },
    { key: 'tools', href: 'tools.html' },
    { key: 'pricing', href: '/#harga' },
    { key: 'catalog', href: 'katalog.html' },
    { key: 'store', href: 'store.html' },
    { key: 'cases', href: 'case-studies.html' },
    { key: 'blog', href: 'blog.html' }
  ];
  var loggedIn = false;

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'id').slice(0, 2);
    return LABELS[l] ? l : 'id';
  }

  // ---- latar bergerak
  var bg = document.createElement('div');
  bg.className = 'fk-shell-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<div class="fk-shell-blob a"></div><div class="fk-shell-blob b"></div><div class="fk-shell-blob c"></div>';
  document.body.insertBefore(bg, document.body.firstChild);

  // Beranda sudah punya laci sendiri
  if (document.getElementById('fkDrawer')) return;
  var navRight = document.querySelector('.fk-nav-right');
  if (!navRight) return;

  // ---- tombol ☰
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fk-ctrl-btn fk-shell-menu-btn';
  btn.id = 'fkMenuBtn';
  btn.setAttribute('aria-controls', 'fkDrawer');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '&#9776;';
  navRight.appendChild(btn);

  // ---- laci
  var here = location.pathname.split('/').pop() || '';
  var overlay = document.createElement('div');
  overlay.className = 'fk-drawer-overlay';
  var drawer = document.createElement('aside');
  drawer.className = 'fk-drawer';
  drawer.id = 'fkDrawer';
  drawer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  function render() {
    var t = LABELS[lang()];
    btn.setAttribute('aria-label', t.open);
    drawer.setAttribute('aria-label', t.menu);
    var items = LINKS.map(function (l, i) {
      var current = (l.href === here) ? ' aria-current="page"' : '';
      return '<li style="transition-delay:' + (60 + i * 35) + 'ms"><a href="' + l.href + '"' + current + '>' + t[l.key] + '</a></li>';
    }).join('');
    drawer.innerHTML =
      '<div class="fk-drawer-head"><span class="fk-drawer-title">' + t.menu + '</span>' +
      '<button type="button" class="fk-ctrl-btn" data-close aria-label="' + t.close + '">&times;</button></div>' +
      '<ul class="fk-shell-list">' + items + '</ul>' +
      '<a class="fk-shell-cta" href="/akun">' + (loggedIn ? t.account : t.login) + '</a>' +
      '<a class="fk-shell-cta fk-shell-cta-alt" href="https://wa.me/6285710477257" target="_blank" rel="noopener">' + t.talk + '</a>' +
      '<div class="fk-shell-legal"><a href="/syarat">' + t.terms + '</a><span aria-hidden="true">·</span><a href="/privasi">' + t.privacy + '</a></div>';
    drawer.querySelector('[data-close]').addEventListener('click', close);
  }

  function open() {
    document.body.classList.add('fk-drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    document.body.classList.remove('fk-drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  render();
  // Label ikut ganti kalau pengunjung ganti bahasa di halaman
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (me) { if (me && me.loggedIn) { loggedIn = true; render(); } })
    .catch(function () {});
})();
