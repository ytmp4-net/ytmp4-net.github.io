// YTMP4 on GitHub Pages: converter (our backend at ytmp4.store) + Adsterra ads.
(() => {
  const API = "https://ytmp4.store";
  const $ = (s) => document.querySelector(s);
  const form = $("#f"), input = $("#u"), go = $("#go"), err = $("#err"), res = $("#res");
  const rMp4 = $("#r-mp4"), rAud = $("#r-aud");
  const YT = /^(https?:\/\/)?([a-z0-9-]+\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i;
  const abs = (u) => (u && u.startsWith("/") ? API + u : u);
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const mb = (n) => (n ? `~${(n / 1048576).toFixed(n > 104857600 ? 0 : 1)} MB` : "");

  const fail = (msg) => { err.textContent = msg; err.hidden = false; res.dataset.state = "idle"; go.disabled = false; };

  function tab(name) {
    document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.t === name)));
    rMp4.hidden = name !== "mp4"; rAud.hidden = name !== "aud";
  }
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => tab(b.dataset.t)));

  async function prepare(e, a, label, prep, dl) {
    if (a.dataset.ready) return;
    e.preventDefault();
    if (a.dataset.busy) return;
    a.dataset.busy = "1"; label.textContent = "0%";
    const t0 = Date.now();
    while (Date.now() - t0 < 240000) {
      let st = {};
      try { const r = await fetch(abs(prep), { cache: "no-store" }); st = r.ok ? await r.json() : { error: 1 }; } catch {}
      if (st.ready) { a.href = abs(dl); a.dataset.ready = "1"; delete a.dataset.busy; label.textContent = "✓ Download"; location.href = abs(dl); return; }
      if (st.error) break;
      if (typeof st.progress === "number") label.textContent = Math.round(st.progress) + "%";
      await new Promise((r) => setTimeout(r, 2000));
    }
    delete a.dataset.busy; label.textContent = "⚠ Try again";
  }

  function row(f) {
    const li = document.createElement("li");
    const q = document.createElement("span"); q.className = "q";
    const fmt = document.createElement("span"); fmt.className = "fmt";
    if (f.ext === "mp4") {
      const h = Math.min(f.width || Infinity, f.height || Infinity);
      q.textContent = Number.isFinite(h) ? `${h}p` : f.label;
      if (h >= 720) q.insertAdjacentHTML("beforeend", '<span class="hd">HD</span>');
      fmt.textContent = "MP4 · video + sound";
    } else {
      q.textContent = f.ext.toUpperCase();
      fmt.textContent = f.ext === "mp3" ? "MP3 · plays everywhere" : "M4A · original audio";
    }
    if (f.size) { const s = document.createElement("small"); s.textContent = mb(f.size); q.append(s); }
    const a = document.createElement("a");
    a.href = abs(f.href); a.rel = "nofollow"; a.setAttribute("download", "");
    const label = document.createElement("span"); label.textContent = "Download"; a.append(label);
    if (f.prepare && f.dl) a.addEventListener("click", (e) => prepare(e, a, label, f.prepare, f.dl));
    li.append(q, fmt, a);
    return li;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.hidden = true;
    let url = input.value.trim();
    if (!url) return fail("Paste a YouTube link first.");
    if (!YT.test(url)) return fail("That doesn't look like a YouTube link. Copy it from Share → Copy link.");
    if (!/^https?:/i.test(url)) url = "https://" + url;
    go.disabled = true; res.dataset.state = "loading";
    $(".done").hidden = true;
    res.scrollIntoView({ behavior: "smooth", block: "nearest" });
    try {
      const r = await fetch(API + "/api/lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, only: "youtube", detail: true }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (r.status === 429) return fail("Too many requests at once. Wait a minute and try again.");
        if (d.code === "busy") return fail("YouTube is slow right now. Please try again in a moment.");
        return fail(d.error || "This video can't be converted. It may be private, age-restricted or removed.");
      }
      $("#th").src = abs(d.thumbnail) || ""; $("#th").alt = d.title || "";
      $("#ch").textContent = d.author || ""; $("#ti").textContent = d.title || "";
      $("#du").textContent = d.duration ? "Length " + mmss(d.duration) : "";
      const files = d.files || [];
      rMp4.replaceChildren(...files.filter((f) => f.ext === "mp4").map(row));
      rAud.replaceChildren(...files.filter((f) => f.ext !== "mp4").map(row));
      tab(rMp4.children.length ? "mp4" : "aud");
      $(".done").hidden = false; res.dataset.state = "done"; go.disabled = false;
    } catch {
      fail("Network problem. Check your connection and try again.");
    }
  });

  const paste = $("#paste");
  paste.addEventListener("click", async () => {
    if (input.value) { input.value = ""; paste.textContent = "Paste"; input.focus(); return; }
    try { input.value = (await navigator.clipboard.readText()).trim(); if (input.value) { paste.textContent = "Clear"; form.requestSubmit(); } }
    catch { input.focus(); }
  });
  input.addEventListener("input", () => { paste.textContent = input.value ? "Clear" : "Paste"; });
  $("#again").addEventListener("click", () => { input.value = ""; paste.textContent = "Paste"; res.dataset.state = "idle"; scrollTo({ top: 0, behavior: "smooth" }); input.focus(); });

  // ---------------- Adsterra (keys filled in when the ytmp4-net.github.io zones exist) ----------------
  const AD_HOST = "";               // e.g. "https://bellnewyork.org"
  const NATIVE = "";                // native key
  const BANNERS = { "728": "", "300": "", "320": "" }; // banner keys
  const SIZES = { "728": [728, 90], "300": [300, 250], "320": [320, 50] };
  const bot = navigator.webdriver || /bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent);
  const desktop = () => matchMedia("(min-width:768px)").matches;
  let chain = Promise.resolve();
  function banner(el) {
    if (!AD_HOST || !el || el.dataset.loaded || bot) return;
    const key = BANNERS[el.dataset.ad]; if (!key) return;
    el.dataset.loaded = "1";
    const [w, h] = SIZES[el.dataset.ad];
    chain = chain.then(() => new Promise((done) => {
      const c = document.createElement("script");
      c.text = `atOptions=${JSON.stringify({ key, format: "iframe", height: h, width: w, params: {} })};`;
      const s = document.createElement("script"); s.src = `${AD_HOST}/22/${key}`;
      const t = setTimeout(done, 4000);
      s.onload = s.onerror = () => { clearTimeout(t); setTimeout(done, 250); };
      el.append(c, s);
    }));
  }
  function ads() {
    if (!AD_HOST || bot) return;
    if (desktop()) banner($(".ad-top [data-ad]"));
    if (NATIVE) {
      $("#native-slot").id = "container-" + NATIVE;
      const s = document.createElement("script"); s.async = true; s.dataset.cfasync = "false"; s.src = `${AD_HOST}/21/${NATIVE}`;
      document.body.append(s);
    }
    new MutationObserver((_, mo) => { if (res.dataset.state !== "idle") { banner($(".ad-box [data-ad]")); mo.disconnect(); } })
      .observe(res, { attributes: true, attributeFilter: ["data-state"] });
    const st = $("#sticky");
    let closed = false; try { closed = sessionStorage.getItem("adx") === "1"; } catch {}
    if (st && !desktop() && !closed && BANNERS["320"]) {
      st.hidden = false; document.body.classList.add("has-sticky"); banner(st.querySelector("[data-ad]"));
      st.querySelector("button").addEventListener("click", () => { st.remove(); document.body.classList.remove("has-sticky"); try { sessionStorage.setItem("adx", "1"); } catch {} });
    }
  }
  if (document.readyState === "complete") ads(); else addEventListener("load", ads, { once: true });
})();
