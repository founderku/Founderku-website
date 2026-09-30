/* fk-site: navigasi, menu besar, menu HP, footer, bahasa, tema, dan login
   untuk halaman selain beranda. Tampilan dan teksnya sama dengan beranda.
   Pemakaian di halaman:
     <header class="nav" id="nav" data-fk-nav></header>
     ... isi halaman ...  <footer class="band" data-fk-foot></footer>
     <script src="/assets/fk-site.js"></script>
     <script> FK.onLang(function(){ FK.apply(KAMUS); render(); }); </script>
   Kunci localStorage sama dengan beranda: fk-lang dan fk-theme. */
(function(){
  'use strict';
  var root=document.documentElement;
  var WA='6285710477257';
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D={"id": {"footer.copy": "© 2026 PT Talenthra Karya Nusantara. NIB 0909250086011. Hak cipta dilindungi undang-undang.", "nav.tools": "Tools", "nav.studio": "Studio", "nav.learn": "Belajar", "nav.starter": "Starterpack", "nav.pricing": "Harga", "nav.login": "Masuk", "nav.signup": "Daftar", "nav.account": "Akun Saya", "nav.menu": "Buka menu", "nav.close": "Tutup menu", "nav.theme": "Ganti tema terang/gelap", "nav.lang": "Pilih bahasa", "mega.toolsFoot": "Semua tools, satu akun. Trial {days} hari.", "mega.seePricing": "Lihat harga", "mega.allTools": "Semua tools", "mega.studioFoot": "Rata-rata 4-6 minggu dari ide ke MVP.", "mega.cases": "Studi kasus", "svc.brand": "Branding", "svc.brandD": "Logo, warna, dan suara brand", "svc.web": "Website", "svc.webD": "Situs yang bikin orang percaya", "svc.mvp": "MVP", "svc.mvpD": "Produk yang bisa dicoba beneran", "svc.talk": "Ngobrol 30 menit", "svc.talkD": "Gratis, tanpa tekanan", "learn.blog": "Blog", "learn.blogD": "Cerita dan update dari Founderku", "learn.cases": "Studi Kasus", "learn.casesD": "Project yang udah kelar dan jalan", "learn.catalog": "Katalog Program", "learn.catalogD": "Program dan kesempatan buat founder", "svc.brandL": "Bikin orang percaya sejak lihat pertama.", "svc.webL": "Situs cepat, rapi, dan gampang diurus sendiri.", "svc.mvpL": "Produk fungsional yang bisa dicoba user atau investor.", "footer.tag": "Semua bisa jadi founder. Tools dan studio buat UMKM dan founder baru.", "footer.company": "Perusahaan", "footer.terms": "Syarat & Ketentuan", "footer.privacy": "Kebijakan Privasi", "sheet.signup": "Daftar, gratis {days} hari", "tool.beta": "Beta", "tool.soon": "Segera hadir", "tool.all": "Lihat semua tools", "learn.students": "Tools Mahasiswa", "learn.studentsD": "IPK-in, Proposalin, Kanvasin, dan Stuney.", "nav.community": "Social Space", "footer.community": "Social Space", "nav.new": "Baru", "nav.back": "Kembali", "nav.prefs": "Bahasa & tema", "nav.dark": "Mode gelap", "gen.eyebrow": "Generator Nama Brand"}, "en": {"footer.copy": "© 2026 PT Talenthra Karya Nusantara. Business ID (NIB) 0909250086011. All rights reserved.", "nav.tools": "Tools", "nav.studio": "Studio", "nav.learn": "Learn", "nav.starter": "Starterpack", "nav.pricing": "Pricing", "nav.login": "Log in", "nav.signup": "Sign up", "nav.account": "My Account", "nav.menu": "Open menu", "nav.close": "Close menu", "nav.theme": "Switch light/dark theme", "nav.lang": "Choose language", "mega.toolsFoot": "Every tool, one account. {days}-day trial.", "mega.seePricing": "See pricing", "mega.allTools": "All tools", "mega.studioFoot": "Usually 4-6 weeks from idea to MVP.", "mega.cases": "Case studies", "svc.brand": "Branding", "svc.brandD": "Logo, colours, and brand voice", "svc.web": "Website", "svc.webD": "A site that earns trust", "svc.mvp": "MVP", "svc.mvpD": "A product people can actually try", "svc.talk": "30-minute chat", "svc.talkD": "Free, no pressure", "learn.blog": "Blog", "learn.blogD": "Stories and updates from Founderku", "learn.cases": "Case Studies", "learn.casesD": "Projects that shipped and run", "learn.catalog": "Program Catalog", "learn.catalogD": "Programs and opportunities for founders", "svc.brandL": "Earn trust at first glance.", "svc.webL": "A fast, tidy site you can manage yourself.", "svc.mvpL": "A working product users or investors can try.", "footer.tag": "Anyone can become a founder. Tools and a studio for small businesses and new founders.", "footer.company": "Company", "footer.terms": "Terms (Indonesian)", "footer.privacy": "Privacy (Indonesian)", "sheet.signup": "Sign up, {days} days free", "tool.beta": "Beta", "tool.soon": "Coming soon", "tool.all": "See all tools", "learn.students": "Student Tools", "learn.studentsD": "IPK-in, Proposalin, Kanvasin, and Stuney.", "nav.community": "Social Space", "footer.community": "Social Space", "nav.new": "New", "nav.back": "Back", "nav.prefs": "Language & theme", "nav.dark": "Dark mode", "gen.eyebrow": "Brand Name Generator"}, "tr": {"footer.copy": "© 2026 PT Talenthra Karya Nusantara. İşletme No (NIB) 0909250086011. Tüm hakları saklıdır.", "nav.tools": "Araçlar", "nav.studio": "Stüdyo", "nav.learn": "Öğren", "nav.starter": "Starterpack", "nav.pricing": "Fiyatlar", "nav.login": "Giriş", "nav.signup": "Kaydol", "nav.account": "Hesabım", "nav.menu": "Menüyü aç", "nav.close": "Menüyü kapat", "nav.theme": "Açık/koyu tema", "nav.lang": "Dil seç", "mega.toolsFoot": "Tüm araçlar, tek hesap. {days} günlük deneme.", "mega.seePricing": "Fiyatları gör", "mega.allTools": "Tüm araçlar", "mega.studioFoot": "Fikirden MVP'ye genellikle 4-6 hafta.", "mega.cases": "Vaka çalışmaları", "svc.brand": "Markalaşma", "svc.brandD": "Logo, renkler ve marka dili", "svc.web": "Web sitesi", "svc.webD": "Güven veren bir site", "svc.mvp": "MVP", "svc.mvpD": "Gerçekten denenebilen bir ürün", "svc.talk": "30 dakikalık sohbet", "svc.talkD": "Ücretsiz, baskı yok", "learn.blog": "Blog", "learn.blogD": "Founderku'dan hikayeler ve güncellemeler", "learn.cases": "Vaka Çalışmaları", "learn.casesD": "Tamamlanıp yayında olan projeler", "learn.catalog": "Program Kataloğu", "learn.catalogD": "Kurucular için programlar ve fırsatlar", "svc.brandL": "İlk bakışta güven kazan.", "svc.webL": "Kendin yönetebileceğin hızlı ve düzenli bir site.", "svc.mvpL": "Kullanıcıların veya yatırımcıların deneyebileceği çalışan bir ürün.", "footer.tag": "Herkes kurucu olabilir. Küçük işletmeler ve yeni kurucular için araçlar ve stüdyo.", "footer.company": "Şirket", "footer.terms": "Koşullar (Endonezce)", "footer.privacy": "Gizlilik (Endonezce)", "sheet.signup": "Kaydol, {days} gün ücretsiz", "tool.beta": "Beta", "tool.soon": "Yakında", "tool.all": "Tüm araçları gör", "learn.students": "Öğrenci Araçları", "learn.studentsD": "IPK-in, Proposalin, Kanvasin ve Stuney.", "nav.community": "Sosyal Alan", "footer.community": "Sosyal Alan", "nav.new": "Yeni", "nav.back": "Geri", "nav.prefs": "Dil ve tema", "nav.dark": "Koyu mod", "gen.eyebrow": "Marka Adı Üretici"}};
  var SHORT={
    pajangin:{id:'Halaman jualan + tombol WhatsApp, jadi dalam hitungan menit.',en:'A sales page with a WhatsApp button, ready in minutes.',tr:'WhatsApp butonlu satış sayfası, dakikalar içinde hazır.'},
    notain:{id:'Bikin invoice rapi buat pelanggan kamu.',en:'Make tidy invoices for your customers.',tr:'Müşterilerin için düzenli faturalar hazırla.'},
    pajakin:{id:'Hitung simulasi pajak UMKM (PPh Final 0,5%).',en:'Estimate small business tax (0.5% final tax).',tr:'KOBİ vergisini hesapla (%0,5 nihai vergi).'},
    kontrakin:{id:'Bikin surat perjanjian kerja sama sederhana.',en:'Draft a simple cooperation agreement.',tr:'Basit bir iş birliği sözleşmesi hazırla.'},
    jalanin:{id:'Checklist langkah demi langkah membangun usaha.',en:'A step-by-step checklist for building a business.',tr:'İş kurmak için adım adım kontrol listesi.'},
    sehatin:{id:'Cek kesehatan usahamu di 5 aspek penting.',en:'Check your business health across 5 key areas.',tr:'İşinin sağlığını 5 önemli alanda kontrol et.'}
  };
  var ORB_KNOWN={pajangin:1,notain:1,pajakin:1,kontrakin:1,jalanin:1,sehatin:1};
  var lang=root.getAttribute('lang')||'id';
  try{var sl=localStorage.getItem('fk-lang');if(sl)lang=sl;}catch{}
  if(!D[lang]) lang='id';
  var st={days:7,loggedIn:false,name:null,tools:[]};
  var subs=[];

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fill(s,vars){s=String(s).split('{days}').join(st.days);if(vars)Object.keys(vars).forEach(function(k){s=s.split('{'+k+'}').join(vars[k]);});return s;}
  function t(k,vars){var s=D[lang]&&D[lang][k];if(s==null)s=D.id[k];return s==null?'':fill(s,vars);}
  function pick(f){if(f==null)return '';if(typeof f==='string')return f;return f[lang]||f.id||f.en||'';}
  function pickArr(f){if(!f)return [];if(Array.isArray(f))return f;return f[lang]||f.id||f.en||[];}
  function setText(el,str){if(el.hasAttribute('data-dot')&&/\.$/.test(str))el.innerHTML=esc(str.slice(0,-1))+'<span class="o">.</span>';else el.textContent=str;}
  function firstSentence(s){var m=String(s||'').match(/^[^.!?]+[.!?]/);return m?m[0]:String(s||'');}
  function waHref(msg){var m=msg||{id:'Halo Founderku, aku mau diskusi bikin produk',en:'Hi Founderku, I would like to talk about building a product',tr:'Merhaba Founderku, bir ürün geliştirmek hakkında konuşmak istiyorum'}[lang];return 'https://wa.me/'+WA+'?text='+encodeURIComponent(m);}
  function safeUrl(u){u=String(u||'');return /^(https?:\/\/|\/(?!\/)|[a-z0-9-]+\.html|#|images\/)/i.test(u)?u:'#';}
  function toolHref(tl){return safeUrl(tl.linkUrl||('/tools/'+tl.id));}
  function toolShort(tl){return tl.short?pick(tl.short):SHORT[tl.id]?pick(SHORT[tl.id]):firstSentence(pick(tl.description));}
  // Menu & footer cuma memuat tools unggulan yang sudah bisa dipakai; sisanya di /tools.html
  function isMenuTool(tl){return tl.featured!==false&&tl.status!=='soon';}
  function toolBadge(tl){return tl.status==='beta'?' <em class="tb">'+esc(t('tool.beta'))+'</em>':'';}
  function orbClass(id,i){return ORB_KNOWN[id]?'o-'+id:'o-g'+(i%6);}
  function productPrice(p){
    if(lang==='en'&&p.priceUSD) return '$'+Number(p.priceUSD).toLocaleString('en-US');
    if(lang==='tr'&&p.priceTRY) return '₺'+Number(p.priceTRY).toLocaleString('tr-TR');
    return 'Rp '+Math.round(p.price||0).toLocaleString('id-ID');
  }
  function getJSON(u){return fetch(u,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}

  var CHEV='<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 4.5L6 7.5l3-3"/></svg>';
  var LOGO='<a class="logo" href="/"><img src="/images/favicon.svg" alt="" width="28" height="28">Founderku</a>';
  var BACK='<a class="nav-back" id="navBack" href="/" data-k-aria="nav.back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></a>';
  var X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // ---------- Pasang kerangka ----------
  // Bisa dipanggil ulang (FK.mount) untuk halaman aplikasi Next.js yang
  // pindah halaman tanpa memuat ulang browser.
  var cur=null;
  // Asisten AI (tombol chat di pojok kanan bawah), dimuat sekali
  function loadAI(){
    if(window.FKAI){window.FKAI.cek();return;}
    if(document.querySelector('script[data-fk-ai]'))return;
    var s=document.createElement('script');s.src='/assets/fk-ai.js';s.defer=true;s.setAttribute('data-fk-ai','1');document.body.appendChild(s);
  }
  // ---------- Tombol kembali ----------
  // Catat halaman sebelumnya di situs ini (per tab). Kalau ada, tombol
  // kembali memakai riwayat browser (posisi gulir ikut kembali). Kalau
  // halaman dibuka langsung dari luar, tombol ke halaman induknya.
  function isHome(p){return p==='/'||p==='/index.html';}
  function parentOf(p){
    p=p.replace(/\/+$/,'');
    if(/^\/tools\/[^/]+/.test(p))return '/tools.html';
    if(/^\/blog-post/.test(p))return '/blog.html';
    if(/^\/product/.test(p))return '/store.html';
    var i=p.lastIndexOf('/');return i>0?p.slice(0,i):'/';
  }
  function trail(){
    var curPath=location.pathname+location.search,prev='';
    try{var last=sessionStorage.getItem('fk-last');if(last!==curPath){sessionStorage.setItem('fk-prev',last||'');sessionStorage.setItem('fk-last',curPath);}prev=sessionStorage.getItem('fk-prev')||'';}catch{}
    return prev;
  }
  function wireBack(nav){
    var b=nav.querySelector('#navBack');if(!b)return;
    if(isHome(location.pathname)){b.remove();return;}
    var prev=trail();
    b.href=parentOf(location.pathname);
    b.addEventListener('click',function(e){
      var sameRef=document.referrer&&document.referrer.indexOf(location.origin+'/')===0;
      if((prev||sameRef)&&history.length>1){e.preventDefault();history.back();}
    });
  }
  function mount(){
  loadAI();
  var nav=document.querySelector('[data-fk-nav]:not([data-fk-done])');
  var foot=document.querySelector('[data-fk-foot]:not([data-fk-done])');
  if(nav){
    nav.setAttribute('data-fk-done','1');
    var oldSheet=document.getElementById('sheet'); if(oldSheet) oldSheet.remove();
    nav.innerHTML='<div class="nav-in">'+BACK+LOGO+
      '<ul class="menu" id="menu">'+
        '<li><button type="button" aria-expanded="false"><span data-k="nav.tools"></span> '+CHEV+'</button><div class="mega" id="megaTools"><div class="foot"><span data-k="mega.toolsFoot"></span><span style="display:flex;gap:6px"><a class="btn btn-line btn-sm" href="/tools.html" data-k="mega.allTools"></a><a class="btn btn-solid btn-sm" href="/harga" data-k="mega.seePricing"></a></span></div></div></li>'+
        '<li><button type="button" aria-expanded="false"><span data-k="nav.studio"></span> '+CHEV+'</button><div class="mega">'+
          '<a href="/#studio"><span class="orb o-brand"><i></i></span><span><b data-k="svc.brand"></b><small data-k="svc.brandD"></small></span></a>'+
          '<a href="/#studio"><span class="orb o-web"><i></i></span><span><b data-k="svc.web"></b><small data-k="svc.webD"></small></span></a>'+
          '<a href="/#studio"><span class="orb o-mvp"><i></i></span><span><b data-k="svc.mvp"></b><small data-k="svc.mvpD"></small></span></a>'+
          '<a class="wa-link" href="#"><span class="orb o-talk"><i></i></span><span><b data-k="svc.talk"></b><small data-k="svc.talkD"></small></span></a>'+
          '<div class="foot"><span data-k="mega.studioFoot"></span><a class="btn btn-line btn-sm" href="/case-studies.html" data-k="mega.cases"></a></div></div></li>'+
        '<li><button type="button" aria-expanded="false"><span data-k="nav.learn"></span> '+CHEV+'</button><div class="mega one">'+
          '<a href="/tools.html#mahasiswa"><span><b data-k="learn.students"></b><small data-k="learn.studentsD"></small></span></a>'+
          '<a href="/katalog.html"><span><b data-k="learn.catalog"></b><small data-k="learn.catalogD"></small></span></a>'+
          '<a href="/blog.html"><span><b data-k="learn.blog"></b><small data-k="learn.blogD"></small></span></a>'+
          '<a href="/case-studies.html"><span><b data-k="learn.cases"></b><small data-k="learn.casesD"></small></span></a></div></li>'+
        '<li><a href="/store.html" data-k="nav.starter"></a></li>'+
        '<li><a href="/social-space" data-track="tukarskill"><span data-k="nav.community"></span><span class="nb" data-k="nav.new"></span></a></li>'+
        '<li><a href="/harga" data-k="nav.pricing"></a></li>'+
      '</ul>'+
      '<div class="nav-right">'+
        '<div class="lang" id="lang"><button class="icon-btn" id="langBtn" type="button" data-k-aria="nav.lang" aria-haspopup="true" aria-expanded="false">ID</button>'+
          '<div class="lang-menu" role="menu"><button type="button" data-lang="id" role="menuitem">Indonesia</button><button type="button" data-lang="en" role="menuitem">English</button><button type="button" data-lang="tr" role="menuitem">Türkçe</button></div></div>'+
        '<button class="icon-btn" id="themeBtn" type="button" data-k-aria="nav.theme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>'+
        '<a class="btn btn-line btn-sm hide-m" id="navLogin" href="/masuk" data-k="nav.login"></a>'+
        '<a class="btn btn-solid btn-sm" id="navMain" href="/daftar" data-k="nav.signup"></a>'+
        '<button class="icon-btn burger" id="burger" type="button" data-k-aria="nav.menu" aria-expanded="false" aria-controls="sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h16M4 15h16"/></svg></button>'+
      '</div></div>';
    var sheet=document.createElement('div');
    sheet.className='sheet';sheet.id='sheet';sheet.setAttribute('aria-hidden','true');
    sheet.innerHTML='<div class="sheet-head">'+LOGO+'<button class="icon-btn" id="sheetClose" type="button" data-k-aria="nav.close">'+X+'</button></div>'+
      '<nav><details><summary><span data-k="nav.tools"></span><span aria-hidden="true">+</span></summary><div id="sheetTools"></div></details>'+
      '<details><summary><span data-k="nav.studio"></span><span aria-hidden="true">+</span></summary><div>'+
        '<a href="/#studio"><span class="orb o-brand"><i></i></span><span data-k="svc.brand"></span></a><a href="/#studio"><span class="orb o-web"><i></i></span><span data-k="svc.web"></span></a><a href="/#studio"><span class="orb o-mvp"><i></i></span><span data-k="svc.mvp"></span></a><a class="wa-link" href="#"><span class="orb o-talk"><i></i></span><span data-k="svc.talk"></span></a><a href="/case-studies.html"><span class="orb o-g4"><i></i></span><span data-k="mega.cases"></span></a>'+
      '</div></details>'+
      '<details><summary><span data-k="nav.learn"></span><span aria-hidden="true">+</span></summary><div><a href="/tools.html#mahasiswa" data-k="learn.students"></a><a href="/katalog.html" data-k="learn.catalog"></a><a href="/blog.html" data-k="learn.blog"></a><a href="/case-studies.html" data-k="learn.cases"></a></div></details>'+
      '<a href="/store.html"><span data-k="nav.starter"></span><span aria-hidden="true">→</span></a>'+
      '<a href="/social-space" data-track="tukarskill"><span><span data-k="nav.community"></span><span class="nb" data-k="nav.new"></span></span><span aria-hidden="true">→</span></a>'+
      '<a href="/harga"><span data-k="nav.pricing"></span><span aria-hidden="true">→</span></a></nav>'+
      '<div class="sheet-prefs"><span data-k="nav.prefs"></span><div><button type="button" data-lang="id">ID</button><button type="button" data-lang="en">EN</button><button type="button" data-lang="tr">TR</button><button type="button" class="sp-theme" id="sheetTheme" data-k-aria="nav.dark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/></svg></button></div></div>'+
      '<div class="btns"><a class="btn btn-solid" id="sheetMain" href="/daftar" data-k="sheet.signup"></a><a class="btn btn-line" id="sheetLogin" href="/masuk" data-k="nav.login"></a></div>';
    document.body.appendChild(sheet);
  }
  if(foot){
    foot.innerHTML='<div class="cols">'+
      '<div>'+LOGO+'<p style="margin-top:10px;color:var(--faint);max-width:28ch" data-k="footer.tag"></p></div>'+
      '<div><h5 data-k="nav.tools"></h5><ul id="footTools"></ul></div>'+
      '<div><h5 data-k="nav.studio"></h5><ul><li><a href="/#studio" data-k="svc.brand"></a></li><li><a href="/#studio" data-k="svc.web"></a></li><li><a href="/#studio" data-k="svc.mvp"></a></li><li><a href="/store.html">Founder Starterpack</a></li><li><a href="/#generator" data-k="gen.eyebrow"></a></li></ul></div>'+
      '<div><h5 data-k="nav.learn"></h5><ul><li><a href="/tools.html#mahasiswa" data-k="learn.students"></a></li><li><a href="/katalog.html" data-k="learn.catalog"></a></li><li><a href="/blog.html" data-k="learn.blog"></a></li><li><a href="/case-studies.html" data-k="learn.cases"></a></li><li><a href="/social-space" data-track="tukarskill" data-k="footer.community"></a></li></ul></div>'+
      '<div><h5 data-k="footer.company"></h5><ul><li><a href="/harga" data-k="nav.pricing"></a></li><li><a href="/syarat" data-k="footer.terms"></a></li><li><a href="/privasi" data-k="footer.privacy"></a></li><li><a href="https://www.instagram.com/andiarwy/" target="_blank" rel="noopener">Instagram</a></li></ul></div>'+
      '</div><div class="legal"><span data-k="footer.copy"></span><span>Istanbul · Indonesia</span></div>';
  }
  if(foot) foot.setAttribute('data-fk-done','1');
  if(nav){
    var lis=[].slice.call(nav.querySelectorAll('#menu > li'));
    var closeMenus=function(except){lis.forEach(function(o){if(o!==except){o.classList.remove('open');var ob=o.querySelector('button');if(ob)ob.setAttribute('aria-expanded','false');}});};
    lis.forEach(function(li){
      var b=li.querySelector('button'); if(!b) return; var tm;
      li.addEventListener('mouseenter',function(){clearTimeout(tm);closeMenus(li);li.classList.add('open');b.setAttribute('aria-expanded','true');});
      li.addEventListener('mouseleave',function(){tm=setTimeout(function(){li.classList.remove('open');b.setAttribute('aria-expanded','false');},150);});
      b.addEventListener('click',function(){var o=!li.classList.contains('open');closeMenus(li);li.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));});
    });
    var langWrap=document.getElementById('lang');
    document.getElementById('langBtn').addEventListener('click',function(){var o=langWrap.classList.toggle('open');this.setAttribute('aria-expanded',String(o));});
    [].slice.call(langWrap.querySelectorAll('[data-lang]')).concat([].slice.call(document.querySelectorAll('#sheet [data-lang]'))).forEach(function(b){b.addEventListener('click',function(){
      lang=b.dataset.lang;try{localStorage.setItem('fk-lang',lang);}catch{}langWrap.classList.remove('open');run();
      try{window.dispatchEvent(new CustomEvent('fk:lang',{detail:lang}));}catch{}
    });});
    var toggleTheme=function(){
      var dark=root.getAttribute('data-theme')==='dark'||(!root.getAttribute('data-theme')&&window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next=dark?'light':'dark';root.setAttribute('data-theme',next);try{localStorage.setItem('fk-theme',next);}catch{}
    };
    document.getElementById('themeBtn').addEventListener('click',toggleTheme);
    document.getElementById('sheetTheme').addEventListener('click',toggleTheme);
    wireBack(nav);
    var sheetEl=document.getElementById('sheet'),burger=document.getElementById('burger');
    var closeSheet=function(){sheetEl.classList.remove('show');sheetEl.setAttribute('aria-hidden','true');burger.setAttribute('aria-expanded','false');};
    burger.addEventListener('click',function(){sheetEl.classList.add('show');sheetEl.setAttribute('aria-hidden','false');burger.setAttribute('aria-expanded','true');});
    document.getElementById('sheetClose').addEventListener('click',closeSheet);
    sheetEl.addEventListener('click',function(e){if(e.target.closest('a'))closeSheet();});
    cur={closeMenus:closeMenus,closeSheet:closeSheet,langWrap:langWrap,nav:nav};
  }
  applyShell();
  }
  // Listener global cukup sekali, selalu memakai nav yang sedang tampil
  window.addEventListener('scroll',function(){if(cur)cur.nav.classList.toggle('scrolled',window.scrollY>8);},{passive:true});
  document.addEventListener('click',function(e){if(!cur)return;if(!e.target.closest('#menu'))cur.closeMenus();if(!e.target.closest('#lang'))cur.langWrap.classList.remove('open');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&cur){cur.closeMenus();cur.closeSheet();cur.langWrap.classList.remove('open');}});

  // ---------- Isi teks & data ----------
  function renderTools(){
    var mega=document.getElementById('megaTools'); if(!mega) return;
    var f=mega.querySelector('.foot'), list=st.tools.filter(isMenuTool);
    [].slice.call(mega.querySelectorAll('a.ti')).forEach(function(a){a.remove();});
    list.forEach(function(tl,i){var a=document.createElement('a');a.className='ti';a.href=toolHref(tl);
      a.innerHTML='<span class="orb '+orbClass(tl.id,i)+'"><i></i></span><span><b>'+esc(tl.name)+toolBadge(tl)+'</b><small>'+esc(toolShort(tl))+'</small></span>';mega.insertBefore(a,f);});
    var sh=document.getElementById('sheetTools');
    if(sh) sh.innerHTML=list.map(function(tl,i){return '<a href="'+esc(toolHref(tl))+'"><span class="orb '+orbClass(tl.id,i)+'"><i></i></span>'+esc(tl.name)+'</a>';}).join('')+'<a class="all" href="/tools.html">'+esc(t('tool.all'))+' ('+st.tools.length+')</a>';
    var ft=document.getElementById('footTools');
    if(ft) ft.innerHTML=list.map(function(tl){return '<li><a href="'+esc(toolHref(tl))+'">'+esc(tl.name)+'</a></li>';}).join('')+'<li><a href="/tools.html">'+esc(t('tool.all'))+'</a></li>';
  }

  function applyShell(){
    root.setAttribute('lang',lang);
    document.querySelectorAll('[data-k]').forEach(function(el){var v=t(el.getAttribute('data-k'));if(v!=='')setText(el,v);});
    document.querySelectorAll('[data-k-aria]').forEach(function(el){el.setAttribute('aria-label',t(el.getAttribute('data-k-aria')));});
    var lb=document.getElementById('langBtn'); if(lb) lb.textContent=lang.toUpperCase();
    document.querySelectorAll('.lang-menu [data-lang], .sheet-prefs [data-lang]').forEach(function(b){b.setAttribute('aria-current',String(b.dataset.lang===lang));});
    document.querySelectorAll('.wa-link').forEach(function(a){a.href=waHref();a.target='_blank';a.rel='noopener';});
    if(st.loggedIn){
      var m=document.getElementById('navMain'); if(m){m.href='/akun';m.textContent=t('nav.account');}
      var l=document.getElementById('navLogin'); if(l) l.hidden=true;
      var sm=document.getElementById('sheetMain'); if(sm){sm.href='/akun';sm.textContent=t('nav.account');}
      var sl2=document.getElementById('sheetLogin'); if(sl2) sl2.hidden=true;
    }
    renderTools();
  }
  function run(){applyShell();subs.forEach(function(fn){try{fn(lang);}catch(e){console.error(e);}});}

  // Teks halaman: elemen [data-t] diisi dari kamus halaman {id:{},en:{},tr:{}}
  function apply(dict){
    var d=dict[lang]||dict.id, get=function(k){var v=d[k];if(v==null)v=dict.id[k];return v==null?'':fill(v);};
    document.querySelectorAll('[data-t]').forEach(function(el){var v=get(el.getAttribute('data-t'));if(v!=='')setText(el,v);});
    document.querySelectorAll('[data-t-aria]').forEach(function(el){el.setAttribute('aria-label',get(el.getAttribute('data-t-aria')));});
    if(d.title) document.title=d.title;
    return get;
  }


  // Muncul saat scroll (tanpa JS tetap tampil)
  var io=null;
  function reveal(){
    if(!('IntersectionObserver' in window)||reduce) return;
    if(!io) io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var el=e.target;if(!el.parentNode){io.unobserve(el);return;}var i=[].slice.call(el.parentNode.children).indexOf(el);el.style.transitionDelay=(Math.min(i,5)*60)+'ms';el.classList.remove('pre');io.unobserve(el);}});},{rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.rv:not([data-rv])').forEach(function(el){el.setAttribute('data-rv','1');if(el.getBoundingClientRect().top>window.innerHeight*0.95)el.classList.add('pre');io.observe(el);});
  }
  // Scroll cepat bisa melompati elemen; yang sudah terlewat langsung ditampilkan
  window.addEventListener('scroll',function(){
    document.querySelectorAll('.rv.pre').forEach(function(el){if(el.getBoundingClientRect().top<window.innerHeight){el.classList.remove('pre');if(io)io.unobserve(el);}});
  },{passive:true});

  window.FK={
    get lang(){return lang;}, state:st, mount:mount,
    t:t, esc:esc, pick:pick, pickArr:pickArr, setText:setText, firstSentence:firstSentence,
    wa:waHref, safeUrl:safeUrl, price:productPrice, json:getJSON, reveal:reveal, apply:apply,
    toolHref:toolHref, toolShort:toolShort, orbClass:orbClass, isMenuTool:isMenuTool,
    onLang:function(fn){subs.push(fn);try{fn(lang);}catch(e){console.error(e);}}
  };

  mount();
  if(cur) cur.nav.classList.toggle('scrolled',window.scrollY>8);
  getJSON('/data/tools.json').then(function(d){st.tools=(d.tools||[]).slice().sort(function(a,b){return (a.order||99)-(b.order||99);});renderTools();}).catch(function(){});
  getJSON('/data/pricing.json').then(function(d){if(d&&d.trialDays){st.days=d.trialDays;run();}}).catch(function(){});
  fetch('/api/me',{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(me){
    if(me&&me.loggedIn){st.loggedIn=true;st.name=me.name||null;run();}
  }).catch(function(){});
  // Hitung klik ke TukarSkill (Dashboard admin), tanpa data pribadi
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-track]');if(!a)return;
    try{var body=JSON.stringify({tool:a.getAttribute('data-track')});if(navigator.sendBeacon)navigator.sendBeacon('/api/track',new Blob([body],{type:'application/json'}));else fetch('/api/track',{method:'POST',headers:{'content-type':'application/json'},body:body,keepalive:true});}catch{}});
})();
