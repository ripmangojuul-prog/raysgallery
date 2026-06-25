/* ============================================================
   HINTER TATTOO — "Ink Gallery After Dark"
   Scroll engine + data-driven galleries
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- content ---------- */
  function toRoman(n) {
    const map = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    let out = ""; for (const [v, s] of map) while (n >= v) { out += s; n -= v; } return out;
  }

  const W = "assets/work/";
  const WORK_CATEGORIES = [
    { name: "Surreal & Uncanny", note: "Dark-surrealist set pieces where the everyday slips its skin — melting faces, glass coffins, and screens that watch back.", plates: [
      { src: "ig-095.jpg", title: "The Glass Table", meta: "Black & grey · calf", alt: "Black and grey surreal tattoo of a latex-clad woman forming a glass table, on a calf" },
      { src: "ig-036.jpg", title: "Shatter", meta: "Black & grey · thigh", alt: "Black and grey surreal realism tattoo of a shattered melting glass female face on a thigh" },
      { src: "ig-130.jpg", title: "The Settee", meta: "Black & grey · forearm", alt: "Black and grey forearm tattoo of an ornate antique settee with two sardines forming an uncanny face" },
      { src: "ig-088.jpg", title: "On Ice", meta: "Black & grey · forearm", alt: "Black and grey realism tattoo of a woman's face frozen inside an ice cube on a forearm" },
      { src: "ig-136.jpg", title: "Dead Channel", meta: "Black & grey · upper arm", alt: "Black and grey tattoo of stacked vintage CRT televisions displaying dark surreal imagery" },
      { src: "ig-231.jpg", title: "Unzipped", meta: "Black & grey · upper arm", alt: "Black and grey realism tattoo of a skeletal figure peeling open a zipper in the skin" },
      { src: "ig-118.jpg", title: "The Morning Edition", meta: "Black & grey · forearm", alt: "Black and grey fineline tattoo of a seated person reading a burning newspaper" },
    ]},
    { name: "Figures & Faces", note: "Black & grey portraiture and the human form — cinematic homage and surreal double-exposure.", plates: [
      { src: "ig-200.jpg", title: "Chainmail", meta: "Black & grey · forearm", alt: "Black and grey forearm tattoo of a medieval woman in a chainmail coif with a double-exposure figure" },
      { src: "ig-138.jpg", title: "Sunday Best", meta: "Black & grey · forearm", alt: "Black and grey forearm tattoo of a vintage suited man in a fedora among fineline flowers" },
      { src: "ig-176.jpg", title: "Pierrot", meta: "Black & grey · arm", alt: "Fine-line black and grey tattoo of a Pierrot clown ballerina on a crescent moon" },
      { src: "ig-240.jpg", title: "Winged Veil", meta: "Black & grey · arm", alt: "Surreal black and grey portrait of two women with a dragonfly and moth covering their faces" },
      { src: "ig-213.jpg", title: "The Kiss", meta: "Black & grey · arm", alt: "Black and grey fineline tattoo of two classical lovers kissing within an ornate frame" },
      { src: "ig-129.jpg", title: "Pin-Up", meta: "Black & grey · arm", alt: "Black and grey fineline arm tattoo of a kneeling pin-up woman in a corset and heels" },
      { src: "ig-034.jpg", title: "Black Swan", meta: "Black & grey · forearm", alt: "Black and grey realism tattoo of two retro televisions displaying Black Swan ballerina portraits" },
    ]},
    { name: "Objects & Still Life", note: "Hyperreal everyday objects rendered with cold precision and a wink of menace.", plates: [
      { src: "ig-105.jpg", title: "S E X", meta: "Black & grey · forearm", alt: "Black and grey realism tattoo of a glossy patent handbag reading SEX on a forearm" },
      { src: "ig-067.jpg", title: "Wrong Number", meta: "Black & grey · leg", alt: "Black and grey surreal tattoo of a vintage rotary phone with a conch shell receiver and an eye in the dial" },
      { src: "ig-143.jpg", title: "Be Kind, Rewind", meta: "Black & grey · wrist", alt: "Black and grey tattoo of a VHS tape of The Shining on a wrist" },
      { src: "ig-238.jpg", title: "Instant", meta: "Black & grey · arm", alt: "Detailed black and grey tattoo of a vintage Polaroid Sun 600 camera printing a photo" },
      { src: "ig-211.jpg", title: "The Urn", meta: "Black & grey · calf", alt: "Fine-line black and grey calf tattoo of a classical urn with snake handles" },
      { src: "ig-244.jpg", title: "Nightcap", meta: "Black & grey · arm", alt: "Black and grey realism tattoo of an ornate crystal goblet filled with dark wine" },
      { src: "ig-209.jpg", title: "Last Call", meta: "Black & grey · forearm", alt: "Black and grey forearm tattoo of a martini glass splashing with a tiny disco ball garnish" },
    ]},
    { name: "Architecture & Ornament", note: "Gothic stone, sacred geometry, and devotional metalwork — the reverent end of the dark register.", plates: [
      { src: "ig-243.jpg", title: "Saint Michael", meta: "Black & grey · forearm", alt: "Black and grey realism tattoo of armored archangel Saint Michael over a fallen demon" },
      { src: "ig-234.jpg", title: "Sanctuary", meta: "Black & grey · arm", alt: "Black and grey tattoo of an angel embracing a robed figure inside a Gothic cathedral arch" },
      { src: "ig-167.jpg", title: "The Cathedral", meta: "Black & grey · leg", alt: "Detailed black and grey leg tattoo of a gothic cathedral with a tall spire" },
      { src: "ig-047.jpg", title: "The Mourner", meta: "Black & grey · calf", alt: "Black and grey realism tattoo of a winged angel statue resting on an Ionic column" },
      { src: "ig-115.jpg", title: "Love, Daddy", meta: "Black & grey · upper arm", alt: "Black and grey fineline tattoo of a winged cherub aiming a flintlock pistol above a banner" },
      { src: "ig-108.jpg", title: "Bow & Cross", meta: "Black & grey · arm", alt: "Black and grey realism tattoo of a shiny bow with a dangling gothic cross charm" },
    ]},
    { name: "Chrome, Flora & Fauna", note: "Liquid-metal surfaces and the natural world, reimagined in mirror-bright black & grey.", plates: [
      { src: "ig-251.jpg", title: "Mirrorball", meta: "Black & grey · arm", alt: "Black and grey surreal tattoo of a kneeling chrome android figure with a disco-ball head" },
      { src: "ig-082.jpg", title: "Mirror, Mirror", meta: "Black & grey · hand", alt: "Black and grey hand tattoo of a butterfly whose wings reveal two mirrored portraits" },
      { src: "ig-194.jpg", title: "Lovebirds", meta: "Black & grey · forearm", alt: "Black and grey forearm tattoo of two lovebirds pulling the pin from a chrome hand grenade" },
      { src: "ig-228.jpg", title: "Heartbone", meta: "Black & grey · forearm", alt: "Black and grey forearm tattoo of an animal skull arranged into a heart shape" },
      { src: "ig-216.jpg", title: "Eagle & Serpent", meta: "Black & grey · hand", alt: "Black and grey fineline tattoo of an eagle attacking a snake across a hand and thumb" },
      { src: "ig-185.jpg", title: "Serpent Urn", meta: "Black & grey · calf", alt: "Black and grey tattoo of an ornate classical urn entwined with snakes on a calf" },
      { src: "ig-180.jpg", title: "Chrome Wing", meta: "Black & grey · ankle", alt: "Black and grey tattoo of a polished chrome butterfly and a knife on an ankle" },
    ]},
  ];

  const SHEET_GROUPS = { g01:19, g02:4, g04:3, g06:4, g07:4, g08:4, g09:4, g10:4, g11:4, g12:1 };
  const FLASH = Object.entries(SHEET_GROUPS)
    .flatMap(([g, n]) => Array.from({ length: n }, (_, i) => `${g}_${String(i + 1).padStart(2, "0")}`))
    .map((id, i) => ({ src: `assets/flash/${id}.jpg`, title: `Flash № ${toRoman(i + 1)}`, meta: "Available flash · black & grey", alt: `Flash sheet ${i + 1} — fineline black and grey surrealist tattoo designs` }));

  const FAQ = [
    { q: "What is the Create tool?", a: "Create is a free tool on this site — upload a hand-drawn sketch, a photo, or any reference, and it restyles your image into the textures and execution styles I’m known for tattooing. It’s a way to explore a direction before you reach out; bring whatever you make into your text when you’re ready to book." },
    { q: "How do I book with you?", a: "Text (480) 420-4319 — text only — to begin. In your message include: what you’d like tattooed, the size and placement, the first date you’re ready to begin (for scheduling), and whether you’re ready to pay a $100 deposit. The deposit is credited toward the cost of the tattoo and is required to book a session." },
    { q: "What form of payment do you take?", a: "Cash, Zelle, Cash App, Venmo, Bitcoin, or Ethereum." },
    { q: "Where are you located?", a: "I’m based out of Phoenix, Arizona — that’s where the studio is, too." },
    { q: "How should I prepare for my appointment?", a: "Bring cash and a valid government-issued ID. Eat beforehand and be fully hydrated, and don’t drink alcohol the night before or the day of. Wear comfortable clothing that allows access to the area being tattooed. You’re welcome to bring one guest, and please don’t arrive more than 10 minutes early or 20 minutes late." },
    { q: "How much time should I set aside?", a: "I’d highly suggest booking on a day you have nothing else going on. My palm-sized tattoos have taken anywhere from 1 hour to 10, depending on complexity, placement, and budget." },
    { q: "How long will the tattoo take?", a: "We’ll give you our best estimate over text when discussing the piece. Time shifts with size and placement, and keep in mind it’s always just an estimate — things can run over or under." },
    { q: "Do you repeat flash?", a: "Sort of! I like to add variations and color, and I’m happy to work with anybody on whatever they want specifically. I like to keep each piece a little unique." },
    { q: "Can I change my design?", a: "Of course — just give us 24 hours’ notice." },
    { q: "What is your cancellation policy?", a: "All deposits are non-refundable — your space is reserved once a deposit is down, and refunds would make it impossible to keep a concrete schedule. I’ll allow rescheduling if you text me at least 48 hours in advance; each request is handled case by case. Depending on the situation, another deposit may be required to reschedule, which goes toward the tattoo. Deposits keep the schedule in place — it’s for your security and mine. <3" },
    { q: "What is your policy on deposits?", a: "All deposits are non-refundable. I offer one complimentary reschedule; anything beyond that will require an additional deposit." },
    { q: "What is your policy on touch-ups?", a: "Free touch-ups within one month. Anything beyond that is treated at half price. Please reach out with the subject “Touch up.”" },
  ];

  const TICKER = ["Fineline SurRealism", "Black & Grey", "By appointment only", "@hintertattoo", "Custom & available flash", "Est. Phoenix, AZ"];

  /* flat list for the work lightbox */
  const WORK_PLATES = WORK_CATEGORIES.flatMap((c) => c.plates.map((p) => ({ ...p, src: W + p.src })));

  /* ============================================================
     BUILD DOM
     ============================================================ */
  function buildTicker() {
    const track = $("#tickerTrack");
    const seq = TICKER.map((t) => `<span class="ticker__item">${t} <span class="glint">&#10022;</span></span>`).join("");
    track.innerHTML = seq + seq; // duplicate for seamless loop
  }

  function buildWork() {
    const wrap = $("#workSets");
    let gi = 0;
    WORK_CATEGORIES.forEach((cat, ci) => {
      const plates = cat.plates.map((p) => {
        const idx = gi++;
        return `<button class="plate" data-group="work" data-i="${idx}" aria-label="${p.title}">
          <img src="${W + p.src}" alt="${p.alt}" loading="lazy" />
          <span class="plate__meta"><span class="plate__title">${p.title}</span><span class="plate__tag">${p.meta}</span></span>
        </button>`;
      }).join("");
      wrap.insertAdjacentHTML("beforeend", `
        <div class="work-set">
          <div class="work-set__head">
            <span class="work-set__idx">${toRoman(ci + 1)}</span>
            <h3 class="work-set__name">${cat.name}</h3>
            <p class="work-set__note">${cat.note}</p>
          </div>
          <div class="work-set__grid">${plates}</div>
        </div>`);
    });
  }

  function buildFlash() {
    const grid = $("#flashGrid");
    grid.innerHTML = FLASH.map((f, i) => `
      <button class="flash__plate ${i >= 12 ? "hidden" : ""}" data-group="flash" data-i="${i}" aria-label="${f.title}">
        <span class="flash__num">${f.title}</span>
        <img src="${f.src}" alt="${f.alt}" loading="lazy" />
      </button>`).join("");
  }

  function buildFaq() {
    const list = $("#faqList");
    list.innerHTML = FAQ.map((f) => `
      <div class="faq__item">
        <button class="faq__q">${f.q}<span class="faq__icon" aria-hidden="true"></span></button>
        <div class="faq__a"><div class="faq__a-inner">${f.a}</div></div>
      </div>`).join("");
  }

  /* ============================================================
     PRELOADER
     ============================================================ */
  function splitMark(el) {
    const out = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split("").forEach((ch) => {
          const s = document.createElement("span");
          s.className = "char"; s.textContent = ch === " " ? " " : ch;
          out.push(s);
        });
      } else {
        node.classList.add("char");
        out.push(node);
      }
    });
    el.innerHTML = "";
    out.forEach((s) => el.appendChild(s));
    return out;
  }

  function runPreloader(done) {
    const pre = $("#preloader");
    if (reduceMotion) { pre.classList.add("done"); done(); return; }
    const chars = splitMark($("#preMark"));
    const line = $(".preloader__line");
    const tl = gsap.timeline({ onComplete: () => { pre.classList.add("done"); done(); } });
    tl.to(chars, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.04 })
      .fromTo(line, { width: 0 }, { width: 220, duration: 0.7, ease: "power2.inOut" }, "-=0.2")
      .to({}, { duration: 0.35 });
  }

  /* ============================================================
     SMOOTH SCROLL (Lenis) + GSAP bridge
     ============================================================ */
  let lenis = null;
  function initScroll() {
    gsap.registerPlugin(ScrollTrigger);
    if (reduceMotion || typeof Lenis === "undefined") return;
    lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // anchor links go through Lenis
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      });
    });
  }

  /* ============================================================
     NAV
     ============================================================ */
  function initNav() {
    const nav = $("#nav");
    let last = 0;
    const onScroll = (y) => {
      nav.classList.toggle("scrolled", y > 40);
      if (y > last && y > 400) nav.classList.add("hidden");
      else nav.classList.remove("hidden");
      last = y;
    };
    if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
    else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
  }

  const burger = $("#burger"), menu = $("#menu");
  function closeMenu() {
    burger.classList.remove("open"); menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true"); burger.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("menu-open");
  }
  function initMenu() {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("menu-open", open);
    });
  }

  /* ============================================================
     PARTICLE FIELD (hero) — capped, IO-gated
     ============================================================ */
  function initParticles() {
    const canvas = $("#particles");
    if (!canvas || reduceMotion) { if (canvas) canvas.style.display = "none"; return; }
    const ctx = canvas.getContext("2d");
    const hero = $(".hero");
    let w, h, dpr, parts = [], raf = null, visible = true;
    const COUNT = window.innerWidth < 720 ? 36 : 90;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = hero.offsetWidth * dpr;
      h = canvas.height = hero.offsetHeight * dpr;
      canvas.style.width = hero.offsetWidth + "px";
      canvas.style.height = hero.offsetHeight + "px";
    }
    function seed() {
      parts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.3) * dpr,
        vx: (Math.random() - 0.5) * 0.12 * dpr,
        vy: (-Math.random() * 0.22 - 0.04) * dpr,
        a: Math.random() * 0.4 + 0.08,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(232,227,218,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    function start() { if (!raf && visible) draw(); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    size(); seed(); start();
    window.addEventListener("resize", () => { size(); seed(); });
    new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      visible ? start() : stop();
    }, { threshold: 0.01 }).observe(hero);
  }

  /* ============================================================
     VIDEO play/pause on visibility
     ============================================================ */
  function initVideos() {
    $$("video").forEach((v) => {
      if (reduceMotion) { v.pause(); return; }
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting) { v.play().catch(() => {}); }
          else v.pause();
        });
      }, { threshold: 0.15 });
      io.observe(v);
    });
  }

  /* ============================================================
     SCROLL REVEALS + parallax + plate/reel motion
     ============================================================ */
  function initReveals() {
    if (reduceMotion) { $$(".reveal").forEach((e) => e.classList.add("in")); $$(".plate").forEach((p) => p.classList.add("in")); return; }

    ScrollTrigger.batch(".reveal", {
      start: "top 86%",
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.09, overwrite: true }),
    });

    // plate clip-path reveals
    ScrollTrigger.batch(".plate, .flash__plate", {
      start: "top 92%",
      onEnter: (els) => els.forEach((el, i) => setTimeout(() => el.classList.add("in"), i * 70)),
    });

    // section heads — scrubbed parallax (no pin, robust)
    $$(".section-head").forEach((head) => {
      const title = $(".section-head__title", head);
      if (!title) return;
      gsap.fromTo(title, { y: 60, opacity: 0.2 }, {
        y: -20, opacity: 1, ease: "none",
        scrollTrigger: { trigger: head, start: "top 90%", end: "top 35%", scrub: 0.6 },
      });
    });

    // background parallax
    parallax(".studio__bg", 12);
    parallax(".create__bg", 14);
    parallax(".book__bg", 16);
    parallax(".artist__veil", 10);
    parallax(".footer__ghost", 8, true);

    // artist portrait moves faster than the column (foreground parallax)
    const portrait = $(".artist__portrait img");
    if (portrait) {
      gsap.fromTo(portrait, { y: 50 }, {
        y: -50, ease: "none",
        scrollTrigger: { trigger: ".artist", start: "top bottom", end: "bottom top", scrub: 1 },
      });
    }

    // hero content drifts up + fades as you leave
    gsap.to(".hero__inner", {
      y: -80, opacity: 0, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "center center", end: "bottom top", scrub: 1 },
    });

    // reel cinematic mask-wipe in/out (column-wave feel via clip-path)
    $$(".reel").forEach((reel) => {
      gsap.fromTo(reel, { clipPath: "inset(12% 0% 12% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: reel, start: "top 90%", end: "top 45%", scrub: 0.5 },
      });
      const inner = $(".reel__inner", reel);
      gsap.fromTo(inner, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, ease: "power2.out",
        scrollTrigger: { trigger: reel, start: "top 70%" },
      });
    });

    // hero title lines rise in
    $$(".hero__title .reveal-mask").forEach((mask) => {
      const inner = document.createElement("span");
      inner.style.display = "block";
      inner.textContent = mask.textContent;
      mask.textContent = "";
      mask.appendChild(inner);
      gsap.from(inner, { yPercent: 110, duration: 1.1, ease: "power4.out", delay: 0.1 });
    });
  }

  function parallax(sel, amount, isGhost) {
    const el = $(sel); if (!el) return;
    gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount, ease: "none",
      scrollTrigger: { trigger: isGhost ? ".footer" : el.parentElement, start: "top bottom", end: "bottom top", scrub: 1 },
    });
  }

  /* ============================================================
     FLASH unfold
     ============================================================ */
  function initFlash() {
    const btn = $("#flashUnfold");
    btn.addEventListener("click", () => {
      const hidden = $$(".flash__plate.hidden");
      hidden.forEach((el, i) => {
        el.classList.remove("hidden");
        if (!reduceMotion) { el.classList.add("in"); }
      });
      btn.style.display = "none";
      if (lenis) ScrollTrigger.refresh();
    });
  }

  /* ============================================================
     FAQ accordion
     ============================================================ */
  function initFaq() {
    $$(".faq__item").forEach((item) => {
      const q = $(".faq__q", item), a = $(".faq__a", item);
      q.addEventListener("click", () => {
        const open = item.classList.contains("open");
        if (open) {
          item.classList.remove("open");
          gsap.to(a, { height: 0, duration: 0.45, ease: "power2.inOut" });
        } else {
          item.classList.add("open");
          gsap.set(a, { height: "auto" });
          gsap.from(a, { height: 0, duration: 0.5, ease: "power2.out" });
        }
        if (lenis) setTimeout(() => ScrollTrigger.refresh(), 500);
      });
    });
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  function initLightbox() {
    const lb = $("#lightbox"), img = $("#lbImg"), cap = $("#lbCap");
    let group = WORK_PLATES, idx = 0;

    function render() {
      const p = group[idx];
      img.src = p.src; img.alt = p.alt;
      cap.innerHTML = `${p.title}<span>${p.meta}</span>`;
    }
    function open(g, i) {
      group = g; idx = i; render();
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("lightbox-open");
      if (lenis) lenis.stop();
    }
    function close() {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("lightbox-open");
      if (lenis) lenis.start();
    }
    const step = (d) => { idx = (idx + d + group.length) % group.length; render(); };

    document.addEventListener("click", (e) => {
      const plate = e.target.closest(".plate, .flash__plate");
      if (!plate) return;
      const g = plate.dataset.group === "flash" ? FLASH : WORK_PLATES;
      open(g, parseInt(plate.dataset.i, 10));
    });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => step(-1));
    $("#lbNext").addEventListener("click", () => step(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  function initCursor() {
    if (isTouch) return;
    const cur = $("#cursor");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .plate, .flash__plate")) cur.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .plate, .flash__plate")) cur.classList.remove("is-hover");
    });
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    buildTicker(); buildWork(); buildFlash(); buildFaq();
    initScroll();
    initNav(); initMenu();
    initParticles(); initVideos();
    initFlash(); initFaq(); initLightbox(); initCursor();
    initReveals();

    // refresh after fonts + images settle
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger && ScrollTrigger.refresh());
    }
    window.addEventListener("load", () => { ScrollTrigger && ScrollTrigger.refresh(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    runPreloader(boot);
  });
})();
