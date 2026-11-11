(()=>{// Shared "still working" UI for our YouTube converter sites (added 2026-11-11, frontend only).
// While #yt-result is in data-state="loading": staged messages + a time-based % bar, because a lookup can take
// long when YouTube makes the backend retry. After a Download tap on a normal link: "Preparing 1080p… keep this
// page open" for 15 s (HD files are built on the server before the browser starts saving).
// Works on any page that has #yt-result with a .loading child; needs no changes to the converter script.

                                                              
const P                    = {
  en: { s2: "Finding every quality: 1080p, 720p, MP3…", s3: "YouTube is slow right now, still working on it…", s4: "Almost done, preparing your download links…", prep: "Preparing {q}… keep this page open" },
  pl: { s2: "Szukam wszystkich jakości: 1080p, 720p, MP3…", s3: "YouTube teraz zwalnia, nadal pracuję…", s4: "Prawie gotowe, przygotowuję linki…", prep: "Przygotowuję {q}… nie zamykaj strony" },
  es: { s2: "Buscando todas las calidades: 1080p, 720p, MP3…", s3: "YouTube va lento ahora, seguimos trabajando…", s4: "Casi listo, preparando tus enlaces…", prep: "Preparando {q}… no cierres esta página" },
  pt: { s2: "Buscando todas as qualidades: 1080p, 720p, MP3…", s3: "O YouTube está lento agora, ainda trabalhando…", s4: "Quase pronto, preparando seus links…", prep: "Preparando {q}… mantenha esta página aberta" },
  fr: { s2: "Recherche de toutes les qualités : 1080p, 720p, MP3…", s3: "YouTube est lent en ce moment, on continue…", s4: "Presque fini, préparation de vos liens…", prep: "Préparation de {q}… gardez cette page ouverte" },
  de: { s2: "Alle Qualitäten werden gesucht: 1080p, 720p, MP3…", s3: "YouTube ist gerade langsam, wir arbeiten noch…", s4: "Fast fertig, Download-Links werden erstellt…", prep: "{q} wird vorbereitet… Seite bitte offen lassen" },
  it: { s2: "Cerco tutte le qualità: 1080p, 720p, MP3…", s3: "YouTube è lento in questo momento, sto ancora lavorando…", s4: "Quasi fatto, preparo i link di download…", prep: "Preparo {q}… tieni aperta la pagina" },
  ru: { s2: "Ищем все качества: 1080p, 720p, MP3…", s3: "YouTube сейчас отвечает медленно, продолжаем…", s4: "Почти готово, готовим ссылки…", prep: "Готовим {q}… не закрывайте страницу" },
  tr: { s2: "Tüm kaliteler aranıyor: 1080p, 720p, MP3…", s3: "YouTube şu an yavaş, hâlâ çalışıyoruz…", s4: "Neredeyse bitti, indirme bağlantıları hazırlanıyor…", prep: "{q} hazırlanıyor… sayfayı kapatmayın" },
  id: { s2: "Mencari semua kualitas: 1080p, 720p, MP3…", s3: "YouTube sedang lambat, masih diproses…", s4: "Hampir selesai, menyiapkan link unduhan…", prep: "Menyiapkan {q}… jangan tutup halaman ini" },
  vi: { s2: "Đang tìm mọi chất lượng: 1080p, 720p, MP3…", s3: "YouTube đang chậm, chúng tôi vẫn đang xử lý…", s4: "Sắp xong, đang chuẩn bị liên kết tải…", prep: "Đang chuẩn bị {q}… đừng đóng trang này" },
  hi: { s2: "सभी क्वालिटी खोजी जा रही हैं: 1080p, 720p, MP3…", s3: "YouTube अभी धीमा है, काम जारी है…", s4: "लगभग हो गया, डाउनलोड लिंक तैयार हो रहे हैं…", prep: "{q} तैयार हो रहा है… यह पेज खुला रखें" },
  ar: { s2: "جارٍ البحث عن كل الجودات: 1080p و720p وMP3…", s3: "يوتيوب بطيء الآن، ما زلنا نعمل…", s4: "اقتربنا، نجهّز روابط التنزيل…", prep: "جارٍ تجهيز {q}… أبقِ هذه الصفحة مفتوحة" },
  ja: { s2: "すべての画質を確認中：1080p、720p、MP3…", s3: "YouTubeの応答が遅れています。処理を続けています…", s4: "もうすぐ完了、ダウンロードリンクを準備中…", prep: "{q}を準備中… このページを開いたままにしてください" },
  th: { s2: "กำลังค้นหาทุกความละเอียด: 1080p, 720p, MP3…", s3: "YouTube ช้าอยู่ตอนนี้ กำลังดำเนินการต่อ…", s4: "ใกล้เสร็จแล้ว กำลังเตรียมลิงก์ดาวน์โหลด…", prep: "กำลังเตรียม {q}… โปรดเปิดหน้านี้ไว้" },
};

function initProgressUI()       {
  const card = document.getElementById("yt-result") || document.getElementById("res");
  const loading = card?.querySelector             (".loading");
  if (!card || !loading || card.dataset.pg) return;
  card.dataset.pg = "1";
  card.classList.add("pg-card");
  const lang = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
  const t = P[lang] ?? P.en;

  const css = document.createElement("style");
  css.textContent =
    ".pg-card .pg-bar{display:none;height:6px;margin:4px 14px 10px;border-radius:99px;overflow:hidden;background:rgba(127,127,127,.18)}" +
    ".pg-card .pg-bar i{display:block;width:0;height:100%;border-radius:99px;background:currentColor;opacity:.75;transition:width .25s linear}" +
    '.pg-card[data-state="loading"] .pg-bar{display:block}';
  document.head.append(css);
  const bar = document.createElement("div");
  bar.className = "pg-bar";
  bar.setAttribute("aria-hidden", "true");
  bar.append(document.createElement("i"));
  loading.after(bar);

  // The element whose text we change: .loading-text if the site has one, else the last text node in .loading.
  const target = ()                                                  => {
    const el = loading.querySelector             (".loading-text");
    if (el) return { get: () => el.textContent ?? "", set: (s) => (el.textContent = s) };
    let node = [...loading.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent .trim());
    if (!node) { node = document.createTextNode(""); loading.append(node); }
    return { get: () => node .textContent ?? "", set: (s) => (node .textContent = " " + s) };
  };

  let timer = 0;
  let restore                      = null;
  const start = () => {
    stop();
    const tx = target();
    const original = tx.get().trim();
    const el = loading.querySelector             (".loading-text");
    // Search by name / playlist uses its own text ("Searching…"): keep it, only add the %.
    const staged = !el?.dataset.default || original === el.dataset.default.trim();
    const t0 = Date.now();
    const tick = () => {
      const s = (Date.now() - t0) / 1000;
      const pct = Math.min(95, Math.round(95 * (1 - Math.exp(-s / 12))));
      const msg = !staged ? original : s >= 20 ? t.s4 : s >= 10 ? t.s3 : s >= 4 ? t.s2 : original;
      tx.set(`${msg} ${pct}%`);
      (bar.firstChild               ).style.width = pct + "%";
    };
    tick();
    timer = window.setInterval(tick, 250);
    restore = () => tx.set(original);
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = 0;
    (bar.firstChild               ).style.width = "0";
    restore?.();
    restore = null;
  };
  let last = card.dataset.state;
  new MutationObserver(() => {
    const now = card.dataset.state;
    if (now === last) return;
    last = now;
    if (now === "loading") start();
    else stop();
  }).observe(card, { attributes: true, attributeFilter: ["data-state"] });
  if (card.dataset.state === "loading") start();

  // Download taps: show "Preparing 1080p…" unless the site's own code already shows a % (backup files).
  card.addEventListener("click", (e) => {
    const a = (e.target               ).closest                   ("a[href]");
    if (!a || !card.contains(a) || !/\/api\/(download|dl)\b|download/.test(a.getAttribute("href") || "")) return;
    const li = a.closest("li");
    const qEl = li?.querySelector(".q, .quality, .fmt-q, b, strong");
    const q = (qEl?.firstChild?.textContent || qEl?.textContent || "").trim() || "file";
    const label = [...a.querySelectorAll("span")].pop() ?? a;
    const before = label.textContent ?? "";
    setTimeout(() => {
      if ((label.textContent ?? "") !== before) return; // site code already changed it (progress %)
      label.textContent = "⏳ " + t.prep.replace("{q}", q);
      setTimeout(() => {
        if ((label.textContent ?? "").startsWith("⏳")) label.textContent = before;
      }, 15000);
    }, 60);
  });
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", initProgressUI, { once: true });
else initProgressUI();
})();
