/* Asisten AI Founderku: tombol chat di pojok kanan bawah semua halaman.
   Jawaban dari Google Gemini lewat /api/ai/chat (server). Harus login,
   jatah per hari. Percakapan cuma disimpan di tab browser ini
   (sessionStorage), tidak di server. */
(function () {
  if (window.FKAI) return;

  // Tidak tampil di admin, halaman login/daftar, dan halaman jualan penjual
  var KECUALI = /^\/(admin\.html|masuk|daftar|auth|l\/|toko\/)/;
  var SIMPAN = "fk-ai-chat-v1";

  var T = {
    id: {
      buka: "Tanya AI", judul: "Asisten Founderku", tutup: "Tutup", hapus: "Hapus percakapan",
      halo: "Halo! Aku bisa bantu soal usahamu: ide jualan, menentukan harga, keuangan, sampai membangun startup. Mau mulai dari mana?",
      saran: ["Tool apa yang cocok untuk usahaku?", "Cara menentukan harga jual", "Ide promosi dengan modal kecil"],
      ketik: "Tulis pertanyaanmu...", kirim: "Kirim",
      catatan: "Jawaban AI bisa keliru. Jangan kirim data pribadi. Diproses oleh layanan AI Google Gemini atau Groq.", privasi: "Privasi",
      sisa: "Sisa {n} dari {m} pertanyaan hari ini",
      login: "Masuk dulu untuk mulai tanya. Gratis, dapat {n} pertanyaan per hari.", masuk: "Masuk", daftar: "Daftar gratis",
      mati: "Asisten AI belum aktif. Coba lagi nanti ya.",
      habis: "Jatah pertanyaan hari ini sudah habis. Besok terisi lagi.", habisFree: "Akun trial dan Pro dapat {n} pertanyaan per hari.", lihatHarga: "Lihat Founderku Pro",
      sibuk: "AI sedang ramai. Coba lagi sebentar lagi ya.", blokir: "Maaf, pertanyaan ini tidak bisa aku jawab. Coba tanyakan dengan cara lain.",
      gagal: "Koneksi bermasalah. Coba kirim lagi.", mengetik: "Asisten sedang mengetik"
    },
    en: {
      buka: "Ask AI", judul: "Founderku Assistant", tutup: "Close", hapus: "Clear chat",
      halo: "Hi! I can help with your business: sales ideas, pricing, finance, all the way to building a startup. Where do you want to start?",
      saran: ["Which tool fits my business?", "How to set a selling price", "Low-budget promotion ideas"],
      ketik: "Type your question...", kirim: "Send",
      catatan: "AI answers can be wrong. Do not send personal data. Processed by Google Gemini or Groq AI services.", privasi: "Privacy",
      sisa: "{n} of {m} questions left today",
      login: "Sign in to start asking. Free, {n} questions per day.", masuk: "Sign in", daftar: "Sign up free",
      mati: "The AI assistant is not active yet. Please try again later.",
      habis: "You have used today's questions. They refill tomorrow.", habisFree: "Trial and Pro accounts get {n} questions per day.", lihatHarga: "See Founderku Pro",
      sibuk: "The AI is busy right now. Please try again shortly.", blokir: "Sorry, I can't answer that. Try asking another way.",
      gagal: "Connection problem. Please send again.", mengetik: "Assistant is typing"
    },
    tr: {
      buka: "Yapay zekaya sor", judul: "Founderku Asistanı", tutup: "Kapat", hapus: "Sohbeti temizle",
      halo: "Merhaba! İşin için yardım edebilirim: satış fikirleri, fiyatlandırma, finans ve girişim kurma. Nereden başlamak istersin?",
      saran: ["İşime hangi araç uygun?", "Satış fiyatı nasıl belirlenir", "Düşük bütçeli tanıtım fikirleri"],
      ketik: "Sorunu yaz...", kirim: "Gönder",
      catatan: "Yapay zeka yanılabilir. Kişisel veri gönderme. Google Gemini veya Groq ile işlenir.", privasi: "Gizlilik",
      sisa: "Bugün {m} sorudan {n} kaldı",
      login: "Sormak için giriş yap. Ücretsiz, günde {n} soru.", masuk: "Giriş yap", daftar: "Ücretsiz kaydol",
      mati: "Yapay zeka asistanı henüz aktif değil. Lütfen sonra tekrar dene.",
      habis: "Bugünkü soru hakkın bitti. Yarın yenilenir.", habisFree: "Deneme ve Pro hesaplar günde {n} soru alır.", lihatHarga: "Founderku Pro'yu gör",
      sibuk: "Yapay zeka şu an yoğun. Birazdan tekrar dene.", blokir: "Üzgünüm, bunu yanıtlayamam. Başka şekilde sormayı dene.",
      gagal: "Bağlantı sorunu. Tekrar gönder.", mengetik: "Asistan yazıyor"
    }
  };
  var LIMIT_FREE = 5, LIMIT_PRO = 30;

  function bahasa() {
    var l = null;
    try { l = localStorage.getItem("fk-lang"); } catch { /* abaikan */ }
    if (l !== "en" && l !== "tr" && l !== "id") l = document.documentElement.getAttribute("lang");
    return l === "en" || l === "tr" ? l : "id";
  }
  function t(k) { return T[bahasa()][k]; }
  function isi(s, n, m) { return String(s).replace("{n}", n).replace("{m}", m); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  // Jawaban AI: teks biasa (di-escape), lalu tebal, link aman, dan daftar
  function tautanAman(u) {
    return /^\/(?!\/)[^\s<>"']*$/.test(u) || /^https:\/\/(www\.)?founderku\.com(\/[^\s<>"']*)?$/.test(u);
  }
  function inline(s) {
    s = esc(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    s = s.replace(/\[([^\]]{1,80})\]\(([^)\s]{1,200})\)/g, function (m, teks, url) {
      var u = url.replace(/&amp;/g, "&");
      return tautanAman(u) ? '<a href="' + esc(u) + '">' + teks + "</a>" : teks;
    });
    return s;
  }
  function render(teks) {
    var baris = String(teks).split(/\n/), out = [], daftar = null;
    function tutupDaftar() { if (daftar) { out.push("</" + daftar + ">"); daftar = null; } }
    baris.forEach(function (b) {
      var x = b.trim(), m;
      if (!x) { tutupDaftar(); return; }
      if ((m = x.match(/^[-*]\s+(.*)$/))) {
        if (daftar !== "ul") { tutupDaftar(); out.push("<ul>"); daftar = "ul"; }
        out.push("<li>" + inline(m[1]) + "</li>");
      } else if ((m = x.match(/^\d+[.)]\s+(.*)$/))) {
        if (daftar !== "ol") { tutupDaftar(); out.push("<ol>"); daftar = "ol"; }
        out.push("<li>" + inline(m[1]) + "</li>");
      } else {
        tutupDaftar();
        out.push("<p>" + inline(x.replace(/^#{1,4}\s+/, "")) + "</p>");
      }
    });
    tutupDaftar();
    return out.join("");
  }

  var CSS =
    ".fkai{--ai-bg:#fff;--ai-panel:#f4f3f8;--ai-text:#1a1730;--ai-soft:rgba(26,23,48,.68);--ai-faint:rgba(26,23,48,.5);--ai-line:rgba(26,23,48,.12);--ai-btn:#1a1730;--ai-btn-t:#fff;--ai-me:#1a1730;--ai-me-t:#fff;font-family:Poppins,system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ai-text)}" +
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .fkai{--ai-bg:#1c1a2e;--ai-panel:#26233b;--ai-text:#f3f2f8;--ai-soft:rgba(243,242,248,.72);--ai-faint:rgba(243,242,248,.5);--ai-line:rgba(255,255,255,.12);--ai-btn:#f3f2f8;--ai-btn-t:#1a1730;--ai-me:#f2a93e;--ai-me-t:#1a1730}}" +
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .fkai-beta{color:#f5c16e}}:root[data-theme=dark] .fkai-beta{color:#f5c16e}" +
    ":root[data-theme=dark] .fkai{--ai-bg:#1c1a2e;--ai-panel:#26233b;--ai-text:#f3f2f8;--ai-soft:rgba(243,242,248,.72);--ai-faint:rgba(243,242,248,.5);--ai-line:rgba(255,255,255,.12);--ai-btn:#f3f2f8;--ai-btn-t:#1a1730;--ai-me:#f2a93e;--ai-me-t:#1a1730}" +
    ".fkai *{box-sizing:border-box}" +
    ".fkai-fab{position:fixed;right:20px;bottom:20px;z-index:900;display:inline-flex;align-items:center;gap:8px;height:52px;padding:0 20px 0 16px;border-radius:999px;border:0;background:var(--ai-btn);color:var(--ai-btn-t);font:500 15px/1 inherit;font-family:inherit;cursor:pointer;box-shadow:0 14px 30px -12px rgba(14,12,26,.55);transition:transform .2s}" +
    ".fkai-fab:hover{transform:translateY(-2px)}.fkai-fab svg{width:22px;height:22px;flex-shrink:0}" +
    ".fkai-panel{position:fixed;right:20px;bottom:20px;z-index:901;width:390px;max-width:calc(100vw - 32px);height:min(620px,calc(100vh - 40px));display:flex;flex-direction:column;background:var(--ai-bg);border:1px solid var(--ai-line);border-radius:24px;box-shadow:0 30px 70px -30px rgba(14,12,26,.6);overflow:hidden}" +
    ".fkai-panel[hidden],.fkai-fab[hidden]{display:none}" +
    ".fkai-head{display:flex;align-items:center;gap:8px;padding:14px 12px 14px 18px;border-bottom:1px solid var(--ai-line)}" +
    ".fkai-head b{font-size:16px;font-weight:600;letter-spacing:-.02em;flex:1;min-width:0}" +
    ".fkai-beta{font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:rgba(242,169,62,.2);color:#9a5f0c;margin-left:6px;vertical-align:2px}" +
    ".fkai-ic{width:36px;height:36px;border-radius:50%;border:1px solid var(--ai-line);background:transparent;color:var(--ai-soft);display:grid;place-items:center;cursor:pointer}.fkai-ic:hover{color:var(--ai-text)}.fkai-ic svg{width:17px;height:17px}" +
    ".fkai-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}" +
    ".fkai-msg{max-width:88%;padding:10px 14px;border-radius:18px;font-size:14.5px;line-height:1.6;overflow-wrap:anywhere}" +
    ".fkai-msg p{margin:0 0 8px}.fkai-msg p:last-child{margin:0}.fkai-msg ul,.fkai-msg ol{margin:4px 0 8px;padding-left:20px}.fkai-msg ul{list-style:disc}.fkai-msg ol{list-style:decimal}.fkai-msg li{margin:2px 0}.fkai-msg a{color:inherit;text-decoration:underline;font-weight:500}" +
    ".fkai-bot{align-self:flex-start;background:var(--ai-panel);border-bottom-left-radius:6px}" +
    ".fkai-me{align-self:flex-end;background:var(--ai-me);color:var(--ai-me-t);border-bottom-right-radius:6px;white-space:pre-wrap}" +
    ".fkai-info{align-self:stretch;font-size:13.5px;color:var(--ai-soft);background:transparent;border:1px dashed var(--ai-line);border-radius:14px;padding:10px 12px}" +
    ".fkai-info a{color:var(--ai-text);font-weight:500}" +
    ".fkai-chips{display:flex;flex-wrap:wrap;gap:6px}.fkai-chips button{border:1px solid var(--ai-line);background:var(--ai-bg);color:var(--ai-text);font:inherit;font-size:13px;padding:8px 12px;border-radius:999px;cursor:pointer;text-align:left}.fkai-chips button:hover{border-color:var(--ai-soft)}" +
    ".fkai-cta{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.fkai-cta a{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;border:1px solid var(--ai-line);color:var(--ai-text)}.fkai-cta a.solid{background:var(--ai-btn);color:var(--ai-btn-t);border-color:var(--ai-btn)}" +
    ".fkai-dots{display:inline-flex;gap:4px;padding:4px 0}.fkai-dots i{width:7px;height:7px;border-radius:50%;background:var(--ai-faint);animation:fkaiB 1s infinite}.fkai-dots i:nth-child(2){animation-delay:.15s}.fkai-dots i:nth-child(3){animation-delay:.3s}" +
    "@keyframes fkaiB{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}" +
    ".fkai-foot{border-top:1px solid var(--ai-line);padding:10px 12px 10px}" +
    ".fkai-row{display:flex;gap:8px;align-items:flex-end}" +
    ".fkai-row textarea{flex:1;resize:none;min-height:44px;max-height:130px;padding:11px 14px;border-radius:16px;border:1px solid var(--ai-line);background:var(--ai-panel);color:var(--ai-text);font:inherit;font-size:16px;line-height:1.4}" +
    ".fkai-row textarea:focus{outline:2px solid #f2a93e;outline-offset:1px;border-color:transparent}" +
    ".fkai-send{width:44px;height:44px;flex-shrink:0;border-radius:50%;border:0;background:var(--ai-btn);color:var(--ai-btn-t);display:grid;place-items:center;cursor:pointer}.fkai-send:disabled{opacity:.4;cursor:not-allowed}.fkai-send svg{width:18px;height:18px}" +
    ".fkai-note{font-size:11.5px;color:var(--ai-faint);margin-top:8px;line-height:1.45}.fkai-note a{color:inherit;text-decoration:underline}.fkai-quota{font-weight:500;color:var(--ai-soft)}" +
    ".fkai-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}" +
    "@media (max-width:600px){.fkai-fab{right:16px;bottom:16px;height:50px;padding:0 16px 0 14px}.fkai-panel{right:0;left:0;bottom:0;width:100%;max-width:none;height:88vh;height:88dvh;border-radius:22px 22px 0 0;border-bottom:0}}" +
    "@media print{.fkai{display:none!important}}";

  var IKON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z"/><path d="M8.5 8.5h7M8.5 11.5h4.5"/></svg>';
  var IKON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var IKON_HAPUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';
  var IKON_KIRIM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';

  var root, fab, panel, body, input, sendBtn, noteEl, status = null, pesan = [], sibuk = false, info = null;

  function muat() { try { var a = JSON.parse(sessionStorage.getItem(SIMPAN) || "[]"); if (Array.isArray(a)) pesan = a.filter(function (m) { return m && (m.role === "user" || m.role === "model") && typeof m.text === "string"; }).slice(-30); } catch { /* abaikan */ } }
  function simpan() { try { sessionStorage.setItem(SIMPAN, JSON.stringify(pesan.slice(-30))); } catch { /* abaikan */ } }

  function linkMasuk(jalur) { return "/" + jalur + "?next=" + encodeURIComponent(location.pathname + location.search); }

  function gambar() {
    if (!root) return;
    fab.querySelector("span").textContent = t("buka");
    fab.setAttribute("aria-label", t("buka"));
    panel.setAttribute("aria-label", t("judul"));
    panel.querySelector(".fkai-title").textContent = t("judul");
    panel.querySelector("[data-a=tutup]").setAttribute("aria-label", t("tutup"));
    panel.querySelector("[data-a=tutup]").title = t("tutup");
    panel.querySelector("[data-a=hapus]").setAttribute("aria-label", t("hapus"));
    panel.querySelector("[data-a=hapus]").title = t("hapus");
    input.placeholder = t("ketik");
    input.setAttribute("aria-label", t("ketik"));
    sendBtn.setAttribute("aria-label", t("kirim"));

    var h = '<div class="fkai-msg fkai-bot">' + render(t("halo")) + "</div>";
    if (!pesan.length && status && status.loggedIn && status.enabled) {
      h += '<div class="fkai-chips">' + t("saran").map(function (s) { return '<button type="button">' + esc(s) + "</button>"; }).join("") + "</div>";
    }
    pesan.forEach(function (m) {
      h += '<div class="fkai-msg ' + (m.role === "user" ? "fkai-me" : "fkai-bot") + '">' + (m.role === "user" ? esc(m.text) : render(m.text)) + "</div>";
    });
    if (status && !status.enabled) h += '<div class="fkai-info">' + esc(t("mati")) + "</div>";
    else if (status && !status.loggedIn) {
      h += '<div class="fkai-info">' + esc(isi(t("login"), LIMIT_FREE)) + '<div class="fkai-cta"><a class="solid" href="' + linkMasuk("daftar") + '">' + esc(t("daftar")) + '</a><a href="' + linkMasuk("masuk") + '">' + esc(t("masuk")) + "</a></div></div>";
    }
    if (info) h += '<div class="fkai-info">' + info + "</div>";
    if (sibuk) h += '<div class="fkai-msg fkai-bot"><span class="fkai-dots" role="status" aria-label="' + esc(t("mengetik")) + '"><i></i><i></i><i></i></span></div>';
    body.innerHTML = h;
    body.querySelectorAll(".fkai-chips button").forEach(function (b) { b.addEventListener("click", function () { kirim(b.textContent); }); });
    body.scrollTop = body.scrollHeight;

    var bisa = !!(status && status.enabled && status.loggedIn);
    input.disabled = !bisa;
    sendBtn.disabled = !bisa || sibuk || !input.value.trim();
    var q = status && status.loggedIn && typeof status.remaining === "number" ? '<span class="fkai-quota">' + esc(isi(t("sisa"), status.remaining, status.limit)) + "</span> · " : "";
    noteEl.innerHTML = q + esc(t("catatan")) + ' <a href="/privasi">' + esc(t("privasi")) + "</a>";
  }

  function ambilStatus(cb) {
    fetch("/api/ai/chat", { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : { enabled: false, loggedIn: false }; })
      .then(function (s) { status = s; gambar(); if (cb) cb(); })
      .catch(function () { status = { enabled: false, loggedIn: false }; gambar(); });
  }

  function kirim(teks) {
    teks = String(teks || "").trim().slice(0, 1500);
    if (!teks || sibuk || !status || !status.loggedIn || !status.enabled) return;
    info = null;
    pesan.push({ role: "user", text: teks });
    simpan();
    input.value = "";
    tinggi();
    sibuk = true;
    gambar();
    fetch("/api/ai/chat", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: pesan.slice(-8), lang: bahasa(), page: location.pathname })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (x) {
        sibuk = false;
        if (typeof x.j.remaining === "number") { status.remaining = x.j.remaining; status.limit = x.j.limit || status.limit; }
        if (x.s === 200 && x.j.text) {
          pesan.push({ role: "model", text: x.j.text });
          simpan();
        } else {
          // Pertanyaan yang gagal dijawab dibuang dari riwayat supaya bisa dikirim ulang
          pesan.pop();
          simpan();
          input.value = teks;
          if (x.s === 401) { status.loggedIn = false; }
          else if (x.s === 429) {
            info = esc(t("habis")) + (status.plan === "pro" ? "" : ' <br>' + esc(isi(t("habisFree"), LIMIT_PRO)) + ' <a href="/harga">' + esc(t("lihatHarga")) + "</a>");
          } else if (x.s === 503 && x.j.error === "belum_aktif") { status.enabled = false; }
          else info = esc(x.s === 422 ? t("blokir") : x.s === 503 ? t("sibuk") : t("gagal"));
        }
        gambar();
      })
      .catch(function () {
        sibuk = false; pesan.pop(); simpan(); input.value = teks; info = esc(t("gagal")); gambar();
      });
  }

  function tinggi() { input.style.height = "auto"; input.style.height = Math.min(130, input.scrollHeight) + "px"; }

  function buka() {
    panel.hidden = false; fab.hidden = true;
    gambar();
    var fokus = function () { if (!input.disabled) input.focus(); else panel.querySelector("[data-a=tutup]").focus(); };
    if (!status) ambilStatus(fokus);
    else fokus();
  }
  function tutup() { panel.hidden = true; fab.hidden = false; fab.focus(); }

  function pasang() {
    if (root || KECUALI.test(location.pathname)) return;
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
    root = document.createElement("div");
    root.className = "fkai";
    root.innerHTML =
      '<button type="button" class="fkai-fab">' + IKON_CHAT + "<span></span></button>" +
      '<section class="fkai-panel" role="dialog" aria-modal="false" hidden>' +
      '<div class="fkai-head"><b><span class="fkai-title"></span><span class="fkai-beta">Beta</span></b>' +
      '<button type="button" class="fkai-ic" data-a="hapus">' + IKON_HAPUS + '</button><button type="button" class="fkai-ic" data-a="tutup">' + IKON_X + "</button></div>" +
      '<div class="fkai-body" aria-live="polite"></div>' +
      '<div class="fkai-foot"><form class="fkai-row"><textarea rows="1" maxlength="1500"></textarea><button type="submit" class="fkai-send">' + IKON_KIRIM + '</button></form><div class="fkai-note"></div></div>' +
      "</section>";
    document.body.appendChild(root);
    fab = root.querySelector(".fkai-fab");
    panel = root.querySelector(".fkai-panel");
    body = root.querySelector(".fkai-body");
    input = root.querySelector("textarea");
    sendBtn = root.querySelector(".fkai-send");
    noteEl = root.querySelector(".fkai-note");
    muat();
    fab.addEventListener("click", buka);
    panel.querySelector("[data-a=tutup]").addEventListener("click", tutup);
    panel.querySelector("[data-a=hapus]").addEventListener("click", function () { pesan = []; info = null; simpan(); gambar(); input.focus(); });
    root.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); kirim(input.value); });
    input.addEventListener("input", function () { tinggi(); sendBtn.disabled = sibuk || !input.value.trim() || input.disabled; });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); kirim(input.value); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) tutup(); });
    // Ikut bahasa yang dipilih di navigasi
    window.addEventListener("fk:lang", gambar);
    new MutationObserver(gambar).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    gambar();
  }

  // Dipanggil ulang saat pindah halaman di aplikasi (FK.mount)
  function cek() {
    if (KECUALI.test(location.pathname)) { if (root) root.style.display = "none"; return; }
    if (!root) pasang(); else root.style.display = "";
  }

  window.FKAI = { cek: cek };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", cek);
  else cek();
})();
