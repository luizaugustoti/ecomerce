/* Lumis Star — componentes interativos (JavaScript puro, sem dependências) */
(() => {
  'use strict';

  const { BRAND, CATEGORIES, LINES, SKIN_TYPES, BENEFITS, TESTIMONIALS, ROUTINES, DECOR } = window.STORE;
  const db = window.sbClient;
  let PRODUCTS = [];
  const FREE = BRAND.freeShippingThreshold;
  const PAGE = document.body.dataset.page;
  const params = new URLSearchParams(location.search);

  /* ================= Utilidades ================= */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const digits = s => String(s).replace(/\D/g, '');
  const byId = id => PRODUCTS.find(p => p.id === id);
  const productUrl = p => `produto.html?id=${encodeURIComponent(p.id)}`;
  const bySold = () => [...PRODUCTS].sort((a, b) => b.sold - a.sold);

  /* ================= Ícones (SVG inline) ================= */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevronL: '<path d="m15 18-6-6 6-6"/>',
    chevronR: '<path d="m9 18 6-6-6-6"/>',
    chevronD: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    leaf: '<path d="M5 19C5 10 11 5 20 5c0 9-5 14-14 14H5Z"/><path d="m5 19 8-8"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    recycle: '<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    play: '<path d="M8 5v14l11-7L8 5Z"/>',
    whatsapp: '<path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.7L4 20Z"/><path d="M9.5 8.5c0 3.5 2.5 6 6 6l1-1.5-2-1-1 1c-1-.4-2.1-1.5-2.5-2.5l1-1-1-2-1.5 1Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1Z"/>',
    tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.4 4.6 5 5"/>',
    youtube: '<rect x="2.5" y="6" width="19" height="12" rx="4"/><path d="m10 9.5 4.5 2.5-4.5 2.5v-5Z"/>',
    drop: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z"/>',
    sparkle: '<path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6-5.6-1.9 5.6-1.9L12 3Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3.5 8 4.5 9 8 12 8Zm0 0s1.5-4.5 4-3.5S15 8 12 8Z"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    pix: '<path d="M12 3l9 9-9 9-9-9 9-9Z"/><path d="m8 12 4-4 4 4-4 4-4-4Z"/>',
    barcode: '<path d="M4 5v14M7 5v14M10 5v14M14 5v14M17 5v14M20 5v14"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    box: '<path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z"/><path d="m3 7 9 4 9-4M12 11v10"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  };
  const FILLED = new Set(['star', 'play']);
  const icon = (name, cls = 'w-5 h-5') =>
    `<svg class="${cls} shrink-0" viewBox="0 0 24 24" fill="${FILLED.has(name) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  function stars(rating, count, size = 'w-4 h-4') {
    const row = Array.from({ length: 5 }, () => icon('star', size)).join('');
    const label = `Avaliação ${rating.toLocaleString('pt-BR')} de 5${count ? `, ${count} avaliações` : ''}`;
    return `<div class="flex items-center gap-2" role="img" aria-label="${label}">
      <span class="relative inline-flex text-ink/15">${row}<span class="absolute inset-0 inline-flex overflow-hidden text-[#C08A3E]" style="width:${(rating / 5) * 100}%">${row}</span></span>
      ${count ? `<span class="text-xs text-ink/60">(${count.toLocaleString('pt-BR')})</span>` : ''}
    </div>`;
  }

  /* ================= Preços ================= */
  const variantOf = (p, name) => p.variants ? (p.variants.options.find(o => o.name === name) || p.variants.options[0]) : null;
  const priceOf = (p, v) => v?.price ?? p.price;
  const oldPriceOf = (p, v) => (v?.price ? v.oldPrice : p.oldPrice) ?? null;
  function installments(total) {
    const n = Math.max(1, Math.min(BRAND.maxInstallments, Math.floor(total / BRAND.minInstallment)));
    return { n, value: total / n };
  }

  /* ================= Supabase: produtos ================= */
  const ART_COLORS = ['#E9B872', '#BCD3DA', '#A9C2A3', '#E7B9C2', '#D8A7B1', '#E3C2A2', '#C9964A', '#EAD9C0', '#9DB59A', '#C8A27C'];
  const CAPS = ['#2B2B2B', '#6E8B74', '#9E5F6D'];
  const STOP = new Set(['de', 'da', 'do', 'com', 'e', '&', '+']);
  const HEX = /#([0-9a-f]{6})\b/i;
  const hashStr = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const splitList = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
  const toKeys = (dict, s) => splitList(s).map(v => Object.keys(dict).find(k => norm(k) === norm(v) || norm(dict[k]) === norm(v))).filter(Boolean);
  function safeUrl(u) {
    try { const url = new URL(u); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''; } catch { return ''; }
  }

  function fromDb(r) {
    const h = hashStr(r.slug);
    const options = splitList(r.volume_tom).map(raw => {
      const m = raw.match(HEX);
      return { name: raw.replace(HEX, '').trim() || raw, hex: m ? `#${m[1]}` : null };
    });
    const preco = Number(r.preco), promo = r.preco_promocional == null ? null : Number(r.preco_promocional);
    const onSale = promo != null && promo < preco;
    const est = r.estoque;
    const stock = Number(est && typeof est === 'object' ? (Array.isArray(est) ? est[0]?.quantidade : est.quantidade) : est) || 0;
    const desc = String(r.descricao || '');
    const first = desc.split(/[.!?\n]/)[0].trim();
    const words = String(r.nome).split(/\s+/).filter(w => !STOP.has(w.toLowerCase()));
    return {
      uuid: r.id, id: r.slug, name: r.nome,
      short: first.length > 90 ? `${first.slice(0, first.lastIndexOf(' ', 88))}…` : first,
      category: CATEGORIES[r.categoria] ? r.categoria : 'skincare',
      line: LINES[r.linha] ? r.linha : null,
      skin: toKeys(SKIN_TYPES, r.tipo_pele),
      benefits: toKeys(BENEFITS, r.beneficio),
      price: onSale ? promo : preco,
      oldPrice: onSale ? preco : null,
      variants: options.length ? {
        label: options.some(o => o.hex) ? 'Tom' : options.every(o => /\d\s*(ml|g|kg|l)\b/i.test(o.name)) ? 'Volume' : 'Opção',
        options,
      } : null,
      description: desc,
      howTo: String(r.modo_uso || '').split('\n').map(s => s.trim()).filter(Boolean),
      inci: r.ingredientes || '',
      tip: r.dicas || '',
      image: safeUrl(r.imagem_url),
      video: safeUrl(r.video_url),
      stock,
      sold: Number(r.vendidos) || 0,
      createdAt: new Date(r.created_at).getTime() || 0,
      badge: stock <= 0 ? 'Esgotado' : stock <= 5 ? 'Últimas unidades' : null,
      // Propriedades da ilustração usada quando o produto ainda não tem foto
      shape: DECOR[r.slug]?.shape || (r.categoria === 'kits' ? 'kit' : ['dropper', 'jar', 'tube', 'pump'][h % 4]),
      color: DECOR[r.slug]?.color || ART_COLORS[h % ART_COLORS.length],
      capColor: DECOR[r.slug]?.capColor || CAPS[h % CAPS.length],
      bgIndex: DECOR[r.slug]?.bgIndex ?? h % 4,
      label: DECOR[r.slug]?.label || (words[1] || words[0] || '').toUpperCase().slice(0, 12),
    };
  }
  const productMedia = (p, view = 0, priority = false) => (p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="${priority ? 'eager' : 'lazy'}" ${priority ? 'fetchpriority="high"' : ''} decoding="async" class="w-full h-full object-cover">`
    : productArt(p, view));

  async function loadProducts() {
    if (!db) throw new Error('Supabase não configurado: edite assets/js/supabase-config.js');
    const { data, error } = await db.rpc('catalogo_publico');
    if (error) throw error;
    PRODUCTS = (Array.isArray(data) ? data : []).map(fromDb);
  }

  const skeletonCard = () => `<div class="animate-pulse" aria-hidden="true"><div class="aspect-square rounded-2xl bg-ink/[.06]"></div><div class="h-3 w-1/3 rounded bg-ink/[.06] mt-4"></div><div class="h-5 w-4/5 rounded bg-ink/[.06] mt-2"></div><div class="h-4 w-1/4 rounded bg-ink/[.06] mt-3"></div></div>`;
  function showSkeletons() {
    $$('#bestsellers, #recommendations').forEach(el => { el.innerHTML = Array.from({ length: 4 }, () => slide(skeletonCard())).join(''); });
    const grid = $('#product-grid');
    if (grid) grid.innerHTML = Array.from({ length: 6 }, skeletonCard).join('');
    const pdp = $('#pdp');
    if (pdp) pdp.innerHTML = `<div class="grid lg:grid-cols-2 gap-10 animate-pulse" aria-hidden="true"><div class="aspect-square rounded-3xl bg-ink/[.06]"></div><div class="space-y-4 pt-4"><div class="h-4 w-1/4 rounded bg-ink/[.06]"></div><div class="h-10 w-3/4 rounded bg-ink/[.06]"></div><div class="h-8 w-1/3 rounded bg-ink/[.06]"></div><div class="h-12 w-full rounded-full bg-ink/[.06] mt-8"></div></div></div>`;
  }
  function showLoadError() {
    const html = `<div class="col-span-full w-full rounded-3xl border border-ink/10 bg-white p-8 sm:p-12 text-center">
      <p class="font-serif text-3xl">Não foi possível carregar a loja</p>
      <p class="mt-2 text-sm text-ink/65">${db ? 'Verifique sua conexão e tente novamente.' : 'Configure as chaves do Supabase em <code>assets/js/supabase-config.js</code>.'}</p>
      <button type="button" data-reload class="btn btn-primary btn-sm mt-6">Tentar novamente</button>
    </div>`;
    ['#bestsellers', '#product-grid', '#pdp'].forEach(s => { const el = $(s); if (el) el.innerHTML = html; });
    ['#rec-section', '#routine'].forEach(s => $(s)?.setAttribute('hidden', ''));
    if (PAGE === 'checkout') {
      ['#checkout-form', '#summary-mobile-wrap', '#checkout-empty'].forEach(s => $(s)?.setAttribute('hidden', ''));
      $('#main').insertAdjacentHTML('beforeend', html);
    }
  }

  /* ================= Ilustração de produto (SVG) =================
     Placeholder elegante e leve. Troque por <img> com fotos reais quando disponíveis. */
  let artSeq = 0;
  const BG = ['#F3E3E6', '#E3EBE4', '#F1EADF', '#ECE6EE'];
  const leaf = (x, y, r, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C20-30 60-30 80 0 60 30 20 30 0 0Z" fill="#6E8B74" opacity=".32"/><path d="M4 0H74" stroke="#6E8B74" stroke-opacity=".45" stroke-width="1.5"/></g>`;

  function productArt(p, view = 0, bare = false) {
    const uid = `hl${++artSeq}`;
    const c = p.color, cap = p.capColor || '#2B2B2B';
    const bg = BG[((p.bgIndex ?? 0) + view) % BG.length];
    const S = {
      dropper: { body: f => `<rect x="150" y="170" width="100" height="170" rx="18" fill="${f}"/>`, top: `<rect x="176" y="138" width="48" height="36" rx="4" fill="${cap}"/><rect x="184" y="78" width="32" height="64" rx="16" fill="${cap}"/>`, lbl: [162, 232, 76, 64] },
      jar: { body: f => `<rect x="115" y="215" width="170" height="120" rx="22" fill="${f}"/>`, top: `<rect x="107" y="180" width="186" height="46" rx="12" fill="${cap}"/>`, lbl: [140, 248, 120, 56] },
      tube: { body: f => `<path d="M158 92H242L254 292H146Z" fill="${f}"/>`, top: `<rect x="152" y="80" width="96" height="16" rx="3" fill="${c}"/><rect x="164" y="290" width="72" height="52" rx="8" fill="${cap}"/>`, lbl: [168, 160, 64, 90] },
      pump: { body: f => `<rect x="142" y="168" width="116" height="172" rx="28" fill="${f}"/>`, top: `<rect x="180" y="142" width="40" height="30" rx="4" fill="${cap}"/><rect x="194" y="112" width="12" height="32" fill="${cap}"/><rect x="168" y="98" width="64" height="18" rx="6" fill="${cap}"/><rect x="226" y="101" width="34" height="9" rx="4" fill="${cap}"/>`, lbl: [160, 222, 80, 72] },
      wand: { body: f => `<rect x="168" y="160" width="64" height="180" rx="12" fill="${f}"/>`, top: `<rect x="171" y="70" width="58" height="96" rx="10" fill="${cap}"/>`, lbl: [175, 222, 50, 80] },
      kit: { body: f => `<rect x="88" y="205" width="224" height="130" rx="8" fill="${f}"/>`, top: `<rect x="80" y="182" width="240" height="38" rx="6" fill="${c}"/><rect x="80" y="182" width="240" height="38" rx="6" fill="#000" opacity=".06"/><rect x="190" y="182" width="20" height="153" fill="${cap}"/><path d="M200 182C172 146 146 160 168 182ZM200 182C228 146 254 160 232 182Z" fill="${cap}"/>`, lbl: [108, 248, 66, 56] },
    };
    const sh = S[p.shape] || S.jar;
    const [lx, ly, lw, lh] = sh.lbl;
    const label = esc(p.label || '');
    const fs = Math.min(13, (lw - 10) / Math.max(4, label.length * 0.62));

    const productSvg = view === 2
      ? `<path d="M90 232C80 160 170 120 232 140c70 22 98 82 68 130-30 50-140 60-180 30-20-15-26-40-30-68Z" fill="${c}"/>
         <path d="M90 232C80 160 170 120 232 140c70 22 98 82 68 130-30 50-140 60-180 30-20-15-26-40-30-68Z" fill="url(#${uid})"/>
         <ellipse cx="170" cy="190" rx="38" ry="14" fill="#fff" opacity=".35" transform="rotate(-18 170 190)"/>
         <circle cx="300" cy="150" r="10" fill="${c}"/><circle cx="320" cy="180" r="6" fill="${c}" opacity=".8"/><circle cx="110" cy="320" r="8" fill="${c}" opacity=".9"/>`
      : `<ellipse cx="200" cy="344" rx="${p.shape === 'kit' ? 130 : 85}" ry="10" fill="#000" opacity=".08"/>
         ${sh.body(c)}${sh.body(`url(#${uid})`)}${sh.top}
         <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="4" fill="#fff" opacity=".92"/>
         <text x="${lx + lw / 2}" y="${ly + lh * 0.36}" text-anchor="middle" font-family="Jost, sans-serif" font-size="6.5" letter-spacing="1.6" fill="#321B20" opacity=".7">LUMIS STAR</text>
         <text x="${lx + lw / 2}" y="${ly + lh * 0.72}" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="600" font-size="${fs.toFixed(1)}" fill="#2B2B2B">${label}</text>`;

    const scene = bare ? '' : `<rect width="400" height="400" fill="${bg}"/>
      <circle cx="${view === 1 ? 230 : 200}" cy="${view === 1 ? 190 : 215}" r="150" fill="#fff" opacity=".55"/>
      ${view === 1 ? leaf(330, 330, -150, 1.1) + leaf(40, 120, -20, .8) : leaf(60, 330, -35, 1.1) + leaf(300, 110, 200, .8)}`;

    return `<svg viewBox="0 0 400 400" class="w-full h-full block" role="img" aria-label="${esc(p.name)}" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="${uid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".4" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient></defs>
      ${scene}${productSvg}</svg>`;
  }

  function hydrate(root = document) {
    $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon, 'w-full h-full'); el.removeAttribute('data-icon'); });
    $$('[data-art]', root).forEach(el => {
      const p = DECOR[el.dataset.art];
      if (p) el.innerHTML = productArt(p, +el.dataset.view || 0, el.hasAttribute('data-bare'));
      el.removeAttribute('data-art');
    });
  }

  /* ================= Card de produto ================= */
  function productCard(p) {
    const v = variantOf(p);
    const price = priceOf(p, v), old = oldPriceOf(p, v);
    const href = productUrl(p);
    const off = old ? Math.round((1 - price / old) * 100) : 0;
    return `<article class="group flex h-full flex-col">
      <a href="${href}" class="relative block aspect-[4/5] overflow-hidden bg-cream-dark" aria-label="Ver ${esc(p.name)}">
        <div class="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">${productMedia(p)}</div>
        <div class="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          ${off ? `<span class="bg-[#4A0D1C] px-2.5 py-1 text-[11px] font-medium text-white">-${off}%</span>` : ''}
          ${p.badge ? `<span class="bg-cream px-2.5 py-1 text-[11px] font-medium text-[#4A0D1C]">${esc(p.badge)}</span>` : ''}
        </div>
      </a>
      <div class="flex flex-1 flex-col border-b border-[#D8C9B5] pb-4 pt-4">
        <p class="text-[11px] uppercase tracking-[.16em] text-leaf-dark">${esc(CATEGORIES[p.category]?.name || BRAND.name)}</p>
        <h3 class="mt-2 font-serif text-xl leading-snug"><a href="${href}" class="hover:text-blush-dark">${esc(p.name)}</a></h3>
        <div class="mt-3 flex flex-wrap items-baseline gap-x-2">
          ${old ? `<s class="text-sm text-ink/50"><span class="sr-only">De </span>${brl(old)}</s>` : ''}
          <span class="text-lg font-semibold"><span class="sr-only">Por </span>${brl(price)}</span>
        </div>
        <div class="mt-auto pt-4">
          ${p.stock <= 0
            ? '<button type="button" class="btn btn-outline btn-sm w-full" disabled>Esgotado</button>'
            : `<button type="button" data-add="${esc(p.id)}" class="btn btn-primary btn-sm w-full" aria-label="Adicionar ${esc(p.name)} à sacola">Adicionar à sacola</button>`}
        </div>
      </div>
    </article>`;
  }
  const slide = html => `<div class="snap-start shrink-0 w-[72%] sm:w-[44%] md:w-[31%] lg:w-[23.4%]">${html}</div>`;

  /* ================= Carrinho (estado) ================= */
  const CART_KEY = 'bb_cart_v1';
  const Cart = {
    items: (() => {
      try {
        const data = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        return Array.isArray(data) ? data.filter(i => i && typeof i.id === 'string' && typeof i.key === 'string' && Number.isInteger(i.qty) && i.qty > 0) : [];
      } catch { return []; }
    })(),
    save() { localStorage.setItem(CART_KEY, JSON.stringify(this.items)); renderCart(); },
    inCart(id, exceptKey) { return this.items.filter(i => i.id === id && i.key !== exceptKey).reduce((s, i) => s + i.qty, 0); },
    add(id, variantName, qty = 1) {
      const p = byId(id); if (!p) return false;
      const room = p.stock - this.inCart(id);
      if (room <= 0) {
        toast(p.stock > 0 ? `Você já adicionou todo o estoque disponível de ${p.name}.` : `${p.name} está esgotado.`);
        return false;
      }
      const n = Math.min(qty, room);
      if (n < qty) toast(`Só há ${p.stock} unidade(s) de ${p.name} em estoque.`);
      const v = variantOf(p, variantName);
      const key = `${id}|${v?.name || ''}`;
      const item = this.items.find(i => i.key === key);
      if (item) item.qty = Math.min(99, item.qty + n);
      else this.items.push({ key, id, variant: v?.name || null, qty: n });
      this.save();
      return true;
    },
    setQty(key, qty) {
      const item = this.items.find(i => i.key === key); if (!item) return;
      if (qty <= 0) this.items = this.items.filter(i => i.key !== key);
      else {
        const stock = byId(item.id)?.stock ?? 0;
        const max = stock - this.inCart(item.id, key);
        if (qty > max) toast(`Só há ${stock} unidade(s) em estoque.`);
        item.qty = Math.max(1, Math.min(99, qty, max));
      }
      this.save();
    },
    // Remove itens inexistentes/esgotados e ajusta quantidades ao estoque atual
    prune() {
      const before = JSON.stringify(this.items);
      const used = {};
      this.items = this.items.filter(i => byId(i.id)).map(i => {
        const left = byId(i.id).stock - (used[i.id] || 0);
        const qty = Math.min(i.qty, Math.max(0, left));
        used[i.id] = (used[i.id] || 0) + qty;
        return { ...i, qty };
      }).filter(i => i.qty > 0);
      if (JSON.stringify(this.items) !== before) {
        localStorage.setItem(CART_KEY, JSON.stringify(this.items));
        toast('Atualizamos sua sacola conforme o estoque disponível.');
      }
    },
    clear() { this.items = []; this.save(); },
    lines() {
      return this.items.filter(i => byId(i.id)).map(i => {
        const p = byId(i.id), v = variantOf(p, i.variant), price = priceOf(p, v);
        return { ...i, p, v, price, total: price * i.qty };
      });
    },
    count() { return this.lines().reduce((s, l) => s + l.qty, 0); },
    subtotal() { return this.lines().reduce((s, l) => s + l.total, 0); },
  };
  window.addEventListener('storage', e => {
    if (e.key !== CART_KEY) return;
    try { Cart.items = JSON.parse(e.newValue || '[]'); } catch { Cart.items = []; }
    renderCart();
  });

  function freeShippingHTML(subtotal) {
    const left = FREE - subtotal, pct = Math.min(100, (subtotal / FREE) * 100);
    const msg = left > 0
      ? `Faltam <strong class="font-semibold">${brl(left)}</strong> para você ganhar <strong class="font-semibold">frete grátis</strong>`
      : '<strong class="font-semibold text-leaf-dark">Parabéns! Você ganhou frete grátis</strong>';
    return `<p class="flex items-center gap-2 text-sm">${icon('truck', 'w-5 h-5 text-leaf-dark')}<span>${msg}</span></p>
      <div class="mt-2.5 h-2 rounded-full bg-ink/10 overflow-hidden" role="progressbar" aria-label="Progresso para frete grátis" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}">
        <div class="h-full rounded-full bg-gradient-to-r from-blush to-leaf transition-[width] duration-700" style="width:${pct}%"></div>
      </div>`;
  }

  const qtyStepper = l => `<div class="inline-flex items-center rounded-full border border-ink/20 bg-white">
      <button type="button" class="w-10 h-10 grid place-items-center rounded-full hover:bg-ink/5" data-qty="${esc(l.key)}" data-delta="-1" aria-label="Diminuir quantidade de ${esc(l.p.name)}">${icon('minus', 'w-4 h-4')}</button>
      <span class="w-6 text-center text-sm tabular-nums" aria-label="Quantidade">${l.qty}</span>
      <button type="button" class="w-10 h-10 grid place-items-center rounded-full hover:bg-ink/5" data-qty="${esc(l.key)}" data-delta="1" aria-label="Aumentar quantidade de ${esc(l.p.name)}">${icon('plus', 'w-4 h-4')}</button>
    </div>`;

  const cartLineHTML = l => `<li class="flex gap-4 py-4 border-b border-ink/10 last:border-0">
      <a href="${productUrl(l.p)}" class="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white" tabindex="-1" aria-hidden="true">${productMedia(l.p)}</a>
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <a href="${productUrl(l.p)}" class="font-serif text-lg leading-tight hover:text-blush-dark">${esc(l.p.name)}</a>
          <button type="button" data-remove="${esc(l.key)}" class="icon-btn w-10 h-10 -mr-2 -mt-2 text-ink/50 hover:text-ink" aria-label="Remover ${esc(l.p.name)}">${icon('trash', 'w-4 h-4')}</button>
        </div>
        ${l.v ? `<p class="text-xs text-ink/60 mt-0.5">${esc(l.p.variants.label)}: ${esc(l.v.name)}</p>` : ''}
        <div class="mt-3 flex items-center justify-between gap-2">${qtyStepper(l)}<span class="font-medium tabular-nums">${brl(l.total)}</span></div>
      </div>
    </li>`;

  function renderCart() {
    const count = Cart.count(), sub = Cart.subtotal(), lines = Cart.lines();
    $$('[data-cart-count]').forEach(el => { el.textContent = count > 99 ? '99+' : count; el.hidden = count === 0; });
    $$('[data-cart-button]').forEach(el => el.setAttribute('aria-label', `Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`));

    if ($('#cart-drawer')) {
      $('#cart-title-count').textContent = count ? `(${count})` : '';
      $('#cart-shipping').hidden = !count;
      $('#cart-shipping').innerHTML = freeShippingHTML(sub);
      $('#cart-footer').hidden = !count;
      $('#cart-subtotal').textContent = brl(sub);
      const inst = installments(sub);
      $('#cart-installments').textContent = `ou ${inst.n}x de ${brl(inst.value)} sem juros · ${brl(sub * (1 - BRAND.pixDiscount))} no Pix`;
      $('#cart-items').innerHTML = lines.length
        ? `<ul>${lines.map(cartLineHTML).join('')}</ul>`
        : `<div class="h-full flex flex-col items-center justify-center text-center py-16">
            <span class="w-16 h-16 rounded-full bg-blush-light text-blush-dark grid place-items-center">${icon('bag', 'w-7 h-7')}</span>
            <p class="font-serif text-2xl mt-5">Sua sacola está vazia</p>
            <p class="text-sm text-ink/60 mt-2 max-w-xs">Descubra fórmulas naturais que vão transformar sua rotina de autocuidado.</p>
            <a href="catalogo.html" class="btn btn-primary mt-6">Explorar produtos</a>
          </div>`;
    }
    document.dispatchEvent(new CustomEvent('cart:change'));
  }

  /* ================= Camadas: drawer, modal, bottom-sheet ================= */
  const stack = [];
  function openLayer(el) {
    if (!el || el.classList.contains('is-open')) return;
    stack.push({ el, trigger: document.activeElement });
    toggleSearch(false);
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    $('#overlay').classList.add('is-open');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => (el.querySelector('[data-autofocus]') || el.querySelector('button, [href], input'))?.focus({ preventScroll: true }), 80);
  }
  function closeLayer(el) {
    const i = stack.findIndex(s => s.el === el);
    if (i < 0) return;
    const [{ trigger }] = stack.splice(i, 1);
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    if (!stack.length) {
      $('#overlay').classList.remove('is-open');
      document.body.classList.remove('overflow-hidden');
    }
    if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
  }
  const closeTop = () => stack.length && closeLayer(stack[stack.length - 1].el);

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    $('[data-msg]', t).textContent = msg;
    t.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-open'), 2800);
  }
  const announce = msg => { const l = $('#sr-live'); l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 50); };

  function bumpCount() {
    $$('[data-cart-count]').forEach(el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  }
  function flashAdded(btn) {
    if (!btn || btn.classList.contains('is-added')) return;
    const html = btn.innerHTML;
    btn.classList.add('is-added');
    btn.innerHTML = `${icon('check', 'w-4 h-4')} Adicionado!`;
    setTimeout(() => { btn.innerHTML = html; btn.classList.remove('is-added'); }, 1600);
  }
  function feedbackAdded(btn, p) {
    flashAdded(btn);
    bumpCount();
    announce(`${p.name} adicionado ao carrinho.`);
    setTimeout(() => openLayer($('#cart-drawer')), 320);
  }

  /* ================= Header, menu, busca, conta, footer ================= */
  const NAV = [
    { label: 'Maquiagem', href: 'catalogo.html?cat=maquiagem', cat: 'maquiagem' },
    { label: 'Gloss & Lábios', href: 'catalogo.html?cat=gloss', cat: 'gloss' },
    { label: 'Perfumes', href: 'catalogo.html?cat=perfumes', cat: 'perfumes' },
    { label: 'Kits', href: 'catalogo.html?cat=kits', cat: 'kits' },
    { label: 'Promoções', href: 'catalogo.html?cat=promocoes', cat: 'promocoes' },
    { label: 'Sobre a marca', href: 'sobre.html' },
  ];
  const [brandFirst, ...brandRest] = BRAND.name.split(' ');
  const logo = (cls = '') => `<a href="index.html" class="inline-flex items-center gap-2 whitespace-nowrap font-serif leading-none tracking-wide ${cls}" aria-label="${esc(BRAND.name)} — página inicial"><img src="assets/images/lumis-star-logo.svg" alt="" class="h-14 w-14 rounded-full object-cover min-[380px]:h-16 min-[380px]:w-16 sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px]"><span class="text-lg min-[380px]:text-2xl sm:text-3xl">${esc(brandFirst)} <em class="not-italic text-blush-dark">${esc(brandRest.join(' '))}</em></span></a>`;
  const waLink = (text = 'Olá! Gostaria de ajuda com minha compra.') => BRAND.whatsapp ? `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}` : '';
  const currentCat = PAGE === 'catalog' ? params.get('cat') : null;

  function renderHeader() {
    const el = $('#site-header'); if (!el) return;
    if (PAGE === 'checkout') {
      el.innerHTML = `<header class="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/10">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          ${logo()}
          <p class="flex items-center gap-2 text-sm text-leaf-dark">${icon('lock', 'w-4 h-4')} <span><span class="hidden sm:inline">Compra </span>100% segura</span></p>
        </div></header>`;
      return;
    }
    el.innerHTML = `<header class="sticky top-0 z-40">
      <div class="bg-ink text-cream">
        <div class="relative h-9 overflow-hidden max-w-7xl mx-auto px-4 text-xs sm:text-[13px] tracking-wide" data-topbar>
          <p class="topbar-msg is-active">${icon('truck', 'w-4 h-4 mr-2')} Frete grátis para compras acima de&nbsp;<strong class="font-semibold">${brl(FREE).replace(',00', '')}</strong></p>
          <p class="topbar-msg">${icon('gift', 'w-4 h-4 mr-2')} Cupom&nbsp;<strong class="font-semibold text-blush">BEMVINDO10</strong>&nbsp;para 10% OFF na 1ª compra</p>
        </div>
      </div>
      <div class="relative bg-cream/95 backdrop-blur border-b border-ink/10 transition-shadow" data-header-bar>
        <div class="max-w-7xl mx-auto px-3 sm:px-6 h-16 lg:h-20 grid grid-cols-[auto_1fr_auto] lg:flex items-center gap-2 lg:gap-10">
          <div class="flex items-center lg:hidden">
            <button type="button" class="icon-btn" data-open="#mobile-menu" aria-label="Abrir menu" aria-controls="mobile-menu">${icon('menu', 'w-6 h-6')}</button>
            <button type="button" class="icon-btn" data-toggle-search aria-label="Buscar" aria-controls="search-panel" aria-expanded="false">${icon('search', 'w-[22px] h-[22px]')}</button>
          </div>
          ${logo('justify-self-center')}
          <nav aria-label="Principal" class="hidden lg:flex items-center gap-8 text-[15px]">
            ${NAV.map(n => `<a href="${n.href}" class="nav-link" ${n.cat && n.cat === currentCat ? 'aria-current="page"' : ''}>${n.label}</a>`).join('')}
          </nav>
          <div class="flex items-center justify-end gap-0.5 lg:ml-auto">
            <button type="button" class="icon-btn hidden lg:inline-flex" data-toggle-search aria-label="Buscar" aria-controls="search-panel" aria-expanded="false">${icon('search', 'w-[22px] h-[22px]')}</button>
            <a href="minha-conta.html" class="icon-btn hidden sm:inline-flex" aria-label="Minha conta">${icon('user', 'w-[22px] h-[22px]')}</a>
            <button type="button" class="icon-btn relative" data-open="#cart-drawer" data-cart-button aria-controls="cart-drawer">
              ${icon('bag', 'w-[22px] h-[22px]')}
              <span data-cart-count hidden class="absolute top-1 right-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-blush-dark text-white text-[10px] font-semibold grid place-items-center">0</span>
            </button>
          </div>
        </div>
        <div id="search-panel" hidden class="absolute inset-x-0 top-full bg-cream border-b border-ink/10 shadow-xl shadow-ink/5">
          <form action="catalogo.html" role="search" class="max-w-3xl mx-auto px-4 py-5">
            <label for="search-input" class="sr-only">Buscar produtos</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50">${icon('search')}</span>
              <input id="search-input" name="q" type="search" autocomplete="off" maxlength="60" placeholder="Busque por sérum, máscara, batom…" class="input input-icon">
              <button type="button" class="icon-btn absolute right-1 top-1/2 -translate-y-1/2" data-toggle-search aria-label="Fechar busca">${icon('close')}</button>
            </div>
            <ul id="search-results" class="mt-2" aria-live="polite"></ul>
            <div id="search-suggest" class="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span class="text-ink/60">Mais buscados:</span>
              ${['Gloss Lumis Star', 'Perfumes', 'Maquiagem', 'Kits'].map(s => `<button type="button" data-suggest="${s}" class="px-3 py-1.5 rounded-full border border-ink/15 hover:border-ink transition">${s}</button>`).join('')}
            </div>
          </form>
        </div>
      </div>
    </header>`;
  }

  function renderShell() {
    const wrap = document.createElement('div');
    const common = `
      <div id="overlay" aria-hidden="true"></div>
      <div id="toast" class="toast flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-ink text-cream text-sm shadow-2xl" role="status" aria-live="polite">
        <span class="text-blush">${icon('check', 'w-5 h-5')}</span><span data-msg></span>
      </div>
      <div id="sr-live" class="sr-only" aria-live="polite"></div>`;
    if (PAGE === 'checkout') { wrap.innerHTML = common; document.body.append(...wrap.children); return; }

    wrap.innerHTML = common + `
      <aside id="cart-drawer" class="layer layer-right fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-cream flex flex-col shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">
        <div class="flex items-center justify-between px-5 h-16 border-b border-ink/10 shrink-0">
          <h2 id="cart-title" class="font-serif text-2xl">Sua sacola <span id="cart-title-count" class="text-ink/50 text-xl"></span></h2>
          <button type="button" class="icon-btn -mr-2" data-close aria-label="Fechar carrinho">${icon('close', 'w-6 h-6')}</button>
        </div>
        <div id="cart-shipping" class="px-5 py-4 bg-white/70 border-b border-ink/10 shrink-0"></div>
        <div id="cart-items" class="flex-1 overflow-y-auto overscroll-contain px-5"></div>
        <div id="cart-footer" class="shrink-0 border-t border-ink/10 bg-white px-5 pt-4 pb-5 space-y-3">
          <div class="flex items-baseline justify-between"><span class="text-ink/70">Subtotal</span><strong id="cart-subtotal" class="text-xl font-medium tabular-nums"></strong></div>
          <p id="cart-installments" class="text-xs text-ink/60 -mt-1"></p>
          <a href="checkout.html" class="btn btn-primary w-full">${icon('lock', 'w-4 h-4')} Finalizar compra</a>
          <button type="button" class="w-full min-h-[44px] text-sm underline underline-offset-4 hover:text-blush-dark" data-close>Continuar comprando</button>
        </div>
      </aside>

      <aside id="mobile-menu" class="layer layer-left fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm bg-cream flex flex-col shadow-2xl" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
        <div class="flex items-center justify-between px-5 h-16 border-b border-ink/10">
          ${logo()}
          <button type="button" class="icon-btn -mr-2" data-close aria-label="Fechar menu">${icon('close', 'w-6 h-6')}</button>
        </div>
        <nav aria-label="Menu móvel" class="flex-1 overflow-y-auto px-5 py-4">
          <ul>${NAV.map(n => `<li><a href="${n.href}" class="flex items-center justify-between py-4 border-b border-ink/10 font-serif text-2xl" data-close-on-nav>${n.label}${icon('chevronR', 'w-5 h-5 text-ink/40')}</a></li>`).join('')}</ul>
          <div class="mt-6 rounded-2xl bg-blush-light p-5">
            <p class="text-xs uppercase tracking-[.2em] text-blush-dark">Primeira compra?</p>
            <p class="font-serif text-2xl mt-1">10% OFF com o cupom <strong>BEMVINDO10</strong></p>
          </div>
        </nav>
        <div class="p-5 border-t border-ink/10 grid grid-cols-2 gap-3">
          <a href="minha-conta.html" data-close-on-nav class="btn btn-outline btn-sm">${icon('user', 'w-4 h-4')} Minha conta</a>
          <a href="${waLink()}" target="_blank" rel="noopener noreferrer" class="btn btn-leaf btn-sm">${icon('whatsapp', 'w-4 h-4')} WhatsApp</a>
        </div>
      </aside>

      <div id="account-modal" class="layer layer-fade fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none" role="dialog" aria-modal="true" aria-labelledby="account-title" aria-hidden="true">
        <div class="pointer-events-auto relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-cream rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
          <button type="button" class="icon-btn absolute top-3 right-3" data-close aria-label="Fechar">${icon('close', 'w-6 h-6')}</button>
          <h2 id="account-title" class="font-serif text-3xl">Minha conta</h2>
          <p class="text-sm text-ink/70 mt-1">Entre para consultar seus pedidos e acompanhar o status.</p>
          <div class="mt-6 grid grid-cols-2 p-1 rounded-full bg-ink/5" role="tablist" aria-label="Acesso">
            <button type="button" role="tab" id="tab-login" aria-controls="form-login" aria-selected="true" data-auth-tab="login" class="min-h-[44px] rounded-full text-sm font-medium transition aria-selected:bg-white aria-selected:shadow-sm">Entrar</button>
            <button type="button" role="tab" id="tab-register" aria-controls="form-register" aria-selected="false" tabindex="-1" data-auth-tab="register" class="min-h-[44px] rounded-full text-sm font-medium transition aria-selected:bg-white aria-selected:shadow-sm">Criar conta</button>
          </div>
          <form id="form-login" role="tabpanel" aria-labelledby="tab-login" data-auth="login" class="mt-6 space-y-4" novalidate>
            <div><label class="label" for="login-email">E-mail</label><input id="login-email" type="email" class="input" autocomplete="email" required></div>
            <div><label class="label" for="login-pass">Senha</label><input id="login-pass" type="password" class="input" autocomplete="current-password" required minlength="8"></div>
            <p data-auth-message role="status" class="text-sm text-ink/70" aria-live="polite"></p>
            <button type="submit" class="btn btn-primary w-full">Entrar</button>
          </form>
          <form id="form-register" role="tabpanel" aria-labelledby="tab-register" data-auth="register" class="mt-6 space-y-4" hidden novalidate>
            <div><label class="label" for="reg-name">Nome</label><input id="reg-name" class="input" autocomplete="name" required minlength="2"></div>
            <div><label class="label" for="reg-email">E-mail</label><input id="reg-email" type="email" class="input" autocomplete="email" required></div>
            <div><label class="label" for="reg-pass">Senha</label><input id="reg-pass" type="password" class="input" autocomplete="new-password" required minlength="8" aria-describedby="reg-pass-hint"><p id="reg-pass-hint" class="hint">Mínimo de 8 caracteres.</p></div>
            <label class="flex items-start gap-3 text-sm"><input type="checkbox" class="mt-0.5 w-5 h-5 accent-leaf-dark" checked> Quero receber novidades e cupons exclusivos por e-mail.</label>
            <p data-auth-message role="status" class="text-sm text-ink/70" aria-live="polite"></p>
            <button type="submit" class="btn btn-primary w-full">Criar conta</button>
          </form>
        </div>
      </div>

      ${BRAND.whatsapp ? `<a id="wa-float" href="${waLink()}" target="_blank" rel="noopener noreferrer" class="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-30 w-14 h-14 rounded-full bg-[#1F8F4E] text-white grid place-items-center shadow-xl shadow-ink/20" aria-label="Atendimento pelo WhatsApp">${icon('whatsapp', 'w-7 h-7')}</a>` : ''}`;
    document.body.append(...wrap.children);
  }

  function renderFooter() {
    const el = $('#site-footer'); if (!el) return;
    const year = new Date().getFullYear();
    const seals = [['lock', 'Checkout validado', 'Valores conferidos no servidor'], ['box', 'Estoque consultado', 'Saldo verificado ao concluir o pedido'], ['truck', 'Frete estimado', 'Cálculo pelo CEP informado']]
      .map(([i, t, d]) => `<li class="flex items-center gap-3 rounded-xl border border-cream/15 p-3">${icon(i, 'w-6 h-6 text-blush')}<span><span class="block text-sm font-medium text-cream">${t}</span><span class="block text-[11px] text-cream/60 leading-tight">${d}</span></span></li>`).join('');
    const legal = `<p>© ${year} ${esc(BRAND.name)}. Todos os direitos reservados.</p>`;

    if (PAGE === 'checkout') {
      el.innerHTML = `<footer class="border-t border-ink/10 mt-12"><div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-xs text-ink/60 flex flex-col sm:flex-row gap-3 justify-between">${legal}<p class="flex items-center gap-1.5">${icon('lock', 'w-4 h-4')} Ambiente protegido com criptografia SSL</p></div></footer>`;
      return;
    }
    const links = (title, id, items) => `<nav aria-labelledby="${id}">
        <h2 id="${id}" class="text-xs uppercase tracking-[.2em] text-cream font-medium mb-4">${title}</h2>
        <ul class="space-y-1 text-sm">${items.map(([t, h]) => `<li><a href="${h}" class="inline-block py-1.5 hover:text-blush transition-colors">${t}</a></li>`).join('')}</ul>
      </nav>`;
    el.innerHTML = `<footer class="bg-ink text-cream/75">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div class="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div class="col-span-2 lg:col-span-1">
            ${logo('text-cream [&_em]:text-blush')}
            <p class="mt-4 text-sm max-w-xs leading-relaxed">${esc(BRAND.slogan)}. Maquiagem, gloss, perfumes e kits para acompanhar seu estilo.</p>
          </div>
          ${links('Explore', 'f-explore', [['Maquiagem', 'catalogo.html?cat=maquiagem'], ['Gloss & Lábios', 'catalogo.html?cat=gloss'], ['Perfumes', 'catalogo.html?cat=perfumes'], ['Kits', 'catalogo.html?cat=kits'], ['Promoções', 'catalogo.html?cat=promocoes']])}
          ${links('Lumis Star', 'f-brand', [['Sobre a marca', 'sobre.html'], ['Todos os produtos', 'catalogo.html']])}
          ${BRAND.whatsapp || BRAND.email ? `<div class="col-span-2 lg:col-span-1">
            <h2 class="text-xs uppercase tracking-[.2em] text-cream font-medium mb-4">Atendimento</h2>
            ${BRAND.whatsapp ? `<a href="${waLink()}" target="_blank" rel="noopener noreferrer" class="btn btn-leaf btn-sm">${icon('whatsapp', 'w-4 h-4')} Fale pelo WhatsApp</a>` : ''}
            ${BRAND.email ? `<p class="mt-4 text-sm flex items-center gap-2">${icon('mail', 'w-4 h-4')} <a href="mailto:${esc(BRAND.email)}" class="hover:text-blush">${esc(BRAND.email)}</a></p>` : ''}
          </div>` : ''}
        </div>
        <div class="mt-10 border-t border-cream/15 pt-8">
          <div>
            <h2 class="text-xs uppercase tracking-[.2em] text-cream font-medium mb-4">Informações da compra</h2>
            <ul class="grid grid-cols-2 gap-2">${seals}</ul>
          </div>
        </div>
        <div class="mt-8 border-t border-cream/15 pt-6 text-xs text-cream/60">${legal}</div>
      </div>
    </footer>`;
  }

  /* ================= Busca ================= */
  function searchProducts(q) {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return PRODUCTS.filter(p => {
      const hay = norm(`${p.name} ${p.short} ${CATEGORIES[p.category].name} ${LINES[p.line] || ''} ${p.benefits.map(b => BENEFITS[b]).join(' ')}`);
      return terms.every(t => hay.includes(t));
    });
  }
  function renderSearch(q) {
    const list = $('#search-results');
    $('#search-suggest').hidden = !!q.trim();
    if (!q.trim()) { list.innerHTML = ''; return; }
    const res = searchProducts(q);
    list.innerHTML = res.length
      ? res.slice(0, 5).map(p => `<li><a href="${productUrl(p)}" class="flex items-center gap-4 py-2.5 px-2 -mx-2 rounded-xl hover:bg-white transition">
          <span class="w-14 h-14 shrink-0 rounded-lg overflow-hidden">${productMedia(p)}</span>
          <span class="flex-1 min-w-0"><span class="block font-serif text-lg leading-tight truncate">${esc(p.name)}</span><span class="text-sm text-ink/60">${brl(p.price)}</span></span>
          ${icon('chevronR', 'w-4 h-4 text-ink/40')}</a></li>`).join('')
        + `<li class="pt-3"><a href="catalogo.html?q=${encodeURIComponent(q.trim())}" class="text-sm font-medium underline underline-offset-4">Ver todos os ${res.length} resultados</a></li>`
      : `<li class="py-4 text-sm text-ink/70">Nenhum produto encontrado para “${esc(q)}”. Tente outro termo.</li>`;
  }
  function toggleSearch(force) {
    const panel = $('#search-panel'); if (!panel) return;
    const open = force ?? panel.hidden;
    panel.hidden = !open;
    $$('[data-toggle-search][aria-expanded]').forEach(b => b.setAttribute('aria-expanded', String(open)));
    if (open) $('#search-input').focus();
  }

  /* ================= Carrossel ================= */
  function initCarousel(root) {
    const track = $('[data-track]', root); if (!track) return;
    const prev = $('[data-prev]', root), next = $('[data-next]', root);
    const step = () => {
      const item = track.firstElementChild; if (!item) return track.clientWidth;
      const w = item.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
      return w * Math.max(1, Math.floor(track.clientWidth / w));
    };
    const update = () => {
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ================= Máscaras e validações ================= */
  const MASKS = {
    cep: () => '00000-000',
    cpf: () => '000.000.000-00',
    phone: d => (d.length > 10 ? '(00) 00000-0000' : '(00) 0000-0000'),
    card: d => (/^3[47]/.test(d) ? '0000 000000 00000' : '0000 0000 0000 0000'),
    exp: () => '00/00',
    cvc: () => '0000',
  };
  function applyMask(value, pattern) {
    const d = digits(value); let out = '', i = 0;
    for (const ch of pattern) { if (i >= d.length) break; out += ch === '0' ? d[i++] : ch; }
    return out;
  }
  function validCPF(v) {
    const d = digits(v);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const dv = n => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
    return dv(9) === +d[9] && dv(10) === +d[10];
  }
  function luhn(v) {
    const d = digits(v); if (d.length < 13 || d.length > 19) return false;
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) { let n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
    return sum % 10 === 0;
  }
  function validExp(v) {
    const [m, y] = v.split('/').map(Number);
    if (!m || m > 12 || y === undefined || Number.isNaN(y)) return false;
    const now = new Date(), yy = now.getFullYear() % 100;
    return y > yy || (y === yy && m >= now.getMonth() + 1);
  }

  /* ================= CEP e frete ================= */
  async function lookupCep(cep) {
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!r.ok) throw new Error('viacep');
      const d = await r.json();
      return d.erro ? null : d;
    } catch {
      return { offline: true };
    }
  }
  // Tabela simulada por região (1º dígito do CEP). Em produção, use a API da transportadora/Melhor Envio.
  const SHIP_TABLE = [[18.9, 6, 29.9, 2], [18.9, 6, 29.9, 2], [19.9, 7, 32.9, 3], [19.9, 7, 32.9, 3], [24.9, 9, 42.9, 4], [24.9, 9, 42.9, 4], [29.9, 12, 54.9, 6], [22.9, 8, 39.9, 4], [19.9, 6, 34.9, 3], [19.9, 7, 36.9, 3]];
  function shippingOptions(cep, subtotal) {
    const [pac, pacDays, exp, expDays] = SHIP_TABLE[+cep[0]];
    return [
      { id: 'economica', name: 'Entrega Econômica', price: subtotal >= FREE ? 0 : pac, days: pacDays },
      { id: 'expressa', name: 'Entrega Expressa', price: exp, days: expDays },
    ];
  }

  /* ================= Eventos globais ================= */
  function bindGlobal() {
    document.addEventListener('click', async e => {
      const t = e.target.closest('[data-add],[data-open],[data-close],[data-close-on-nav],[data-toggle-search],[data-suggest],[data-qty],[data-remove],[data-accordion],[data-copy],[data-auth-tab],[data-signout],[data-reload],#overlay');
      if (!t) {
        const panel = $('#search-panel');
        if (panel && !panel.hidden && !e.target.closest('#search-panel')) toggleSearch(false);
        return;
      }
      if (t.id === 'overlay') return closeTop();
      if (t.hasAttribute('data-reload')) return location.reload();
      if (t.hasAttribute('data-signout')) {
        const { error } = await db.auth.signOut();
        if (error) return handleError(error);
        location.href = 'minha-conta.html';
        return;
      }

      if (t.hasAttribute('data-add')) {
        const p = byId(t.dataset.add); if (!p) return;
        if (Cart.add(p.id, t.dataset.variant)) feedbackAdded(t, p);
      } else if (t.hasAttribute('data-open')) {
        const target = $(t.dataset.open);
        const parent = t.closest('.layer.is-open');
        if (parent && parent !== target) closeLayer(parent);
        openLayer(target);
      } else if (t.hasAttribute('data-close')) {
        closeLayer(t.closest('.layer'));
      } else if (t.hasAttribute('data-close-on-nav')) {
        closeLayer(t.closest('.layer'));
      } else if (t.hasAttribute('data-toggle-search')) {
        toggleSearch();
      } else if (t.hasAttribute('data-suggest')) {
        const input = $('#search-input'); input.value = t.dataset.suggest; renderSearch(input.value); input.focus();
      } else if (t.hasAttribute('data-qty') || t.hasAttribute('data-remove')) {
        const key = t.dataset.qty ?? t.dataset.remove;
        const scope = t.closest('[id]');
        const item = Cart.items.find(i => i.key === key); if (!item) return;
        if (t.hasAttribute('data-remove')) { Cart.setQty(key, 0); toast('Produto removido da sacola'); return; }
        const delta = +t.dataset.delta;
        Cart.setQty(key, item.qty + delta);
        requestAnimationFrame(() => scope && $(`[data-qty="${CSS.escape(key)}"][data-delta="${delta}"]`, scope)?.focus());
      } else if (t.hasAttribute('data-accordion')) {
        const open = t.getAttribute('aria-expanded') !== 'true';
        t.setAttribute('aria-expanded', String(open));
        document.getElementById(t.getAttribute('aria-controls'))?.classList.toggle('is-open', open);
      } else if (t.hasAttribute('data-copy')) {
        navigator.clipboard?.writeText(t.dataset.copy).then(() => toast(`Cupom ${t.dataset.copy} copiado!`), () => toast(`Cupom: ${t.dataset.copy}`));
      } else if (t.hasAttribute('data-auth-tab')) {
        const which = t.dataset.authTab;
        $$('[data-auth-tab]').forEach(b => { const on = b === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
        $$('[data-auth]').forEach(f => { f.hidden = f.dataset.auth !== which; });
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const panel = $('#search-panel');
        if (panel && !panel.hidden) return toggleSearch(false);
        return closeTop();
      }
      if (e.key === 'Tab' && stack.length) {
        const el = stack[stack.length - 1].el;
        const f = $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea', el).filter(x => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    document.addEventListener('input', e => {
      const m = e.target.dataset?.mask;
      if (m && MASKS[m]) e.target.value = applyMask(e.target.value, MASKS[m](digits(e.target.value)));
      if (e.target.id === 'search-input') renderSearch(e.target.value);
    });

    $$('[data-auth]').forEach(form => form.addEventListener('submit', async e => {
      e.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) return form.reportValidity();
      const message = $('[data-auth-message]', form);
      const button = $('button[type="submit"]', form);
      const label = button.textContent;
      message.textContent = '';
      message.classList.remove('text-red-700');
      button.disabled = true;
      button.textContent = form.dataset.auth === 'register' ? 'Criando conta…' : 'Entrando…';
      try {
        if (!db) throw new Error('Serviço de autenticação indisponível.');
        const registering = form.dataset.auth === 'register';
        const email = (registering ? $('#reg-email') : $('#login-email')).value.trim();
        const password = (registering ? $('#reg-pass') : $('#login-pass')).value;
        if (registering) {
          const name = $('#reg-name').value.trim();
          const { data, error } = await db.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name },
              emailRedirectTo: new URL('minha-conta.html', location.href).href,
            },
          });
          if (error) throw error;
          if (data.session) {
            location.href = 'minha-conta.html';
            return;
          }
          form.reset();
          message.textContent = 'Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre.';
        } else {
          const { error } = await db.auth.signInWithPassword({ email, password });
          if (error) throw error;
          location.href = 'minha-conta.html';
        }
      } catch (error) {
        message.textContent = error?.message || 'Não foi possível autenticar. Tente novamente.';
        message.classList.add('text-red-700');
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    }));

    const bar = $('[data-header-bar]');
    if (bar) window.addEventListener('scroll', () => bar.classList.toggle('shadow-md', scrollY > 8), { passive: true });

    const msgs = $$('.topbar-msg');
    if (msgs.length > 1) {
      let i = 0;
      setInterval(() => {
        const cur = msgs[i]; i = (i + 1) % msgs.length;
        cur.classList.replace('is-active', 'is-leaving');
        msgs[i].classList.remove('is-leaving'); msgs[i].classList.add('is-active');
        setTimeout(() => cur.classList.remove('is-leaving'), 600);
      }, 4500);
    }
  }

  /* ================= Página: Home ================= */
  function initHome() {
    const gloss = byId('gloss-lumis-star');
    const heroMedia = $('#gloss-hero-visual');
    if (heroMedia) heroMedia.innerHTML = gloss?.image ? productMedia(gloss, 0, true) : productArt(DECOR['gloss-lumis-star']);
    const heroLink = $('#gloss-hero-link');
    if (heroLink) heroLink.href = gloss ? productUrl(gloss) : 'catalogo.html?cat=gloss';
    const featured = gloss ? [gloss, ...bySold().filter(p => p.id !== gloss.id)] : bySold();
    $('#bestsellers').innerHTML = featured.slice(0, 8).map(p => slide(productCard(p))).join('');

    const form = $('#newsletter-form');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      form.classList.add('was-validated');
      if (!form.checkValidity()) return form.reportValidity();
      // Integre aqui com sua ferramenta de e-mail marketing (RD Station, Klaviyo, Mailchimp…).
      $('#newsletter-box').innerHTML = `<div class="fade-in text-center">
        <p class="font-serif text-3xl">Boas-vindas à Lumis Star!</p>
        <p class="mt-2 text-ink/75">Seu cupom de 10% OFF na primeira compra:</p>
        <button type="button" data-copy="BEMVINDO10" class="mt-5 inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-dashed border-leaf-dark bg-white font-semibold tracking-[.2em] text-lg hover:bg-leaf-light transition" aria-label="Copiar cupom BEMVINDO10">BEMVINDO10 ${icon('copy', 'w-5 h-5')}</button>
        <p class="hint mt-3">Toque para copiar · válido por 30 dias</p>
      </div>`;
    });
  }

  async function initAccount() {
    const root = $('#account-content');
    if (!root) return;
    if (!db) {
      root.innerHTML = '<p role="alert" class="text-sm text-red-700">A autenticação está indisponível no momento.</p>';
      return;
    }

    const { data, error } = await db.auth.getSession();
    if (error) {
      root.innerHTML = `<p role="alert" class="text-sm text-red-700">${esc(error.message)}</p>`;
      return;
    }
    const session = data.session;
    if (!session) {
      root.innerHTML = `<div class="max-w-xl">
        <p class="text-xs uppercase tracking-[.2em] text-leaf-dark">Área do cliente</p>
        <h1 class="mt-3 font-serif text-4xl sm:text-5xl">Minha conta</h1>
        <p class="mt-4 text-ink/70">Entre ou crie uma conta para acompanhar os pedidos feitos enquanto estiver autenticada.</p>
        <button type="button" data-open="#account-modal" class="btn btn-primary mt-7">Entrar ou criar conta</button>
      </div>`;
      return;
    }

    const email = esc(session.user.email);
    root.innerHTML = `<div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p class="text-xs uppercase tracking-[.2em] text-leaf-dark">Área do cliente</p>
        <h1 class="mt-2 font-serif text-4xl sm:text-5xl">Meus pedidos</h1>
        <p class="mt-2 text-sm text-ink/65">${email}</p></div>
      <button type="button" data-signout class="btn btn-outline btn-sm">Sair da conta</button>
    </div>
    <div id="customer-orders" class="mt-8" aria-live="polite"><p class="text-sm text-ink/60">Carregando seus pedidos…</p></div>`;

    const { data: orders, error: ordersError } = await db.from('pedidos')
      .select('id, created_at, status, valor_total, metodo_pagamento, itens_json')
      .eq('cliente_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    const list = $('#customer-orders');
    if (ordersError) {
      list.innerHTML = '<p role="alert" class="text-sm text-red-700">Não foi possível consultar seus pedidos. A estrutura do banco pode precisar ser atualizada.</p>';
      return;
    }
    if (!orders.length) {
      list.innerHTML = `<div class="border-y border-ink/10 py-10">
        <h2 class="font-serif text-2xl">Nenhum pedido vinculado à sua conta</h2>
        <p class="mt-2 text-sm text-ink/65">Pedidos feitos sem login não são associados automaticamente. Seus próximos pedidos feitos com esta conta aparecerão aqui.</p>
        <a href="catalogo.html" class="btn btn-primary btn-sm mt-5">Explorar produtos</a>
      </div>`;
      return;
    }

    const labels = { pendente: 'Pendente', pago: 'Pago', em_separacao: 'Em separação', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado' };
    const payments = { pix: 'Pix', cartao: 'Cartão', boleto: 'Boleto' };
    list.innerHTML = `<ul class="divide-y divide-ink/10">${orders.map(order => {
      const items = Array.isArray(order.itens_json) ? order.itens_json : [];
      const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      const itemSummary = items.map(item => `${Number(item.qtd) || 0}× ${esc(item.nome)}`).join(' · ');
      return `<li class="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div class="min-w-0"><div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 class="font-medium">Pedido #${esc(String(order.id).slice(0, 8).toUpperCase())}</h2>
          <span class="text-sm text-ink/60">${esc(labels[order.status] || order.status)}</span>
        </div><p class="mt-1 text-sm text-ink/60">${esc(date)} · ${esc(payments[order.metodo_pagamento] || order.metodo_pagamento)}</p>
        <p class="mt-2 break-words text-sm text-ink/75">${itemSummary}</p></div>
        <p class="font-medium tabular-nums sm:text-right">${brl(Number(order.valor_total) || 0)}</p>
      </li>`;
    }).join('')}</ul>`;
  }

  function initRoutine() {
    const root = $('#routine'); if (!root) return;
    const ROUTINES_DB = Object.fromEntries(Object.entries(ROUTINES).map(([k, r]) => [k, { ...r, steps: r.steps.filter(s => byId(s.product)) }]));
    if (Object.values(ROUTINES_DB).some(r => !r.steps.length)) { root.hidden = true; return; }
    let key = 'manha', idx = 0;
    const tabs = $$('[data-routine]', root);

    const render = (focusStep = false) => {
      const r = ROUTINES_DB[key];
      tabs.forEach(t => { const on = t.dataset.routine === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      $('#routine-steps').innerHTML = r.steps.map((s, i) => {
        const p = byId(s.product), on = i === idx;
        return `<li class="snap-start shrink-0 lg:shrink">
          <button type="button" data-step="${i}" ${on ? 'aria-current="step"' : ''} class="w-full flex items-center gap-4 text-left p-3 pr-5 rounded-2xl border transition ${on ? 'bg-white border-ink/10 shadow-sm' : 'border-transparent hover:bg-white/60'}">
            <span class="w-10 h-10 shrink-0 rounded-full grid place-items-center font-serif text-lg transition ${on ? 'bg-ink text-cream' : 'bg-white text-ink'}">${i + 1}</span>
            <span><span class="block font-medium">${esc(s.title)}</span><span class="block text-xs text-ink/60 whitespace-nowrap">${esc(p.name)}</span></span>
          </button></li>`;
      }).join('');

      const s = r.steps[idx], p = byId(s.product);
      $('#routine-detail').innerHTML = `<div class="fade-in grid sm:grid-cols-[minmax(0,200px)_1fr] gap-6 items-center">
        <a href="${productUrl(p)}" class="block aspect-square rounded-2xl overflow-hidden max-w-[240px] w-full mx-auto sm:max-w-none" tabindex="-1" aria-hidden="true">${productMedia(p)}</a>
        <div>
          <p class="flex items-center gap-2 text-xs uppercase tracking-[.2em] text-leaf-dark">Passo ${idx + 1} de ${r.steps.length} <span aria-hidden="true">·</span> ${icon('clock', 'w-3.5 h-3.5')} ${esc(s.time)}</p>
          <h3 class="font-serif text-3xl sm:text-4xl mt-2">${esc(s.title)}</h3>
          <p class="mt-3 text-ink/75 leading-relaxed">${esc(s.text)}</p>
          <p class="mt-4 text-sm"><a href="${productUrl(p)}" class="font-medium underline underline-offset-4 hover:text-blush-dark">${esc(p.name)}</a> <span class="text-ink/60">· ${brl(p.price)}</span></p>
          <div class="mt-5 flex flex-wrap gap-3">
            <button type="button" data-add="${p.id}" class="btn btn-primary btn-sm">${icon('bag', 'w-4 h-4')} Adicionar</button>
            ${idx < r.steps.length - 1 ? `<button type="button" data-step-next class="btn btn-outline btn-sm">Próximo passo ${icon('chevronR', 'w-4 h-4')}</button>` : ''}
          </div>
        </div>
      </div>`;

      const total = r.steps.reduce((sum, st) => sum + byId(st.product).price, 0);
      $('#routine-total').innerHTML = `<p class="text-sm text-ink/75">Rotina ${r.label.toLowerCase()} completa: <strong class="text-ink">${r.steps.length} produtos</strong> por <strong class="text-ink">${brl(total)}</strong></p>
        <button type="button" data-add-routine class="btn btn-leaf btn-sm">${icon('sparkle', 'w-4 h-4')} Adicionar rotina completa</button>`;

      if (focusStep) {
        const btn = $(`[data-step="${idx}"]`, root);
        btn?.focus({ preventScroll: true });
        btn?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    };

    root.addEventListener('click', e => {
      const t = e.target.closest('[data-routine],[data-step],[data-step-next],[data-add-routine]'); if (!t) return;
      if (t.dataset.routine) { key = t.dataset.routine; idx = 0; render(); }
      else if (t.dataset.step) { idx = +t.dataset.step; render(true); }
      else if (t.hasAttribute('data-step-next')) { idx = Math.min(idx + 1, ROUTINES_DB[key].steps.length - 1); render(true); }
      else {
        const added = ROUTINES_DB[key].steps.map(s => Cart.add(s.product)).some(Boolean);
        if (added) feedbackAdded(t, { name: `Rotina ${ROUTINES_DB[key].label}` });
      }
    });
    root.addEventListener('keydown', e => {
      if (!e.target.matches('[data-routine]') || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const i = tabs.indexOf(e.target), n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      key = n.dataset.routine; idx = 0; render(); n.focus();
    });
    render();
  }

  /* ================= Página: Catálogo com filtros ================= */
  function initCatalog() {
    const form = $('#filter-form'), grid = $('#product-grid'), aside = $('#filters');
    const PRICE = [
      { id: '0-70', label: 'Até R$ 70', min: 0, max: 70 },
      { id: '70-130', label: 'R$ 70 a R$ 130', min: 70, max: 130 },
      { id: '130-200', label: 'R$ 130 a R$ 200', min: 130, max: 200 },
      { id: '200+', label: 'Acima de R$ 200', min: 200, max: Infinity },
    ];
    const cat = params.get('cat'), linha = params.get('linha');
    const state = {
      cat: CATEGORIES[cat] ? cat : '',
      linha: LINES[linha] ? linha : '',
      q: (params.get('q') || '').slice(0, 60),
      skin: new Set(), benefit: new Set(), price: '', sort: 'relevance',
    };

    const opt = (type, name, value, label, checked) => `<label class="flex items-center gap-3 min-h-[44px] cursor-pointer text-[15px] hover:text-blush-dark">
        <input type="${type}" name="${name}" value="${value}" ${checked ? 'checked' : ''} class="w-5 h-5 accent-leaf-dark shrink-0"><span>${label}</span></label>`;
    const fs = (title, body) => `<fieldset class="py-4 border-b border-ink/10"><legend class="font-serif text-xl pt-4">${title}</legend><div class="mt-1">${body}</div></fieldset>`;
    const renderForm = () => {
      form.innerHTML =
        fs('Categoria', opt('radio', 'cat', '', 'Todas', !state.cat) + Object.entries(CATEGORIES).map(([k, c]) => opt('radio', 'cat', k, c.name, state.cat === k)).join('')) +
        fs('Tipo de pele', Object.entries(SKIN_TYPES).map(([k, l]) => opt('checkbox', 'skin', k, l, state.skin.has(k))).join('')) +
        fs('Benefício', Object.entries(BENEFITS).map(([k, l]) => opt('checkbox', 'benefit', k, l, state.benefit.has(k))).join('')) +
        fs('Faixa de preço', opt('radio', 'price', '', 'Todos os preços', !state.price) + PRICE.map(r => opt('radio', 'price', r.id, r.label, state.price === r.id)).join(''));
    };

    const apply = () => {
      const range = PRICE.find(r => r.id === state.price);
      const found = state.q ? new Set(searchProducts(state.q)) : null;
      const list = PRODUCTS.filter(p =>
        (!state.cat || p.category === state.cat) &&
        (!state.linha || p.line === state.linha) &&
        (!state.skin.size || p.skin.some(s => state.skin.has(s))) &&
        (!state.benefit.size || p.benefits.some(b => state.benefit.has(b))) &&
        (!range || (p.price >= range.min && p.price < range.max)) &&
        (!found || found.has(p)));
      const sorters = {
        relevance: (a, b) => b.sold - a.sold,
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        newest: (a, b) => b.createdAt - a.createdAt,
        discount: (a, b) => ((b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0)),
      };
      list.sort(sorters[state.sort]);

      grid.innerHTML = list.length
        ? list.map(p => `<div class="fade-in">${productCard(p)}</div>`).join('')
        : `<div class="col-span-full text-center py-20">
            <p class="font-serif text-3xl">Nenhum produto encontrado</p>
            <p class="mt-2 text-ink/70">Tente remover alguns filtros para ver mais opções.</p>
            <button type="button" data-clear-filters class="btn btn-outline mt-6">Limpar filtros</button>
          </div>`;

      const title = state.q ? `Resultados para “${state.q}”` : state.linha ? LINES[state.linha] : state.cat ? CATEGORIES[state.cat].name : 'Todos os produtos';
      $('#catalog-title').textContent = title;
      $('#crumb-current').textContent = title;
      $('#catalog-desc').textContent = state.cat && !state.q ? CATEGORIES[state.cat].desc : BRAND.slogan + '.';
      document.title = `${title} | ${BRAND.name}`;
      const label = `${list.length} ${list.length === 1 ? 'produto' : 'produtos'}`;
      $('#result-count').textContent = label;
      $('#filters-apply').textContent = `Ver ${label}`;

      const chips = [];
      if (state.q) chips.push(['q', '', `Busca: ${state.q}`]);
      if (state.cat) chips.push(['cat', '', CATEGORIES[state.cat].name]);
      if (state.linha) chips.push(['linha', '', LINES[state.linha]]);
      state.skin.forEach(s => chips.push(['skin', s, `Pele ${SKIN_TYPES[s].toLowerCase()}`]));
      state.benefit.forEach(b => chips.push(['benefit', b, BENEFITS[b]]));
      if (range) chips.push(['price', '', range.label]);
      $('#active-chips').innerHTML = chips.map(([k, v, l]) => `<button type="button" data-chip="${k}" data-chip-value="${esc(v)}" class="inline-flex items-center gap-1.5 min-h-[36px] pl-3.5 pr-2.5 rounded-full bg-white border border-ink/15 text-sm hover:border-ink transition" aria-label="Remover filtro ${esc(l)}">${esc(l)} ${icon('close', 'w-3.5 h-3.5')}</button>`).join('')
        + (chips.length > 1 ? '<button type="button" data-clear-filters class="min-h-[36px] px-2 text-sm underline underline-offset-4">Limpar tudo</button>' : '');
      const n = chips.length;
      $('#filter-count').textContent = n ? `(${n})` : '';
    };

    const read = () => {
      const fd = new FormData(form);
      state.cat = fd.get('cat') || '';
      state.price = fd.get('price') || '';
      state.skin = new Set(fd.getAll('skin'));
      state.benefit = new Set(fd.getAll('benefit'));
      apply();
    };
    const clearAll = () => {
      Object.assign(state, { cat: '', linha: '', q: '', skin: new Set(), benefit: new Set(), price: '' });
      renderForm(); apply();
    };

    form.addEventListener('change', read);
    $('#sort').addEventListener('change', e => { state.sort = e.target.value; apply(); });
    document.addEventListener('click', e => {
      const chip = e.target.closest('[data-chip]');
      if (chip) {
        const { chip: k, chipValue: v } = chip.dataset;
        if (k === 'skin' || k === 'benefit') state[k].delete(v); else state[k] = '';
        renderForm(); apply();
        $('#active-chips button')?.focus();
      }
      if (e.target.closest('[data-clear-filters]')) clearAll();
    });
    $('#filters-clear').addEventListener('click', clearAll);
    $('#filters-apply').addEventListener('click', () => closeLayer(aside));

    const mq = matchMedia('(min-width: 1024px)');
    const syncA11y = () => {
      if (mq.matches) {
        closeLayer(aside);
        aside.removeAttribute('role'); aside.removeAttribute('aria-modal');
        aside.setAttribute('aria-hidden', 'false');
      } else {
        aside.setAttribute('role', 'dialog'); aside.setAttribute('aria-modal', 'true');
        if (!aside.classList.contains('is-open')) aside.setAttribute('aria-hidden', 'true');
      }
    };
    mq.addEventListener('change', syncA11y);
    syncA11y();

    renderForm(); apply();
  }

  /* ================= Página: Produto (PDP) ================= */
  async function initProduct() {
    const root = $('#pdp');
    const slug = params.get('id') || PRODUCTS[0]?.id || '';
    const { data: row, error } = await db.from('produtos')
      .select('*, estoque(quantidade)')
      .eq('slug', slug).eq('ativo', true).maybeSingle();
    if (error) throw error;
    const p = row ? fromDb({ ...row, vendidos: byId(slug)?.sold ?? 0 }) : null;
    if (p) {
      const i = PRODUCTS.findIndex(x => x.id === p.id);
      if (i >= 0) PRODUCTS[i] = p; else PRODUCTS.push(p);
    }
    if (!p) {
      root.innerHTML = `<div class="py-24 text-center"><h1 class="font-serif text-4xl">Produto não encontrado</h1><p class="mt-3 text-ink/70">O item que você procura pode ter sido removido ou o link está incorreto.</p><a href="catalogo.html" class="btn btn-primary mt-8">Ver todos os produtos</a></div>`;
      $('#rec-section').hidden = true;
      return;
    }
    document.title = `${p.name} | ${BRAND.name}`;
    $('meta[name="description"]')?.setAttribute('content', `${p.name} — ${p.short}. ${BRAND.slogan}.`);

    let variant = variantOf(p), mediaIdx = 0;
    const cat = CATEGORIES[p.category];
    const soldOut = p.stock <= 0;
    const maxQty = Math.max(1, Math.min(10, p.stock));
    const media = p.image
      ? [{ type: 'img', view: 0, label: 'Foto do produto' }]
      : [
        { type: 'img', view: 0, label: 'Imagem principal' },
        { type: 'img', view: 1, label: 'Imagem ambientada' },
        { type: 'img', view: 2, label: 'Textura do produto' },
      ];
    if (p.video) media.push({ type: 'video', label: 'Vídeo de demonstração' });
    const vs = p.variants;
    const variantsHTML = !vs ? '' : `<fieldset class="mt-7">
      <legend class="text-sm mb-3"><span class="font-medium">${esc(vs.label)}:</span> <span id="variant-name" class="text-ink/70">${esc(variant.name)}</span></legend>
      <div class="flex flex-wrap gap-2.5">${vs.options.map((o, i) => `<label class="cursor-pointer" ${o.hex ? `title="${esc(o.name)}"` : ''}>
          <input type="radio" name="variant" value="${esc(o.name)}" class="peer sr-only" ${i === 0 ? 'checked' : ''}>
          ${o.hex
            ? `<span class="block w-11 h-11 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-cream transition peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-leaf-dark" style="background:${o.hex}"></span><span class="sr-only">${esc(o.name)}</span>`
            : `<span class="inline-flex items-center min-h-[44px] px-5 rounded-full border border-ink/20 bg-white text-sm transition hover:border-ink peer-checked:bg-ink peer-checked:text-cream peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-leaf-dark peer-focus-visible:ring-offset-2">${esc(o.name)}</span>`}
        </label>`).join('')}</div>
    </fieldset>`;

    const descLines = p.description.split('\n').map(l => l.trim()).filter(Boolean);
    const bullets = descLines.filter(l => /^[•\-*]/.test(l)).map(l => l.replace(/^[•\-*]\s*/, ''));
    const acc = [
      ['Descrição e benefícios', `${descLines.filter(l => !/^[•\-*]/.test(l)).map(l => `<p>${esc(l)}</p>`).join('')}
        ${bullets.length ? `<ul class="space-y-2">${bullets.map(h => `<li class="flex gap-2.5">${icon('check', 'w-5 h-5 text-leaf-dark mt-0.5')}<span>${esc(h)}</span></li>`).join('')}</ul>` : ''}
        ${p.skin.length ? `<p class="text-sm"><strong class="font-medium">Indicado para pele:</strong> ${p.skin.map(s => SKIN_TYPES[s].toLowerCase()).join(', ')}.</p>` : ''}`],
      ['Como usar', p.howTo.length ? `<ol class="space-y-3">${p.howTo.map((s, i) => `<li class="flex gap-3"><span class="w-7 h-7 shrink-0 rounded-full bg-blush-light text-blush-dark grid place-items-center text-sm font-semibold">${i + 1}</span><span class="pt-0.5">${esc(s)}</span></li>`).join('')}</ol>` : ''],
      ['Composição (INCI)', p.inci ? `<p class="text-sm leading-relaxed">${esc(p.inci)}</p>
        ${BRAND.freeFrom.length ? `<div class="flex flex-wrap gap-2">${BRAND.freeFrom.map(f => `<span class="px-3 py-1 rounded-full bg-leaf-light text-leaf-dark text-xs font-medium">Sem ${esc(f)}</span>`).join('')}</div>` : ''}` : ''],
      ['Dicas do especialista', p.tip ? `<blockquote class="border-l-2 border-blush pl-4 font-serif text-xl italic leading-snug text-ink">“${esc(p.tip)}”</blockquote>` : ''],
    ].filter(([, body]) => body.trim());

    root.innerHTML = `
      <nav aria-label="Trilha de navegação" class="text-sm text-ink/60 mb-6">
        <ol class="flex flex-wrap items-center gap-2">
          <li><a href="index.html" class="hover:text-ink">Início</a></li><li aria-hidden="true">/</li>
          <li><a href="catalogo.html?cat=${p.category}" class="hover:text-ink">${esc(cat.name)}</a></li><li aria-hidden="true">/</li>
          <li aria-current="page" class="text-ink truncate max-w-[55vw]">${esc(p.name)}</li>
        </ol>
      </nav>
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div class="lg:sticky lg:top-28 self-start">
          <div class="flex flex-col-reverse lg:flex-row gap-3">
            <div class="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Mídias do produto" ${media.length < 2 ? 'hidden' : ''}>
              ${media.map((m, i) => `<button type="button" role="tab" aria-selected="${i === 0}" aria-controls="gallery-main" aria-label="${m.label}" data-media="${i}" class="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-transparent aria-selected:border-ink hover:border-ink/40 transition">
                ${productMedia(p, m.type === 'img' ? m.view : 1)}${m.type === 'video' ? `<span class="absolute inset-0 grid place-items-center bg-ink/45 text-white">${icon('play', 'w-7 h-7')}</span>` : ''}</button>`).join('')}
            </div>
            <div id="gallery-main" role="tabpanel" aria-label="Galeria de imagens" class="relative flex-1 aspect-square rounded-3xl overflow-hidden bg-white select-none"></div>
          </div>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[.25em] text-leaf-dark">${esc(cat.name)}${LINES[p.line] ? ` · ${esc(LINES[p.line])}` : ''}</p>
          <h1 class="font-serif text-4xl sm:text-5xl leading-[1.08] mt-3">${esc(p.name)}</h1>
          ${p.short ? `<p class="mt-2 text-lg text-ink/70">${esc(p.short)}</p>` : ''}
          <div id="pdp-price" class="mt-6"></div>
          ${p.stock <= 0
            ? '<p class="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FBE9EB] px-4 py-2 text-sm font-medium text-[#9B2C3A]">Produto esgotado no momento</p>'
            : p.stock <= 5 ? `<p class="mt-4 text-sm font-medium text-blush-dark">Restam apenas ${p.stock} unidade${p.stock > 1 ? 's' : ''} em estoque</p>` : ''}
          ${variantsHTML}
          <div class="mt-7 flex gap-3">
            <div class="inline-flex items-center h-[52px] rounded-full border border-ink/20 bg-white shrink-0">
              <button type="button" id="qty-minus" class="w-11 h-full grid place-items-center rounded-full hover:bg-ink/5" aria-label="Diminuir quantidade">${icon('minus', 'w-4 h-4')}</button>
              <input id="qty" type="number" inputmode="numeric" min="1" max="${maxQty}" value="1" aria-label="Quantidade" class="w-8 text-center bg-transparent tabular-nums focus:outline-none">
              <button type="button" id="qty-plus" class="w-11 h-full grid place-items-center rounded-full hover:bg-ink/5" aria-label="Aumentar quantidade">${icon('plus', 'w-4 h-4')}</button>
            </div>
            <button type="button" id="add-btn" class="btn btn-primary flex-1 px-4" ${soldOut ? 'disabled' : ''}>${icon('bag')} ${soldOut ? 'Esgotado' : 'Adicionar ao carrinho'}</button>
          </div>
          <button type="button" id="buy-now" class="btn btn-rose w-full mt-3" ${soldOut ? 'disabled' : ''}>Comprar agora</button>

          <div id="pdp-free" class="mt-5 rounded-2xl bg-leaf-light/60 p-4"></div>

          <form id="cep-form" class="mt-4 rounded-2xl bg-white border border-ink/10 p-4" novalidate>
            <label for="cep" class="label flex items-center gap-2">${icon('truck', 'w-5 h-5 text-leaf-dark')} Calcular frete e prazo</label>
            <div class="flex gap-2">
              <input id="cep" data-mask="cep" class="input" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9">
              <button type="submit" class="btn btn-outline btn-sm shrink-0 min-h-[52px] px-5">Calcular</button>
            </div>
            <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" class="inline-block mt-2 text-xs text-ink/60 underline underline-offset-2">Não sei meu CEP</a>
            <div id="cep-result" class="mt-2" aria-live="polite"></div>
          </form>

          <div class="mt-8 border-t border-ink/15">
            ${acc.map(([title, body], i) => `<div class="border-b border-ink/15">
              <h2><button type="button" id="acc-btn-${i}" data-accordion aria-expanded="${i === 0}" aria-controls="acc-${i}" class="w-full flex items-center justify-between gap-4 py-5 text-left font-serif text-xl sm:text-2xl hover:text-blush-dark transition-colors">${title}<span class="acc-icon transition-transform duration-300">${icon('chevronD')}</span></button></h2>
              <div id="acc-${i}" role="region" aria-labelledby="acc-btn-${i}" class="acc-panel ${i === 0 ? 'is-open' : ''}"><div><div class="pb-6 space-y-4 text-ink/80 leading-relaxed">${body}</div></div></div>
            </div>`).join('')}
          </div>
        </div>
      </div>`;

    // Galeria: miniaturas, zoom (hover no desktop / toque no mobile) e swipe
    const main = $('#gallery-main');
    const canHover = matchMedia('(hover: hover)').matches;
    const showMedia = i => {
      mediaIdx = (i + media.length) % media.length;
      const m = media[mediaIdx];
      $$('[data-media]', root).forEach((b, j) => b.setAttribute('aria-selected', String(j === mediaIdx)));
      if (m.type === 'img') {
        main.classList.add(canHover ? 'cursor-zoom-in' : 'cursor-pointer');
        main.innerHTML = `<div class="zoom-inner w-full h-full fade-in">${productMedia(p, m.view)}</div>
          <span class="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs">${icon('search', 'w-3.5 h-3.5')} ${canHover ? 'Passe o mouse para ampliar' : 'Toque para ampliar'}</span>`;
      } else {
        main.classList.remove('cursor-zoom-in', 'cursor-pointer');
        main.innerHTML = `<video class="w-full h-full object-cover bg-ink" src="${esc(p.video)}" controls playsinline preload="metadata"></video>`;
      }
    };
    root.addEventListener('click', e => { const b = e.target.closest('[data-media]'); if (b) showMedia(+b.dataset.media); });
    const zoomAt = (e, on) => {
      const z = $('.zoom-inner', main); if (!z) return;
      const r = main.getBoundingClientRect();
      z.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      z.style.transform = on ? 'scale(2.2)' : '';
    };
    main.addEventListener('mousemove', e => canHover && zoomAt(e, true));
    main.addEventListener('mouseleave', e => canHover && zoomAt(e, false));
    main.addEventListener('click', e => { if (!canHover) zoomAt(e, !$('.zoom-inner', main)?.style.transform); });
    let x0 = null;
    main.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50 && !$('.zoom-inner', main)?.style.transform) showMedia(mediaIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    showMedia(0);

    // Preço, variação e quantidade
    const qtyInput = $('#qty');
    const qty = () => Math.min(maxQty, Math.max(1, parseInt(qtyInput.value, 10) || 1));
    const renderPrice = () => {
      const price = priceOf(p, variant), old = oldPriceOf(p, variant), inst = installments(price);
      const off = old ? Math.round((1 - price / old) * 100) : 0;
      $('#pdp-price').innerHTML = `<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          ${old ? `<s class="text-ink/50"><span class="sr-only">De </span>${brl(old)}</s>` : ''}
          <span class="text-3xl sm:text-4xl font-medium tracking-tight"><span class="sr-only">Por </span>${brl(price)}</span>
          ${off ? `<span class="px-2.5 py-1 rounded-full bg-blush-light text-blush-dark text-xs font-semibold">-${off}%</span>` : ''}
        </div>
        <p class="mt-1.5 text-sm text-ink/75">ou <strong class="font-medium">${inst.n}x de ${brl(inst.value)}</strong> sem juros no cartão</p>
        <p class="mt-1 text-sm text-leaf-dark flex items-center gap-1.5">${icon('pix', 'w-4 h-4')} <strong class="font-semibold">${brl(price * (1 - BRAND.pixDiscount))}</strong> no Pix (${BRAND.pixDiscount * 100}% OFF)</p>`;
      $('#sticky-price').textContent = brl(price);
    };
    root.addEventListener('change', e => {
      if (e.target.name !== 'variant') return;
      variant = variantOf(p, e.target.value);
      $('#variant-name').textContent = variant.name;
      renderPrice();
    });
    $('#qty-minus').addEventListener('click', () => { qtyInput.value = Math.max(1, qty() - 1); });
    $('#qty-plus').addEventListener('click', () => { qtyInput.value = Math.min(maxQty, qty() + 1); });
    qtyInput.addEventListener('change', () => { qtyInput.value = qty(); });

    const add = btn => { if (Cart.add(p.id, variant?.name, qty())) feedbackAdded(btn, p); };
    $('#add-btn').addEventListener('click', e => add(e.currentTarget));
    $('#buy-now').addEventListener('click', () => {
      const inCart = Cart.items.some(i => i.id === p.id);
      if (Cart.add(p.id, variant?.name, qty()) || inCart) location.href = 'checkout.html';
    });

    // Barra fixa de compra no mobile
    const sticky = $('#sticky-buy');
    $('#sticky-art').innerHTML = productMedia(p);
    $('#sticky-name').textContent = p.name;
    $('#sticky-add').disabled = soldOut;
    $('#sticky-add').addEventListener('click', e => add(e.currentTarget));
    sticky.inert = true;
    new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      sticky.classList.toggle('translate-y-full', !show);
      sticky.inert = !show;
      document.body.classList.toggle('has-sticky-buy', show);
    }).observe($('#add-btn'));

    // Frete
    const renderFree = () => { $('#pdp-free').innerHTML = freeShippingHTML(Cart.subtotal()); };
    document.addEventListener('cart:change', renderFree);
    const cepInput = $('#cep'), out = $('#cep-result');
    cepInput.value = applyMask(localStorage.getItem('bb_cep') || '', MASKS.cep());
    $('#cep-form').addEventListener('submit', async e => {
      e.preventDefault();
      const cep = digits(cepInput.value);
      if (cep.length !== 8) { out.innerHTML = '<p class="text-sm text-[#B4434F]">Digite um CEP válido com 8 dígitos.</p>'; cepInput.focus(); return; }
      out.innerHTML = '<p class="flex items-center gap-2 text-sm text-ink/60"><span class="spinner"></span> Calculando…</p>';
      const addr = await lookupCep(cep);
      if (addr === null) { out.innerHTML = '<p class="text-sm text-[#B4434F]">CEP não encontrado. Confira os números digitados.</p>'; return; }
      localStorage.setItem('bb_cep', cep);
      const opts = shippingOptions(cep, Cart.subtotal() + priceOf(p, variant) * qty());
      out.innerHTML = `${addr.localidade ? `<p class="text-sm text-ink/70 mb-1">Entrega para <strong class="text-ink">${esc(addr.localidade)}/${esc(addr.uf)}</strong></p>` : ''}
        <ul class="divide-y divide-ink/10 text-sm">${opts.map(o => `<li class="flex justify-between gap-3 py-2.5"><span><span class="font-medium">${o.name}</span> <span class="text-ink/60">· até ${o.days} dias úteis</span></span><strong class="${o.price ? 'font-medium' : 'text-leaf-dark'}">${o.price ? brl(o.price) : 'Grátis'}</strong></li>`).join('')}</ul>`;
    });

    renderPrice();
    renderFree();

    // Recomendações
    const seen = new Set([p.id]);
    const rec = [...PRODUCTS.filter(x => x.category === p.category), ...bySold()]
      .filter(x => x && !seen.has(x.id) && seen.add(x.id)).slice(0, 8);
    $('#rec-section').hidden = !rec.length;
    $('#recommendations').innerHTML = rec.map(r => slide(productCard(r))).join('');
  }

  /* ================= Página: Checkout (etapa única) ================= */
  function initCheckout() {
    const form = $('#checkout-form');
    const cepInput = $('#ck-cep'), cepMsg = $('#cep-msg');
    let shipOpts = [], shipId = null, lastCep = '', payment = 'pix';
    let coupon = null;
    const savedCoupon = sessionStorage.getItem('bb_coupon');
    if (savedCoupon && BRAND.coupons[savedCoupon]) coupon = { code: savedCoupon, percent: BRAND.coupons[savedCoupon] };

    const renderShip = () => {
      $('#ship-wrap').hidden = !shipOpts.length;
      if (shipOpts.length && !shipOpts.some(o => o.id === shipId)) shipId = shipOpts[0].id;
      $('#ship-options').innerHTML = shipOpts.map(o => `<label class="flex items-center gap-4 p-4 rounded-2xl border bg-white cursor-pointer transition has-[:checked]:border-ink has-[:checked]:ring-1 has-[:checked]:ring-ink border-ink/15">
          <input type="radio" name="shipping" value="${o.id}" ${o.id === shipId ? 'checked' : ''} required class="w-5 h-5 accent-leaf-dark">
          <span class="flex-1"><span class="block font-medium">${o.name}</span><span class="block text-sm text-ink/60">Até ${o.days} dias úteis</span></span>
          <strong class="${o.price ? 'font-medium' : 'text-leaf-dark'}">${o.price ? brl(o.price) : 'Grátis'}</strong>
        </label>`).join('');
    };

    const render = () => {
      const lines = Cart.lines(), sub = Cart.subtotal();
      const empty = !lines.length;
      $('#checkout-empty').hidden = !empty;
      form.hidden = empty;
      $('#summary-mobile-wrap').hidden = empty;
      if (empty) return;

      if (lastCep && shipOpts.length) { shipOpts = shippingOptions(lastCep, sub); renderShip(); }
      $$('[data-summary]').forEach(el => { el.innerHTML = `<ul>${lines.map(cartLineHTML).join('')}</ul>`; });
      $('#ck-progress').innerHTML = freeShippingHTML(sub);

      const cDisc = coupon ? sub * coupon.percent / 100 : 0;
      const base = sub - cDisc;
      const ship = shipOpts.find(o => o.id === shipId);
      const shipPrice = ship ? ship.price : 0;
      const pixDisc = payment === 'pix' ? base * BRAND.pixDiscount : 0;
      const total = base - pixDisc + shipPrice;
      const row = (k, v, cls = '') => `<div class="flex justify-between gap-4 ${cls}"><dt>${k}</dt><dd class="tabular-nums">${v}</dd></div>`;
      $('#totals').innerHTML =
        row('Subtotal', brl(sub)) +
        (cDisc ? row(`Cupom ${esc(coupon.code)} (-${coupon.percent}%)`, `− ${brl(cDisc)}`, 'text-leaf-dark') : '') +
        (pixDisc ? row('Desconto Pix (5%)', `− ${brl(pixDisc)}`, 'text-leaf-dark') : '') +
        row('Frete', ship ? (ship.price ? brl(ship.price) : '<span class="text-leaf-dark font-medium">Grátis</span>') : '<span class="text-ink/50">Informe o CEP</span>') +
        `<div class="flex justify-between items-baseline gap-4 pt-4 mt-2 border-t border-ink/10"><dt class="font-medium text-base">Total</dt><dd class="text-2xl font-medium tabular-nums">${brl(total)}</dd></div>`;
      $$('[data-total]').forEach(el => { el.textContent = brl(total); });

      const sel = $('#installments'), prev = sel.value;
      const { n: maxN } = installments(total);
      sel.innerHTML = Array.from({ length: maxN }, (_, i) => `<option value="${i + 1}">${i + 1}x de ${brl(total / (i + 1))} sem juros</option>`).join('');
      if (prev && +prev <= maxN) sel.value = prev;

      $('#coupon-msg').innerHTML = coupon ? `<span class="text-leaf-dark">Cupom <strong>${esc(coupon.code)}</strong> aplicado.</span> <button type="button" id="coupon-remove" class="underline underline-offset-2">Remover</button>` : '';
    };

    // CEP com preenchimento automático (ViaCEP)
    const handleCep = async () => {
      const cep = digits(cepInput.value);
      if (cep.length !== 8 || cep === lastCep) return;
      lastCep = cep;
      $('#cep-loading').hidden = false;
      cepMsg.textContent = '';
      const addr = await lookupCep(cep);
      $('#cep-loading').hidden = true;
      if (addr === null) {
        cepInput.setCustomValidity('CEP não encontrado.');
        cepMsg.innerHTML = '<span class="text-[#B4434F]">CEP não encontrado. Confira os números.</span>';
        shipOpts = []; shipId = null; renderShip(); render();
        return;
      }
      cepInput.setCustomValidity('');
      if (addr.offline) cepMsg.textContent = 'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.';
      else {
        $('#street').value = addr.logradouro || $('#street').value;
        $('#district').value = addr.bairro || $('#district').value;
        $('#city').value = addr.localidade || '';
        $('#uf').value = addr.uf || '';
        cepMsg.textContent = `${addr.localidade}/${addr.uf}`;
        $(addr.logradouro ? '#number' : '#street').focus();
      }
      localStorage.setItem('bb_cep', cep);
      shipOpts = shippingOptions(cep, Cart.subtotal());
      renderShip(); render();
    };
    cepInput.addEventListener('input', () => {
      cepInput.setCustomValidity('');
      if (digits(cepInput.value).length === 8) handleCep();
      else if (lastCep) { lastCep = ''; shipOpts = []; shipId = null; renderShip(); render(); }
    });

    form.addEventListener('change', e => {
      if (e.target.name === 'shipping') { shipId = e.target.value; render(); }
      if (e.target.name === 'payment') {
        payment = e.target.value;
        $$('[data-pay]').forEach(fs => { const on = fs.dataset.pay === payment; fs.hidden = !on; fs.disabled = !on; });
        render();
      }
    });

    // Cupom
    const applyCoupon = () => {
      const code = $('#coupon').value.trim().toUpperCase();
      if (!code) return;
      if (BRAND.coupons[code]) {
        coupon = { code, percent: BRAND.coupons[code] };
        sessionStorage.setItem('bb_coupon', code);
        $('#coupon').value = '';
        toast(`Cupom ${code} aplicado: ${coupon.percent}% OFF`);
        render();
      } else {
        $('#coupon-msg').innerHTML = '<span class="text-[#B4434F]">Cupom inválido ou expirado.</span>';
      }
    };
    $('#coupon-apply').addEventListener('click', applyCoupon);
    $('#coupon').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } });
    $('#coupon-msg').addEventListener('click', e => {
      if (e.target.id !== 'coupon-remove') return;
      coupon = null; sessionStorage.removeItem('bb_coupon'); render();
    });

    // Validações customizadas
    const checks = [
      ['#cpf', v => validCPF(v), 'Informe um CPF válido.'],
      ['#phone', v => digits(v).length >= 10, 'Informe um telefone com DDD.'],
      ['#card-number', v => luhn(v), 'Número de cartão inválido.'],
      ['#card-exp', v => validExp(v), 'Validade inválida (MM/AA).'],
      ['#card-cvc', v => /^\d{3,4}$/.test(v), 'CVV inválido.'],
    ];
    checks.forEach(([sel, fn, msg]) => $(sel).addEventListener('input', e => e.target.setCustomValidity(fn(e.target.value) ? '' : msg)));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      checks.forEach(([sel, fn, msg]) => { const el = $(sel); if (!el.disabled && !el.closest('fieldset:disabled')) el.setCustomValidity(fn(el.value) ? '' : msg); });
      if (digits(cepInput.value).length === 8 && !shipOpts.length && !cepInput.validationMessage) cepInput.setCustomValidity('Aguarde o cálculo do frete.');
      form.classList.add('was-validated');
      if (!form.checkValidity()) {
        form.reportValidity();
        form.querySelector('input:invalid, select:invalid')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      const btn = $('#place-order'), label = btn.innerHTML, errBox = $('#checkout-error');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Processando…';
      errBox.hidden = true;

      // Dados do cartão NÃO são enviados: em produção, use o SDK de tokenização do gateway (PCI-DSS).
      const payload = {
        cliente: { nome: $('#name').value.trim(), email: $('#email').value.trim(), cpf: digits($('#cpf').value), telefone: digits($('#phone').value) },
        endereco: {
          cep: digits(cepInput.value), rua: $('#street').value.trim(), numero: $('#number').value.trim(),
          complemento: $('#complement').value.trim(), bairro: $('#district').value.trim(),
          cidade: $('#city').value.trim(), uf: $('#uf').value.trim().toUpperCase(),
        },
        itens: Cart.lines().map(l => ({ slug: l.p.id, variante: l.variant, qtd: l.qty })),
        cupom: coupon?.code || null,
        frete: shipId,
        metodo_pagamento: { pix: 'pix', card: 'cartao', boleto: 'boleto' }[payment],
      };
      const parcelas = $('#installments').value;
      const { data, error } = await db.rpc('criar_pedido', { payload });
      btn.disabled = false;
      btn.innerHTML = label;

      if (error) {
        console.error(error);
        errBox.textContent = error.code === 'P0001' ? error.message : 'Não foi possível concluir o pedido. Tente novamente em instantes.';
        errBox.hidden = false;
        errBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (/estoque|indispon/i.test(error.message)) loadProducts().then(() => { Cart.prune(); renderCart(); }).catch(() => {});
        return;
      }

      const order = String(data.id).slice(0, 8).toUpperCase();
      const total = brl(+data.total);
      const msg = {
        pix: `O QR Code Pix de <strong>${total}</strong> será enviado para o seu e-mail e expira em 30 minutos.`,
        card: `O pagamento de <strong>${total}</strong> em ${esc(parcelas)}x no cartão está em processamento.`,
        boleto: `O boleto de <strong>${total}</strong> será enviado para o seu e-mail. Vencimento em 3 dias úteis.`,
      }[payment];
      $('#success-text').innerHTML = `Pedido <strong>#${order}</strong> recebido com sucesso! ${msg}`;
      Cart.clear();
      sessionStorage.removeItem('bb_coupon');
      form.reset();
      openLayer($('#success-modal'));
    });

    document.addEventListener('cart:change', render);
    const saved = localStorage.getItem('bb_cep');
    if (saved) { cepInput.value = applyMask(saved, MASKS.cep()); handleCep(); }
    render();
  }

  /* ================= Inicialização ================= */
  async function boot() {
    renderHeader();
    renderFooter();
    renderShell();
    hydrate();
    bindGlobal();
    renderCart();
    showSkeletons();
    try {
      if (PAGE !== 'about' && PAGE !== 'account') {
        await loadProducts();
        Cart.prune();
        renderCart();
      }
      await ({ home: initHome, catalog: initCatalog, product: initProduct, checkout: initCheckout, account: initAccount })[PAGE]?.();
    } catch (err) {
      console.error(err);
      showLoadError();
    }
    $$('[data-carousel]').forEach(initCarousel);
    hydrate();
  }
  boot();
})();
