/* Lumis Star — Painel administrativo (JavaScript puro + Supabase) */
(() => {
  'use strict';

  const db = window.sbClient;
  const { CATEGORIES, LINES, SKIN_TYPES, BENEFITS } = window.STORE;
  const BUCKET = 'produtos-midia';
  const MAX_IMAGE = 5 * 1024 * 1024;

  /* ================= Utilidades ================= */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
  const brl = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtDate = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  const shortId = id => String(id).slice(0, 8).toUpperCase();
  const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const slugify = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
  const digits = s => String(s ?? '').replace(/\D/g, '');
  const sum = (arr, f) => arr.reduce((s, x) => s + Number(f(x) || 0), 0);
  const splitList = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
  function safeUrl(u) {
    try { const url = new URL(u); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''; } catch { return ''; }
  }

  const ICONS = {
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    box: '<path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z"/><path d="m3 7 9 4 9-4M12 11v10"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6L20 8"/><path d="M20 3v5h-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    money: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
    ticket: '<path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3v4Z"/><path d="M13 4v12"/>',
    alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v.01"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  };
  const icon = (n, cls = 'w-5 h-5') => `<svg class="${cls} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[n] || ''}</svg>`;
  const hydrateIcons = (root = document) => $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon, 'w-full h-full'); el.removeAttribute('data-icon'); });

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    $('[data-msg]', t).textContent = msg;
    t.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-open'), 3000);
  }

  const STATUS = {
    pendente: { label: 'Pendente', cls: 'bg-amber-100 text-amber-800' },
    pago: { label: 'Pago', cls: 'bg-emerald-100 text-emerald-800' },
    em_separacao: { label: 'Em separação', cls: 'bg-violet-100 text-violet-800' },
    enviado: { label: 'Enviado', cls: 'bg-sky-100 text-sky-800' },
    entregue: { label: 'Entregue', cls: 'bg-leaf-light text-leaf-dark' },
    cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-800' },
  };
  const ORDER_TRANSITIONS = {
    pendente: ['pago', 'cancelado'],
    pago: ['em_separacao', 'cancelado'],
    em_separacao: ['enviado', 'cancelado'],
    enviado: ['entregue'],
    entregue: [],
    cancelado: ['pendente'],
  };
  const TX_STATUS = {
    pendente: { label: 'Pendente', cls: 'bg-amber-100 text-amber-800' },
    confirmada: { label: 'Confirmada', cls: 'bg-emerald-100 text-emerald-800' },
    cancelada: { label: 'Cancelada', cls: 'bg-red-100 text-red-800' },
  };
  const PAY = { pix: 'Pix', cartao: 'Cartão', boleto: 'Boleto' };
  const badge = (map, key) => `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${map[key]?.cls || 'bg-ink/10 text-ink'}"><span class="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true"></span>${esc(map[key]?.label || key)}</span>`;
  const emptyRow = (cols, msg) => `<tr><td colspan="${cols}" class="text-center text-ink/60 py-12">${msg}</td></tr>`;
  const loadingRow = cols => emptyRow(cols, '<span class="inline-flex items-center gap-2"><span class="spinner"></span> Carregando…</span>');
  const thumb = (url, alt) => {
    const src = safeUrl(url);
    return `<span class="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-cream grid place-items-center text-ink/30">${src ? `<img src="${esc(src)}" alt="${esc(alt)}" class="w-full h-full object-cover" loading="lazy">` : icon('image', 'w-5 h-5')}</span>`;
  };

  function handleError(err) {
    console.error(err);
    if (err?.status === 401 || err?.code === 'PGRST301') { db.auth.signOut(); return; }
    toast(err?.message ? `Erro: ${err.message}` : 'Ocorreu um erro. Tente novamente.');
  }

  /* ================= Autenticação ================= */
  // A proteção real é feita pelas políticas RLS (is_admin()); esta checagem só controla a interface.
  function showLogin(msg) {
    $('#boot').hidden = true;
    $('#app-view').hidden = true;
    $('#login-view').hidden = false;
    if (msg !== undefined) $('#login-msg').textContent = msg;
    $('#login-email').focus();
  }
  async function handleSession(session) {
    if (!session) return showLogin();
    const { data, error } = await db.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
    if (error || !data) {
      await db.auth.signOut();
      return showLogin('Este usuário não tem permissão de administrador.');
    }
    $('#boot').hidden = true;
    $('#login-view').hidden = true;
    $('#app-view').hidden = false;
    $('#user-email').textContent = session.user.email;
    route();
  }

  $('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget, btn = $('button[type="submit"]', form);
    form.classList.add('was-validated');
    if (!form.checkValidity()) return form.reportValidity();
    $('#login-msg').textContent = '';
    btn.disabled = true;
    const { data, error } = await db.auth.signInWithPassword({ email: $('#login-email').value.trim(), password: $('#login-pass').value });
    btn.disabled = false;
    $('#login-pass').value = '';
    if (error) { $('#login-msg').textContent = 'E-mail ou senha inválidos.'; return; }
    await handleSession(data.session);
  });

  document.addEventListener('click', async e => {
    if (e.target.closest('[data-logout]')) { await db.auth.signOut(); }
    if (e.target.closest('[data-refresh]')) route();
    if (e.target.closest('[data-dialog-close]')) e.target.closest('dialog')?.close();
  });

  /* ================= Roteamento ================= */
  const VIEWS = {
    dashboard: { title: 'Dashboard', load: loadDashboard },
    produtos: { title: 'Produtos', load: loadProdutos },
    pedidos: { title: 'Pedidos', load: loadPedidos },
    estoque: { title: 'Estoque', load: loadEstoque },
  };
  function route() {
    if ($('#app-view').hidden) return;
    const name = VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'dashboard';
    $$('[data-view]').forEach(s => { s.hidden = s.dataset.view !== name; });
    $$('[data-route]').forEach(a => (a.dataset.route === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    document.title = `${VIEWS[name].title} | Painel Lumis Star`;
    VIEWS[name].load().catch(handleError);
  }
  window.addEventListener('hashchange', route);

  /* ================= Dashboard & Financeiro ================= */
  async function loadDashboard() {
    $('#tx-tbody').innerHTML = loadingRow(5);
    const [tx, metrics, est] = await Promise.all([
      db.from('transacoes_financeiras').select('id, valor, status, created_at, pedido_id, pedidos(cliente_nome)').order('created_at', { ascending: false }).limit(10),
      db.rpc('dashboard_financeiro'),
      db.from('estoque').select('quantidade, alerta_minimo'),
    ]);
    for (const r of [tx, metrics, est]) if (r.error) throw r.error;

    const revenue = Number(metrics.data.receita_confirmada) || 0;
    const pending = Number(metrics.data.receita_pendente) || 0;
    const paidOrders = Number(metrics.data.pedidos_pagos) || 0;
    const totalOrders = Number(metrics.data.pedidos_total) || 0;
    const ticket = paidOrders ? revenue / paidOrders : 0;
    const alerts = est.data.filter(e => e.quantidade <= e.alerta_minimo).length;

    const kpi = (ic, title, value, sub, tone = 'bg-leaf-light text-leaf-dark', href = '') => `
      <${href ? `a href="${href}"` : 'div'} class="card p-4 sm:p-6 block ${href ? 'hover:shadow-lg hover:shadow-ink/5 transition' : ''}">
        <div class="flex items-start justify-between gap-2">
          <p class="text-xs sm:text-sm text-ink/60">${title}</p>
          <span class="w-9 h-9 rounded-full grid place-items-center ${tone}">${icon(ic, 'w-[18px] h-[18px]')}</span>
        </div>
        <p class="text-2xl sm:text-3xl font-medium tracking-tight mt-2 tabular-nums">${value}</p>
        <p class="text-xs text-ink/50 mt-1">${sub}</p>
      </${href ? 'a' : 'div'}>`;
    $('#kpis').innerHTML =
      kpi('money', 'Faturamento total', brl(revenue), `${brl(pending)} aguardando pagamento`) +
      kpi('receipt', 'Total de pedidos', totalOrders.toLocaleString('pt-BR'), `${paidOrders.toLocaleString('pt-BR')} pagos`, 'bg-blush-light text-blush-dark', '#pedidos') +
      kpi('ticket', 'Ticket médio', brl(ticket), 'sobre pedidos pagos', 'bg-[#ECE6EE] text-[#6B4E71]') +
      kpi('alert', 'Alerta de estoque', alerts, alerts === 1 ? 'produto no limite' : 'produtos no limite', alerts ? 'bg-red-100 text-red-700' : 'bg-leaf-light text-leaf-dark', '#estoque');

    $('#tx-tbody').innerHTML = tx.data.length
      ? tx.data.slice(0, 10).map(t => `<tr>
          <td class="whitespace-nowrap text-ink/70">${fmtDate(t.created_at)}</td>
          <td><button type="button" data-open-order="${esc(t.pedido_id)}" class="font-medium underline underline-offset-4 hover:text-blush-dark">#${shortId(t.pedido_id)}</button></td>
          <td class="max-w-[180px] truncate">${esc(t.pedidos?.cliente_nome || '—')}</td>
          <td class="tabular-nums font-medium">${brl(t.valor)}</td>
          <td>${badge(TX_STATUS, t.status)}</td>
        </tr>`).join('')
      : emptyRow(5, 'Nenhuma transação registrada ainda.');

    const counts = Object.fromEntries(Object.keys(STATUS).map(k => [k, Number(metrics.data.pedidos_status?.[k]) || 0]));
    const max = Math.max(1, ...Object.values(counts));
    $('#status-summary').innerHTML = Object.entries(counts).map(([k, n]) => `<li>
        <div class="flex items-center justify-between text-sm">${badge(STATUS, k)}<span class="tabular-nums font-medium">${n}</span></div>
        <div class="mt-1.5 h-1.5 rounded-full bg-ink/5 overflow-hidden"><div class="h-full rounded-full bg-ink/30" style="width:${(n / max) * 100}%"></div></div>
      </li>`).join('');
  }

  /* ================= Produtos (CRUD) ================= */
  let products = [];
  let editing = null;
  let slugTouched = false;
  const productForm = $('#product-form');
  const productDialog = $('#product-dialog');

  $('#prod-cat').insertAdjacentHTML('beforeend', Object.entries(CATEGORIES).map(([k, c]) => `<option value="${k}">${esc(c.name)}</option>`).join(''));
  $('#f-categoria').innerHTML = Object.entries(CATEGORIES).map(([k, c]) => `<option value="${k}">${esc(c.name)}</option>`).join('');
  $('#f-linha').insertAdjacentHTML('beforeend', Object.entries(LINES).map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join(''));
  const checkboxes = (name, dict) => Object.entries(dict).map(([k, l]) => `<label class="inline-flex items-center gap-2 min-h-[40px] text-sm cursor-pointer"><input type="checkbox" name="${name}" value="${k}" class="w-5 h-5 accent-leaf-dark">${esc(l)}</label>`).join('');
  $('#f-pele').innerHTML = checkboxes('tipo_pele', SKIN_TYPES);
  $('#f-beneficio').innerHTML = checkboxes('beneficio', BENEFITS);

  const stockOf = p => {
    const e = p.estoque;
    return Number(Array.isArray(e) ? e[0]?.quantidade : e?.quantidade) || 0;
  };

  async function loadProdutos() {
    $('#prod-tbody').innerHTML = loadingRow(6);
    const { data, error } = await db.from('produtos').select('*, estoque(quantidade)').order('created_at', { ascending: false });
    if (error) throw error;
    products = data;
    renderProdutos();
  }

  function renderProdutos() {
    const q = norm($('#prod-search').value.trim()), cat = $('#prod-cat').value;
    const list = products.filter(p => (!cat || p.categoria === cat) && (!q || norm(p.nome).includes(q) || p.slug.includes(q)));
    $('#prod-count').textContent = `${list.length} de ${products.length} produtos`;
    $('#prod-tbody').innerHTML = list.length ? list.map(p => {
      const stock = stockOf(p);
      return `<tr>
        <td><div class="flex items-center gap-3">${thumb(p.imagem_url, p.nome)}<div class="min-w-0"><p class="font-medium truncate max-w-[260px]">${esc(p.nome)}</p><p class="text-xs text-ink/50">/${esc(p.slug)}</p></div></div></td>
        <td>${esc(CATEGORIES[p.categoria]?.name || p.categoria)}</td>
        <td class="tabular-nums whitespace-nowrap">${p.preco_promocional != null
          ? `<s class="text-ink/45 text-xs">${brl(p.preco)}</s><br><span class="font-medium">${brl(p.preco_promocional)}</span>`
          : `<span class="font-medium">${brl(p.preco)}</span>`}</td>
        <td class="tabular-nums ${stock <= 0 ? 'text-red-700 font-medium' : ''}">${stock}</td>
        <td><label class="inline-flex items-center cursor-pointer min-h-[44px]" title="${p.ativo ? 'Ativo' : 'Inativo'}">
          <input type="checkbox" data-toggle-active="${esc(p.id)}" class="sr-only" ${p.ativo ? 'checked' : ''} aria-label="Ativar ${esc(p.nome)} na loja"><span class="switch" aria-hidden="true"></span></label></td>
        <td class="text-right whitespace-nowrap">
          <a href="../produto.html?id=${encodeURIComponent(p.slug)}" target="_blank" rel="noopener" class="icon-btn text-ink/60 hover:text-ink" aria-label="Ver ${esc(p.nome)} na loja">${icon('eye', 'w-[18px] h-[18px]')}</a>
          <button type="button" data-edit="${esc(p.id)}" class="icon-btn text-ink/60 hover:text-ink" aria-label="Editar ${esc(p.nome)}">${icon('edit', 'w-[18px] h-[18px]')}</button>
          <button type="button" data-delete="${esc(p.id)}" class="icon-btn text-ink/60 hover:text-red-700" aria-label="Excluir ${esc(p.nome)}">${icon('trash', 'w-[18px] h-[18px]')}</button>
        </td>
      </tr>`;
    }).join('') : emptyRow(6, products.length ? 'Nenhum produto encontrado com esses filtros.' : 'Nenhum produto cadastrado. Clique em “Novo produto”.');
  }
  $('#prod-search').addEventListener('input', renderProdutos);
  $('#prod-cat').addEventListener('change', renderProdutos);

  $('#prod-tbody').addEventListener('change', async e => {
    const id = e.target.dataset.toggleActive; if (!id) return;
    const ativo = e.target.checked;
    const { error } = await db.from('produtos').update({ ativo }).eq('id', id);
    if (error) { e.target.checked = !ativo; return handleError(error); }
    const p = products.find(x => x.id === id); if (p) p.ativo = ativo;
    toast(ativo ? 'Produto ativado na loja.' : 'Produto ocultado da loja.');
  });

  $('#prod-tbody').addEventListener('click', async e => {
    const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-delete]');
    if (edit) openProductForm(products.find(p => p.id === edit.dataset.edit));
    if (del) {
      const p = products.find(x => x.id === del.dataset.delete);
      if (!p || !confirm(`Excluir “${p.nome}” definitivamente?\n\nDica: para apenas ocultar da loja, use o botão “Ativo”.`)) return;
      const { error } = await db.from('produtos').delete().eq('id', p.id);
      if (error) return handleError(error);
      toast('Produto excluído.');
      loadProdutos().catch(handleError);
    }
  });

  const setPreview = url => {
    const src = safeUrl(url);
    $('#f-preview').innerHTML = src ? `<img src="${esc(src)}" alt="Pré-visualização" class="w-full h-full object-cover">` : icon('image', 'w-8 h-8');
  };

  function openProductForm(p = null) {
    editing = p;
    productForm.reset();
    productForm.classList.remove('was-validated');
    $('#pd-error').textContent = '';
    $('#pd-title').textContent = p ? 'Editar produto' : 'Novo produto';
    $('#f-estoque-wrap').hidden = !!p;
    slugTouched = !!p;
    const f = productForm.elements;
    if (p) {
      ['nome', 'slug', 'categoria', 'volume_tom', 'descricao', 'modo_uso', 'ingredientes', 'dicas', 'imagem_url', 'video_url']
        .forEach(k => { f[k].value = p[k] ?? ''; });
      f.linha.value = p.linha || '';
      f.preco.value = p.preco ?? '';
      f.preco_promocional.value = p.preco_promocional ?? '';
      f.ativo.checked = p.ativo;
      const pele = splitList(p.tipo_pele), ben = splitList(p.beneficio);
      $$('input[name="tipo_pele"]', productForm).forEach(c => { c.checked = pele.includes(c.value); });
      $$('input[name="beneficio"]', productForm).forEach(c => { c.checked = ben.includes(c.value); });
    }
    setPreview(p?.imagem_url);
    productDialog.showModal();
    f.nome.focus();
  }
  $('#new-product').addEventListener('click', () => openProductForm());

  productForm.elements.nome.addEventListener('input', e => { if (!slugTouched) productForm.elements.slug.value = slugify(e.target.value); });
  productForm.elements.slug.addEventListener('input', () => { slugTouched = true; });
  productForm.elements.imagem_url.addEventListener('input', e => { if (!$('#f-file').files.length) setPreview(e.target.value); });
  $('#f-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return setPreview(productForm.elements.imagem_url.value);
    $('#f-preview').innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Pré-visualização" class="w-full h-full object-cover">`;
  });

  async function uploadImage(file, slug) {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new Error('Formato não suportado. Use JPG, PNG, WebP ou AVIF.');
    if (file.size > MAX_IMAGE) throw new Error('A imagem deve ter no máximo 5 MB.');
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `produtos/${slug}-${Date.now()}.${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, file, { cacheControl: '31536000', contentType: file.type, upsert: false });
    if (error) throw error;
    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  productForm.addEventListener('submit', async e => {
    e.preventDefault();
    const f = productForm.elements, err = $('#pd-error'), btn = $('#pd-save');
    const num = v => (String(v).trim() === '' ? null : Number(String(v).replace(',', '.')));
    const text = v => (String(v).trim() || null);
    const row = {
      nome: f.nome.value.trim(),
      slug: f.slug.value.trim(),
      preco: num(f.preco.value),
      preco_promocional: num(f.preco_promocional.value),
      categoria: f.categoria.value,
      linha: f.linha.value || null,
      tipo_pele: $$('input[name="tipo_pele"]:checked', productForm).map(c => c.value).join(',') || null,
      beneficio: $$('input[name="beneficio"]:checked', productForm).map(c => c.value).join(',') || null,
      volume_tom: text(f.volume_tom.value),
      descricao: text(f.descricao.value),
      modo_uso: text(f.modo_uso.value),
      ingredientes: text(f.ingredientes.value),
      dicas: text(f.dicas.value),
      imagem_url: text(f.imagem_url.value),
      video_url: text(f.video_url.value),
      ativo: f.ativo.checked,
    };

    f.preco_promocional.setCustomValidity(row.preco_promocional != null && row.preco != null && row.preco_promocional >= row.preco ? 'O preço promocional deve ser menor que o preço.' : '');
    productForm.classList.add('was-validated');
    if (!productForm.checkValidity()) return productForm.reportValidity();

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Salvando…';
    err.textContent = '';
    try {
      const file = $('#f-file').files[0];
      if (file) row.imagem_url = await uploadImage(file, row.slug);

      if (editing) {
        const { error } = await db.from('produtos').update(row).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await db.from('produtos').insert(row).select('id').single();
        if (error) throw error;
        const qtd = Math.max(0, parseInt(f.estoque_inicial.value, 10) || 0);
        if (qtd) {
          const { error: e2 } = await db.from('estoque').update({ quantidade: qtd }).eq('produto_id', data.id);
          if (e2) throw e2;
        }
      }
      productDialog.close();
      toast(editing ? 'Produto atualizado.' : 'Produto criado com sucesso.');
      loadProdutos().catch(handleError);
    } catch (ex) {
      console.error(ex);
      err.textContent = ex?.code === '23505' ? 'Já existe um produto com este slug.' : (ex?.message || 'Não foi possível salvar.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar produto';
    }
  });

  /* ================= Pedidos ================= */
  let orders = [];
  let currentOrder = null;
  const orderDialog = $('#order-dialog');
  $('#ped-status').insertAdjacentHTML('beforeend', Object.entries(STATUS).map(([k, s]) => `<option value="${k}">${s.label}</option>`).join(''));
  $('#od-status').innerHTML = Object.entries(STATUS).map(([k, s]) => `<option value="${k}">${s.label}</option>`).join('');

  async function loadPedidos() {
    $('#ped-tbody').innerHTML = loadingRow(7);
    const { data, error } = await db.from('pedidos').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    orders = data;
    renderPedidos();
  }

  function renderPedidos() {
    const q = norm($('#ped-search').value.trim()), st = $('#ped-status').value;
    const list = orders.filter(o => (!st || o.status === st) &&
      (!q || norm(`${o.cliente_nome} ${o.cliente_email} ${o.id}`).includes(q)));
    $('#ped-count').textContent = `${list.length} de ${orders.length} pedidos`;
    $('#ped-tbody').innerHTML = list.length ? list.map(o => `<tr>
        <td class="font-medium">#${shortId(o.id)}</td>
        <td class="whitespace-nowrap text-ink/70">${fmtDate(o.created_at)}</td>
        <td><p class="font-medium truncate max-w-[200px]">${esc(o.cliente_nome)}</p><p class="text-xs text-ink/50 truncate max-w-[200px]">${esc(o.cliente_email)}</p></td>
        <td class="tabular-nums font-medium">${brl(o.valor_total)}</td>
        <td>${esc(PAY[o.metodo_pagamento] || o.metodo_pagamento)}</td>
        <td>${badge(STATUS, o.status)}</td>
        <td class="text-right"><button type="button" data-open-order="${esc(o.id)}" class="btn btn-outline btn-sm">Detalhes</button></td>
      </tr>`).join('') : emptyRow(7, orders.length ? 'Nenhum pedido com esses filtros.' : 'Nenhum pedido recebido ainda.');
  }
  $('#ped-search').addEventListener('input', renderPedidos);
  $('#ped-status').addEventListener('change', renderPedidos);

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-open-order]'); if (!b) return;
    let o = orders.find(x => x.id === b.dataset.openOrder);
    if (!o) {
      const { data, error } = await db.from('pedidos').select('*').eq('id', b.dataset.openOrder).maybeSingle();
      if (error || !data) return handleError(error || new Error('Pedido não encontrado.'));
      o = data;
    }
    openOrder(o);
  });

  const fmtCpf = c => (digits(c).length === 11 ? digits(c).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : esc(c || '—'));
  const fmtPhone = t => { const d = digits(t); return d.length >= 10 ? d.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : esc(t || '—'); };

  function openOrder(o) {
    currentOrder = o;
    const a = o.endereco_json || {}, items = Array.isArray(o.itens_json) ? o.itens_json : [];
    const phone = digits(o.cliente_telefone);
    const block = (title, html) => `<section class="card p-4 sm:p-5"><h3 class="text-xs uppercase tracking-[.2em] text-leaf-dark mb-3">${title}</h3>${html}</section>`;
    const row = (k, v, cls = '') => `<div class="flex justify-between gap-4 ${cls}"><dt class="text-ink/65">${k}</dt><dd class="tabular-nums text-right">${v}</dd></div>`;
    const itemsTotal = sum(items, i => i.subtotal);
    const discount = Math.max(0, Number(o.valor_subtotal) + Number(o.valor_frete) - Number(o.valor_total));

    $('#od-title').textContent = `Pedido #${shortId(o.id)}`;
    $('#od-body').innerHTML = `
      <div class="flex flex-wrap items-center gap-2 text-sm text-ink/70">${badge(STATUS, o.status)}<span>· ${fmtDate(o.created_at)}</span><span>· ${esc(PAY[o.metodo_pagamento] || o.metodo_pagamento)}</span></div>
      <div class="grid sm:grid-cols-2 gap-4">
        ${block('Cliente', `<p class="font-medium">${esc(o.cliente_nome)}</p>
          <p class="text-sm mt-1"><a href="mailto:${esc(o.cliente_email)}" class="underline underline-offset-4">${esc(o.cliente_email)}</a></p>
          <p class="text-sm mt-1 text-ink/70">CPF: ${fmtCpf(o.cliente_cpf)}</p>
          <p class="text-sm mt-1 text-ink/70">Tel.: ${phone ? `<a href="https://wa.me/55${phone}" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4">${fmtPhone(phone)}</a>` : '—'}</p>`)}
        ${block('Endereço de entrega', `<p class="text-sm leading-relaxed">${esc(a.rua)}, ${esc(a.numero)}${a.complemento ? ` — ${esc(a.complemento)}` : ''}<br>${esc(a.bairro)}<br>${esc(a.cidade)}/${esc(a.uf)}<br>CEP ${esc(String(a.cep || '').replace(/(\d{5})(\d{3})/, '$1-$2'))}</p>`)}
      </div>
      ${block('Itens', `<div class="overflow-x-auto -mx-1"><table class="tbl min-w-[460px]">
          <thead><tr><th>Produto</th><th>Qtd</th><th>Unitário</th><th class="text-right">Subtotal</th></tr></thead>
          <tbody>${items.map(i => `<tr><td><p class="font-medium">${esc(i.nome)}</p>${i.variante ? `<p class="text-xs text-ink/55">${esc(i.variante)}</p>` : ''}</td><td class="tabular-nums">${Number(i.qtd) || 0}</td><td class="tabular-nums">${brl(i.preco_unitario)}</td><td class="tabular-nums text-right">${brl(i.subtotal)}</td></tr>`).join('')}</tbody>
        </table></div>
        <dl class="mt-4 space-y-1.5 text-sm max-w-xs ml-auto">
          ${row('Subtotal', brl(o.valor_subtotal ?? itemsTotal))}
          ${discount > 0.009 ? row(`Descontos${o.cupom ? ` (${esc(o.cupom)})` : ''}`, `− ${brl(discount)}`, 'text-leaf-dark') : ''}
          ${row('Frete', Number(o.valor_frete) ? brl(o.valor_frete) : 'Grátis')}
          ${row('<strong class="text-ink">Total</strong>', `<strong>${brl(o.valor_total)}</strong>`, 'pt-2 border-t border-ink/10')}
        </dl>`)}`;
    const allowedStatuses = [o.status, ...(ORDER_TRANSITIONS[o.status] || [])];
    $('#od-status').innerHTML = allowedStatuses.map(status => `<option value="${status}">${STATUS[status].label}</option>`).join('');
    $('#od-status').value = o.status;
    $('#od-rastreio').value = o.codigo_rastreio || '';
    orderDialog.showModal();
  }

  $('#order-form').addEventListener('submit', async e => {
    e.preventDefault();
    const o = currentOrder; if (!o) return;
    const status = $('#od-status').value;
    const codigo = $('#od-rastreio').value.trim().toUpperCase() || null;
    if (status === 'cancelado' && o.status !== 'cancelado' && !confirm('Cancelar este pedido devolve os itens ao estoque e cancela a transação. Continuar?')) return;
    if (status === 'enviado' && !codigo && !confirm('Marcar como enviado sem código de rastreio?')) return;
    const btn = $('button[type="submit"]', e.currentTarget);
    btn.disabled = true;
    const { error } = await db.from('pedidos').update({ status, codigo_rastreio: codigo }).eq('id', o.id);
    btn.disabled = false;
    if (error) return handleError(error);
    orderDialog.close();
    toast('Pedido atualizado.');
    route();
  });

  /* ================= Estoque ================= */
  let stockRows = [];
  const saveTimers = {};

  async function loadEstoque() {
    $('#est-tbody').innerHTML = loadingRow(4);
    const { data, error } = await db.from('estoque')
      .select('id, quantidade, alerta_minimo, produtos(nome, slug, imagem_url, ativo)')
      .order('quantidade', { ascending: true });
    if (error) throw error;
    stockRows = data;
    renderEstoque();
  }

  const isAlert = r => r.quantidade <= r.alerta_minimo;
  const alertCountText = () => {
    const n = stockRows.filter(isAlert).length;
    return `${n} ${n === 1 ? 'item' : 'itens'} em alerta · ${stockRows.length} produtos`;
  };
  const stockBadge = r => (r.quantidade <= 0
    ? '<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">Esgotado</span>'
    : isAlert(r)
      ? '<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">Estoque baixo</span>'
      : '<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">OK</span>');

  function renderEstoque() {
    const q = norm($('#est-search').value.trim()), onlyAlerts = $('#est-alerts').checked;
    const list = stockRows.filter(r => (!onlyAlerts || isAlert(r)) && (!q || norm(r.produtos?.nome).includes(q)));
    $('#est-count').textContent = alertCountText();
    $('#est-tbody').innerHTML = list.length ? list.map(r => `<tr data-stock-row="${esc(r.id)}" class="${isAlert(r) ? 'bg-red-50/70' : ''}">
        <td><div class="flex items-center gap-3">${thumb(r.produtos?.imagem_url, r.produtos?.nome)}<div class="min-w-0">
          <p class="font-medium truncate max-w-[260px]">${esc(r.produtos?.nome || '—')}</p>
          ${r.produtos && !r.produtos.ativo ? '<p class="text-xs text-ink/50">Inativo na loja</p>' : ''}</div></div></td>
        <td><div class="inline-flex items-center rounded-full border border-ink/20 bg-white">
          <button type="button" data-step="-1" class="w-10 h-10 grid place-items-center rounded-full hover:bg-ink/5" aria-label="Diminuir">${icon('minus', 'w-4 h-4')}</button>
          <input type="number" min="0" step="1" value="${Number(r.quantidade)}" data-field="quantidade" aria-label="Quantidade de ${esc(r.produtos?.nome)}" class="w-16 text-center bg-transparent tabular-nums focus:outline-none">
          <button type="button" data-step="1" class="w-10 h-10 grid place-items-center rounded-full hover:bg-ink/5" aria-label="Aumentar">${icon('plus', 'w-4 h-4')}</button>
        </div></td>
        <td><input type="number" min="0" step="1" value="${Number(r.alerta_minimo)}" data-field="alerta_minimo" aria-label="Alerta mínimo de ${esc(r.produtos?.nome)}" class="input w-24 min-h-[44px] py-1.5 tabular-nums"></td>
        <td data-badge>${stockBadge(r)}</td>
      </tr>`).join('') : emptyRow(4, onlyAlerts ? 'Nenhum item em alerta. Tudo certo!' : 'Nenhum produto encontrado.');
  }
  $('#est-search').addEventListener('input', renderEstoque);
  $('#est-alerts').addEventListener('change', renderEstoque);

  function queueStockSave(tr) {
    const id = tr.dataset.stockRow;
    const r = stockRows.find(x => x.id === id); if (!r) return;
    const q = Math.max(0, parseInt($('[data-field="quantidade"]', tr).value, 10) || 0);
    const min = Math.max(0, parseInt($('[data-field="alerta_minimo"]', tr).value, 10) || 0);
    Object.assign(r, { quantidade: q, alerta_minimo: min });
    $('[data-badge]', tr).innerHTML = stockBadge(r);
    tr.classList.toggle('bg-red-50/70', isAlert(r));
    clearTimeout(saveTimers[id]);
    saveTimers[id] = setTimeout(async () => {
      const { error } = await db.from('estoque').update({ quantidade: q, alerta_minimo: min }).eq('id', id);
      if (error) return handleError(error);
      toast(`Estoque de “${r.produtos?.nome}” atualizado.`);
      $('#est-count').textContent = alertCountText();
    }, 500);
  }
  $('#est-tbody').addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    const tr = b.closest('tr'), input = $('[data-field="quantidade"]', tr);
    input.value = Math.max(0, (parseInt(input.value, 10) || 0) + Number(b.dataset.step));
    queueStockSave(tr);
  });
  $('#est-tbody').addEventListener('change', e => {
    if (!e.target.dataset.field) return;
    e.target.value = Math.max(0, parseInt(e.target.value, 10) || 0);
    queueStockSave(e.target.closest('tr'));
  });

  /* ================= Inicialização ================= */
  hydrateIcons();
  (async () => {
    if (!db) {
      showLogin('Configure SUPABASE_URL e SUPABASE_ANON_KEY em assets/js/supabase-config.js.');
      $('#login-form button[type="submit"]').disabled = true;
      return;
    }
    const { data: { session } } = await db.auth.getSession();
    await handleSession(session);
    db.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') showLogin(); });
  })().catch(err => { console.error(err); showLogin('Não foi possível conectar ao Supabase.'); });
})();
