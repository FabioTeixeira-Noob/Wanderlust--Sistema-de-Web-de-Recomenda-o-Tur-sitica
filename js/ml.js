/**
 * WANDERLUST — Motor de Recomendação ML (JavaScript Puro)
 * =========================================================
 * Algoritmos implementados:
 *   1. Content-Based Filtering  → cosine similarity (perfil ↔ destino)
 *   2. Collaborative Filtering  → user-item matrix com SVD (Power Iteration)
 *   3. Score Híbrido            → blend ponderado dos dois métodos
 *
 * Tudo corre no browser — sem servidor, sem dependências externas.
 * Os dados persistem via localStorage.
 *
 * Como usar: <script src="js/ml.js"></script>  após  script.js
 */

/* ═══════════════════════════════════════════════════════════
   MÓDULO ML — encapsulado para não poluir o namespace global
═══════════════════════════════════════════════════════════ */
const ML = (() => {

  /* ── Definição de features ─────────────────────────── */
  const ALL_CATEGORIES = ['natureza', 'aventura', 'praia', 'historico', 'cultural', 'montanha'];
  const ALL_CLIMATES   = ['tropical', 'tropical_humido', 'tropical_seco', 'frio_montanhoso', 'arido_costeiro', 'arido_desertico'];
  const BUDGET_RANGES  = {
    economico: [0,      100000],
    medio:     [100000, 250000],
    premium:   [250000, 999999],
  };

  /* ── Álgebra linear ────────────────────────────────── */
  const dot    = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const norm   = a => Math.sqrt(dot(a, a));
  const cosine = (a, b) => { const n = norm(a) * norm(b); return n ? dot(a, b) / n : 0; };
  const vadd   = (a, b) => a.map((v, i) => v + b[i]);
  const vscale = (a, s) => a.map(v => v * s);
  const vnorm  = a => { const n = norm(a) || 1; return a.map(v => v / n); };

  function minmax(arr, lo = 60, hi = 99) {
    const mn = Math.min(...arr), mx = Math.max(...arr), r = (mx - mn) || 1;
    return arr.map(v => lo + ((v - mn) / r) * (hi - lo));
  }
  function normalize01(arr) {
    const mn = Math.min(...arr), r = (Math.max(...arr) - mn) || 1;
    return arr.map(v => (v - mn) / r);
  }

  /* ─────────────────────────────────────────────────────
     SVD SIMPLIFICADO — Power Iteration
     Extrai o componente dominante de uma matriz M (nUsers × nDests).
     Suficiente para CF com dados reduzidos no browser.
  ───────────────────────────────────────────────────── */
  function powerIteration(M, iters = 30) {
    const nR = M.length, nC = M[0].length;
    let v = Array.from({ length: nC }, () => Math.random());
    for (let k = 0; k < iters; k++) {
      // u = M·v  →  normalizar
      let u = Array(nR).fill(0);
      for (let i = 0; i < nR; i++) for (let j = 0; j < nC; j++) u[i] += M[i][j] * v[j];
      u = vnorm(u);
      // v = Mᵀ·u  →  normalizar
      let vn = Array(nC).fill(0);
      for (let i = 0; i < nR; i++) for (let j = 0; j < nC; j++) vn[j] += M[i][j] * u[i];
      v = vnorm(vn);
    }
    return v; // componente principal dos destinos
  }

  /* ═══════════════════════════════════════════════════════
     1. MATRIZ DE FEATURES DOS DESTINOS
        15 features por destino:
        [6 categorias] + [6 climas] + [rating_norm, reviews_norm, price_norm]
  ═══════════════════════════════════════════════════════ */
  let _cache = null;
  function destMatrix() {
    if (_cache) return _cache;
    _cache = DESTINATIONS.map(d => {
      const cat  = ALL_CATEGORIES.map(c => d.category.includes(c) ? 1 : 0);
      const clim = ALL_CLIMATES.map(cl => d.climate === cl ? 1 : 0);
      return [
        ...cat, ...clim,
        (d.rating - 4.0),                          // rating normalizado
        Math.log(d.reviews + 1) / Math.log(3000),  // log-reviews normalizado
        d.priceNum / 500000,                        // preço normalizado
      ];
    });
    return _cache;
  }

  /* ═══════════════════════════════════════════════════════
     2. PERFIL DO UTILIZADOR
        Combina: questionário (40%) + interacções ponderadas (60%)
  ═══════════════════════════════════════════════════════ */
  function userProfile(prefs, ratings, favs) {
    const M = destMatrix();

    // Vector base → questionário
    const cat  = ALL_CATEGORIES.map(c => prefs.categories?.includes(c) ? 1 : 0);
    const clim = ALL_CLIMATES.map(cl => cl === (prefs.climate || 'tropical') ? 1 : 0);
    const [bLo, bHi] = BUDGET_RANGES[prefs.budget || 'medio'];
    let profile = [...cat, ...clim, 0.7, 0.5, ((bLo + bHi) / 2) / 500000];

    // Enriquecer com ratings e favoritos
    const pairs = [];
    Object.entries(ratings).forEach(([id, r]) => {
      const i = DESTINATIONS.findIndex(d => d.id === +id);
      if (i !== -1) pairs.push([M[i], (r - 1) / 4]);
    });
    favs.forEach(id => {
      const i = DESTINATIONS.findIndex(d => d.id === +id);
      if (i === -1) return;
      const ex = pairs.findIndex((_, k) => DESTINATIONS[k]?.id === +id);
      if (ex !== -1) pairs[ex][1] = Math.max(pairs[ex][1], 0.75);
      else pairs.push([M[i], 0.75]);
    });

    if (pairs.length) {
      const totalW = pairs.reduce((s, [, w]) => s + w, 0);
      const inter  = pairs.reduce((acc, [v, w]) => vadd(acc, vscale(v, w / totalW)), Array(profile.length).fill(0));
      profile = vadd(vscale(profile, 0.4), vscale(inter, 0.6));
    }

    return vnorm(profile);
  }

  /* ═══════════════════════════════════════════════════════
     3. CONTENT-BASED FILTERING
  ═══════════════════════════════════════════════════════ */
  function cbScores(profile) {
    return destMatrix().map(dv => cosine(profile, dv));
  }

  /* ═══════════════════════════════════════════════════════
     4. COLLABORATIVE FILTERING (SVD via Power Iteration)
  ═══════════════════════════════════════════════════════ */
  function cfScores(userId, interactions) {
    const nD = DESTINATIONS.length;

    if (!interactions || interactions.length < 3) {
      // Fallback: popularidade ponderada
      return normalize01(DESTINATIONS.map(d => Math.log(d.reviews + 1) * d.rating));
    }

    const users  = [...new Set(interactions.map(x => x.userId))];
    const uIdx   = Object.fromEntries(users.map((u, i) => [u, i]));
    const dIdx   = Object.fromEntries(DESTINATIONS.map((d, i) => [d.id, i]));
    const M      = Array.from({ length: users.length }, () => Array(nD).fill(0));

    interactions.forEach(({ userId: uid, destId, score }) => {
      const ui = uIdx[uid], di = dIdx[+destId];
      if (ui !== undefined && di !== undefined) M[ui][di] = score;
    });

    const dComp = powerIteration(M, 25);

    // Linha deste utilizador (ou média para utilizador novo)
    let uRow;
    if (uIdx[userId] !== undefined) {
      uRow = M[uIdx[userId]];
    } else {
      uRow = Array(nD).fill(0);
      M.forEach(row => row.forEach((v, j) => { uRow[j] += v / users.length; }));
    }

    // Predição = própria linha + componente colaborativo
    return normalize01(dComp.map((dc, j) => uRow[j] + dc * 0.3));
  }

  /* ═══════════════════════════════════════════════════════
     5. MOTOR HÍBRIDO PRINCIPAL
  ═══════════════════════════════════════════════════════ */
  function recommend({ userId, preferences, ratings = {}, favs = [], visited = [], topN = 8, cbW = 0.55, cfW = 0.45 }) {
    if (!preferences?.categories?.length) return [];

    const profile = userProfile(preferences, ratings, favs);
    const cb      = cbScores(profile);
    const cf      = cfScores(userId, loadInteractions());

    const raw = DESTINATIONS.map((d, i) => {
      let s = cbW * cb[i] + cfW * cf[i];
      s += 0.04 * ((d.rating - 4.4) / 0.4);      // popularidade (suave)
      if (visited.includes(d.id)) s *= 0.1;
      return s;
    });

    const pct = minmax(raw, 60, 99);

    return DESTINATIONS
      .map((d, i) => ({ ...d, match: Math.round(pct[i]), scoreCB: +cb[i].toFixed(3), scoreCF: +cf[i].toFixed(3) }))
      .sort((a, b) => raw[DESTINATIONS.indexOf(b)] - raw[DESTINATIONS.indexOf(a)])
      .slice(0, topN);
  }

  /* ═══════════════════════════════════════════════════════
     6. DESTINOS SIMILARES (item-based cosine)
  ═══════════════════════════════════════════════════════ */
  function getSimilar(destId, topN = 3) {
    const M   = destMatrix();
    const idx = DESTINATIONS.findIndex(d => d.id === destId);
    if (idx === -1) return [];
    return DESTINATIONS
      .map((d, i) => ({ ...d, sim: i === idx ? -1 : cosine(M[idx], M[i]) }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, topN)
      .map(d => ({ ...d, match: Math.round(d.sim * 100) }));
  }

  /* ═══════════════════════════════════════════════════════
     PERSISTÊNCIA
  ═══════════════════════════════════════════════════════ */
  const K = { r: 'wl_ratings', ix: 'wl_interactions', v: 'wl_visited' };

  function getRatings()      { return JSON.parse(localStorage.getItem(K.r)  || '{}'); }
  function loadInteractions(){ return JSON.parse(localStorage.getItem(K.ix) || '[]'); }
  function getVisited()      { return JSON.parse(localStorage.getItem(K.v)  || '[]'); }

  function saveRating(userId, destId, rating, isFav) {
    const r = getRatings(); r[String(destId)] = rating;
    localStorage.setItem(K.r, JSON.stringify(r));

    const score = Math.min(1, (rating - 1) / 4 + (isFav ? 0.15 : 0));
    const ix    = loadInteractions();
    const ei    = ix.findIndex(x => x.userId === userId && x.destId === +destId);
    const rec   = { userId, destId: +destId, score, at: Date.now() };
    if (ei !== -1) ix[ei] = rec; else ix.push(rec);
    localStorage.setItem(K.ix, JSON.stringify(ix));
    _cache = null; // invalidar cache
  }

  function saveFavInteraction(userId, destId, adding) {
    const ix = loadInteractions();
    const ei = ix.findIndex(x => x.userId === userId && x.destId === +destId);
    if (adding) {
      if (ei !== -1) ix[ei].score = Math.max(ix[ei].score, 0.75);
      else ix.push({ userId, destId: +destId, score: 0.75, at: Date.now() });
    } else if (ei !== -1) {
      ix[ei].score = Math.min(ix[ei].score, 0.35);
    }
    localStorage.setItem(K.ix, JSON.stringify(ix));
  }

  return { recommend, getSimilar, saveRating, saveFavInteraction, getRatings, getVisited, loadInteractions };

})();


/* ═══════════════════════════════════════════════════════════
   UI
═══════════════════════════════════════════════════════════ */

/* ── Estilos ─────────────────────────────────────────── */
(function () {
  const s = document.createElement('style');
  s.textContent = `
    .match-pill {
      display:inline-flex;align-items:center;gap:5px;
      background:var(--ink);color:var(--white);
      font-size:.67rem;font-weight:700;letter-spacing:.06em;
      padding:3px 10px 3px 8px;border-radius:20px;margin-bottom:5px;
    }
    .match-pill::before {
      content:'';width:6px;height:6px;border-radius:50%;
      background:#4ade80;flex-shrink:0;
    }
    .match-bar-wrap {
      height:3px;background:var(--gray-100,#eee);
      border-radius:2px;overflow:hidden;margin-bottom:8px;
    }
    .match-bar {
      height:100%;border-radius:2px;
      background:linear-gradient(90deg,#6ee7b7,#059669);
      transition:width .7s ease;
    }
    .rec-label {
      position:absolute;top:10px;left:10px;
      background:rgba(0,0,0,.7);color:#fff;
      font-size:.6rem;font-weight:700;letter-spacing:.1em;
      text-transform:uppercase;padding:3px 8px;
    }
    /* Estrelas */
    .star-rating { display:flex;align-items:center;gap:1px;margin:8px 0 4px; }
    .star-btn {
      background:none;border:none;padding:2px 1px;
      font-size:.95rem;line-height:1;cursor:pointer;
      color:#d1d5db;transition:color .12s,transform .1s;
    }
    .star-btn.lit   { color:#f59e0b; }
    .star-btn.hover { color:#fbbf24;transform:scale(1.2); }
    .star-label { font-size:.68rem;color:var(--gray-400);margin-left:5px;min-width:28px; }
    /* Badge IA */
    .ml-algo-badge {
      display:flex;align-items:center;gap:10px;
      padding:10px 16px;margin-bottom:20px;
      border-left:2px solid var(--ink);
      background:var(--gray-50,#f9f9f7);
    }
    .ml-algo-badge strong { display:block;font-size:.77rem;font-weight:700;color:var(--ink); }
    .ml-algo-badge small  { font-size:.7rem;color:var(--gray-400); }
    /* Similares no modal */
    .similar-section {
      margin-top:22px;padding-top:16px;
      border-top:1px solid var(--gray-100,#eee);
    }
    .similar-section h4 {
      font-size:.68rem;text-transform:uppercase;
      letter-spacing:.12em;color:var(--gray-400);margin-bottom:10px;
    }
    .similar-list { display:flex;flex-direction:column;gap:7px; }
    .similar-item {
      display:flex;align-items:center;gap:11px;padding:7px 9px;
      cursor:pointer;border:1px solid var(--gray-100,#eee);
      transition:background .15s;
    }
    .similar-item:hover { background:var(--gray-50,#f9f9f7); }
    .similar-item img   { width:52px;height:38px;object-fit:cover;flex-shrink:0; }
    .similar-item-info  { flex:1;min-width:0; }
    .similar-item-info strong { display:block;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .similar-item-info small  { font-size:.68rem;color:var(--gray-400); }
    .similar-pct { font-size:.7rem;font-weight:700;color:var(--ink);flex-shrink:0; }
  `;
  document.head.appendChild(s);
})();


/* ── Card ML com avaliação por estrelas ─────────────── */
function createMLCard(dest) {
  const isFav    = favorites.includes(dest.id);
  const myRating = ML.getRatings()[String(dest.id)] || 0;
  const card     = document.createElement('div');
  card.className = 'dest-card reveal';
  card.dataset.id = dest.id;

  card.innerHTML = `
    <div class="dest-card-img">
      <img src="${dest.image}" alt="${dest.name}" loading="lazy"
           onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=70'">
      <span class="dest-card-badge">${dest.badge}</span>
      <button class="dest-card-fav ${isFav ? 'active' : ''}" data-id="${dest.id}" aria-label="Favoritar">
        ${isFav ? '♥' : '♡'}
      </button>
      <span class="rec-label">IA</span>
    </div>
    <div class="dest-card-body">
      <div class="match-pill">${dest.match}% compatível</div>
      <div class="match-bar-wrap"><div class="match-bar" style="width:${dest.match}%"></div></div>
      <div class="dest-card-location">${dest.location}</div>
      <h3 class="dest-card-title">${dest.name}</h3>
      <p class="dest-card-desc">${dest.description}</p>

      <div class="star-rating">
        ${[1,2,3,4,5].map(n =>
          `<button class="star-btn ${n <= myRating ? 'lit' : ''}" data-val="${n}">★</button>`
        ).join('')}
        <span class="star-label">${myRating ? myRating + ' / 5' : 'Avaliar'}</span>
      </div>

      <div class="dest-card-footer">
        <div class="dest-card-price">${dest.price} <small>/ pessoa</small></div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="dest-card-rating">
            ${renderStars(dest.rating)}
            <span style="margin-left:4px;color:var(--gray-400)">${dest.rating}</span>
          </div>
          <button class="btn btn-sm btn-dark" data-modal="${dest.id}">Ver mais</button>
        </div>
      </div>
    </div>`;

  // Favoritar
  card.querySelector('.dest-card-fav').addEventListener('click', e => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) { showLoginGate(); return; }
    toggleFavorite(dest.id, e.currentTarget);
    ML.saveFavInteraction(user.email || user.name, dest.id, favorites.includes(dest.id));
  });

  // Modal + similares
  const openModal = () => {
    if (!getCurrentUser()) { showLoginGate(); return; }
    openDestModal(dest.id);
    appendSimilar(dest.id);
  };
  card.querySelector('[data-modal]').addEventListener('click', e => { e.stopPropagation(); openModal(); });
  card.addEventListener('click', openModal);

  // Estrelas
  const starBtns  = card.querySelectorAll('.star-btn');
  const starLabel = card.querySelector('.star-label');

  starBtns.forEach(btn => {
    const val = +btn.dataset.val;
    btn.addEventListener('mouseenter', () => starBtns.forEach(b => b.classList.toggle('hover', +b.dataset.val <= val)));
    btn.addEventListener('mouseleave', () => starBtns.forEach(b => b.classList.remove('hover')));
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const user = getCurrentUser();
      if (!user) { showLoginGate(); return; }
      starBtns.forEach(b => b.classList.toggle('lit', +b.dataset.val <= val));
      starLabel.textContent = val + ' / 5';
      ML.saveRating(user.email || user.name, dest.id, val, favorites.includes(dest.id));
      showToast(`"${dest.name}" avaliado com ${val} estrela${val > 1 ? 's' : ''}.`, 'success');
      setTimeout(renderMLRecommendations, 700);
    });
  });

  return card;
}

/* ── Destinos similares dentro do modal ─────────────── */
function appendSimilar(destId) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const modal = document.getElementById('dest-modal');
    if (!modal) return;
    modal.querySelector('.similar-section')?.remove();

    const similar = ML.getSimilar(destId, 3);
    if (!similar.length) return;

    const section = document.createElement('div');
    section.className = 'similar-section';
    section.innerHTML = `
      <h4>Destinos similares</h4>
      <div class="similar-list">
        ${similar.map(s => `
          <div class="similar-item" data-sid="${s.id}">
            <img src="${s.image}" alt="${s.name}" onerror="this.style.display='none'">
            <div class="similar-item-info">
              <strong>${s.name}</strong>
              <small>${s.location}</small>
            </div>
            <span class="similar-pct">${s.match}%</span>
          </div>`).join('')}
      </div>`;

    section.querySelectorAll('.similar-item').forEach(el => {
      el.addEventListener('click', () => {
        const sid = +el.dataset.sid;
        closeDestModal();
        setTimeout(() => { openDestModal(sid); appendSimilar(sid); }, 200);
      });
    });

    modal.querySelector('.modal-body')?.appendChild(section);
  }));
}

/* ── Renderizar grid de recomendações ML ─────────────── */
function renderMLRecommendations() {
  const grid  = document.getElementById('recommended-grid');
  if (!grid) return;

  const user  = getCurrentUser();
  const prefs = JSON.parse(localStorage.getItem('wl_preferences') || '{}');

  // Remover badge anterior
  document.querySelector('.ml-algo-badge')?.remove();
  grid.innerHTML = '';

  if (!user || !prefs.categories?.length) {
    // Fallback: lógica original sem ML
    const dests = DESTINATIONS.slice(0, 4);
    dests.forEach(d => grid.appendChild(createDestCard(d, true)));
    observeReveal();
    return;
  }

  const recs = ML.recommend({
    userId: user.email || user.name,
    preferences: prefs,
    ratings: ML.getRatings(),
    favs: favorites,
    visited: ML.getVisited(),
    topN: 8,
  });

  // Inserir badge antes do grid
  const badge = document.createElement('div');
  badge.className = 'ml-algo-badge';
  badge.innerHTML = `
    <span style="font-size:1rem">✦</span>
    <div>
      <strong>Recomendações geradas por IA</strong>
      <small>Baseadas no teu perfil · Melhoram com cada avaliação que deres</small>
    </div>`;
  grid.parentElement.insertBefore(badge, grid);

  if (!recs.length) {
    grid.innerHTML = `<p style="color:var(--gray-400);font-size:.85rem;grid-column:1/-1">
      Sem recomendações ainda. <a href="preferences.html">Preenche as tuas preferências.</a></p>`;
    return;
  }

  recs.forEach(d => grid.appendChild(createMLCard(d)));

  // Actualizar stat de compatibilidade
  const statEl = document.querySelectorAll('.stat-card strong')[3];
  if (statEl) statEl.textContent = recs[0].match + '%';

  observeReveal();
}

/* ═══════════════════════════════════════════════════════════
   INICIALIZAÇÃO — interceptar initDashboard do script.js
═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'dashboard') return;

  const _orig = window.initDashboard;
  window.initDashboard = function () {
    if (_orig) _orig.call(this);   // corre popular, favoritos, stats originais
    // Substituir grid de recomendados pela versão ML
    const grid = document.getElementById('recommended-grid');
    if (grid) grid.innerHTML = '';
    document.querySelector('.ml-algo-badge')?.remove();
    renderMLRecommendations();
  };
});
