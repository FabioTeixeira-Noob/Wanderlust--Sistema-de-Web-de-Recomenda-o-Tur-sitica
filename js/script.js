/**
 * WANDERLUST — script.js
 * Dados em Kwanzas (AOA), sem excessos de emoji
 * Navegação, cards, favoritos, modais, formulários, animações
 */

/* ══════════════════════════════
   DADOS DE DESTINOS
   Preços em Kwanzas (AOA)
══════════════════════════════ */
/* ══════════════════════════════
   DADOS DE DESTINOS — Foco em Angola
   Preços aproximados em Kwanzas (AOA) para 2025/2026 — 2 a 7 dias
   Baseado em TripAdvisor, CNN Travel, guias locais
══════════════════════════════ */
const DESTINATIONS = [
  {
    id: 1,
    name: "Quedas de Kalandula",
    location: "Malanje · Angola",
    description: "Uma das maiores quedas de água de África (105 m de altura), com névoa constante e arco-íris. Experiência épica de natureza bruta.",
    price: "180.000 – 320.000 Kz",
    priceNum: 250000, // valor médio para ordenação/filtro futuro
    rating: 4.8,
    reviews: 1200,
    climate: "Tropical / Úmido",
    category: ["natureza", "aventura"],
    image: "https://tse3.mm.bing.net/th/id/OIP.fyf_lM0sdmEPygs6V0idkQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3", // cachoeira poderosa (ajusta se quiseres procura específica)
    badge: "Maravilha Natural",
    match: 96
  },
  {
    id: 2,
    name: "Ilha do Mussulo",
    location: "Luanda · Angola",
    description: "Praia paradisíaca com areia branca, águas cristalinas e resorts tranquilos. Perfeito para relaxar perto da capital.",
    price: "80.000 – 250.000 Kz",
    priceNum: 150000,
    rating: 4.7,
    reviews: 2800,
    climate: "Tropical",
    category: ["praia", "natureza"],
    image: "https://welcometoangola.co.ao/wp-content/uploads/2021/06/Ilha-de-Luanda....jpg", // praia tropical genérica mas encaixa bem
    badge: "Paraíso Próximo",
    match: 94
  },
  {
    id: 3,
    name: "Miradouro da Lua",
    location: "Luanda · Angola",
    description: "Formações rochosas esculpidas pela erosão com visual lunar dramático. Melhor ao pôr do sol com vista para o Atlântico.",
    price: "40.000 – 90.000 Kz",
    priceNum: 65000,
    rating: 4.6,
    reviews: 1800,
    climate: "Árido / Costeiro",
    category: ["natureza", "aventura"],
    image: "https://tse1.mm.bing.net/th/id/OIP.oPzoJQn7LfnnXMiSGZqjNgHaD3?rs=1&pid=ImgDetMain&o=7&rm=3", // paisagem lunar/erosão
    badge: "Único em África",
    match: 92
  },
  {
    id: 4,
    name: "Fenda da Tundavala",
    location: "Huíla · Angola",
    description: "Falésia impressionante a 1200 m de altura com vista panorâmica do planalto. Uma das 7 Maravilhas Naturais de Angola.",
    price: "150.000 – 380.000 Kz",
    priceNum: 260000,
    rating: 4.8,
    reviews: 950,
    climate: "Frio / Montanhoso",
    category: ["natureza", "aventura", "montanha"],
    image: "https://farm3.static.flickr.com/2880/13717657563_b549ff52d1_b.jpg", // canyon / falésia
    badge: "Miradouro Épico",
    match: 90
  },
  {
    id: 5,
    name: "Parque Nacional da Kissama",
    location: "Bengo · Angola",
    description: "Safari acessível com elefantes, girafas, búfalos e aves. O parque mais próximo de Luanda com vida selvagem rica.",
    price: "120.000 – 280.000 Kz",
    priceNum: 200000,
    rating: 4.6,
    reviews: 1100,
    climate: "Tropical / Seco",
    category: ["natureza", "aventura"],
    image: "https://tse3.mm.bing.net/th/id/OIP.CjzimibxMIQMCI8Um_brJgHaEt?rs=1&pid=ImgDetMain&o=7&rm=3", // elefantes / savana
    badge: "Safari Angolano",
    match: 89
  },
  {
    id: 6,
    name: "Cabo Ledo",
    location: "Kwanza Sul · Angola",
    description: "Praias virgens, falésias vermelhas e um dos melhores spots de surf de África. Ideal para aventura costeira.",
    price: "100.000 – 220.000 Kz",
    priceNum: 160000,
    rating: 4.7,
    reviews: 820,
    climate: "Tropical",
    category: ["praia", "aventura"],
    image: "https://tse2.mm.bing.net/th/id/OIP.HXvFon4azcyeMZ0BrKqEYwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3", // praia com falésia
    badge: "Surf & Relax",
    match: 87
  },
  {
    id: 7,
    name: "Serra da Leba",
    location: "Huíla · Angola",
    description: "Estrada sinuosa icónica com vistas montanhosas deslumbrantes. Uma das paisagens rodoviárias mais bonitas de África.",
    price: "140.000 – 350.000 Kz",
    priceNum: 245000,
    rating: 4.8,
    reviews: 760,
    climate: "Frio / Montanhoso",
    category: ["natureza", "aventura", "montanha"],
    image: "https://tse1.mm.bing.net/th/id/OIP.lyROZImB4YPUT0mV0sSl5QHaEi?rs=1&pid=ImgDetMain&o=7&rm=3", // estrada montanhosa
    badge: "Estrada Panorâmica",
    match: 85
  },
  {
    id: 8,
    name: "Pedras Negras de Pungo Andongo",
    location: "Malanje · Angola",
    description: "Formações rochosas gigantes com lendas locais e vistas incríveis. Local místico e fotogénico.",
    price: "160.000 – 300.000 Kz",
    priceNum: 230000,
    rating: 4.7,
    reviews: 680,
    climate: "Tropical",
    category: ["natureza", "histórico"],
    image: "https://medicareclub.ao/image/cache/catalog/guia/malange/pungo%20adongo/img_1413-e1444063786601-1240x827.jpg", // rochas / formação natural
    badge: "Místico",
    match: 83
  },
  {
    id: 9,
    name: "Parque Nacional do Iona",
    location: "Namibe · Angola",
    description: "Deserto costeiro com dunas, flamingos, zebras e paisagens únicas no extremo sul.",
    price: "220.000 – 450.000 Kz",
    priceNum: 335000,
    rating: 4.6,
    reviews: 540,
    climate: "Árido / Desértico",
    category: ["natureza", "aventura"],
    image: "https://medicareclub.ao/image/cache/catalog/guia/namibe/iona%204%20foto%20pedro%20carreno-1240x827.jpg", // deserto / dunas
    badge: "Deserto Selvagem",
    match: 81
  },
  {
    id: 10,
    name: "Fortaleza de São Miguel",
    location: "Luanda · Angola",
    description: "Fortaleza colonial do séc. XVI com vistas panorâmicas da baía e museu histórico.",
    price: "30.000 – 80.000 Kz",
    priceNum: 55000,
    rating: 4.5,
    reviews: 1500,
    climate: "Tropical",
    category: ["histórico", "cultural"],
    image: "https://th.bing.com/th/id/R.c9ebb7d5ebf5491c124c8db030a11d03?rik=9a8R8XWXK62AmA&pid=ImgRaw&r=0", // fortaleza / castelo antigo
    badge: "Património",
    match: 88
  },
  {
    id: 11,
    name: "Baía Azul",
    location: "Benguela · Angola",
    description: "Praia de areia dourada e águas calmas no sul — uma das mais bonitas do país.",
    price: "110.000 – 260.000 Kz",
    priceNum: 185000,
    rating: 4.7,
    reviews: 920,
    climate: "Tropical",
    category: ["praia"],
    image: "https://www.almadeviajante.com/wp-content/uploads/baia-azul-benguela-958x640.jpg",
    badge: "Praia Secreta",
    match: 86
  },
  {
    id: 12,
    name: "Cristo Rei do Lubango",
    location: "Huíla · Angola",
    description: "Estátua imponente com vista 360° sobre a cidade e planalto. Ponto alto cultural e panorâmico.",
    price: "90.000 – 200.000 Kz",
    priceNum: 145000,
    rating: 4.6,
    reviews: 1100,
    climate: "Frio / Montanhoso",
    category: ["cultural", "histórico"],
    image: "https://i.pinimg.com/originals/f7/3e/4b/f73e4b369d48b38d699637d1672e8802.jpg", // estátua / miradouro
    badge: "Miradouro Urbano",
    match: 82
  }
];


let favorites = JSON.parse(localStorage.getItem('wl_favorites') || '[]');
let currentFilter = 'todos';
let activeModalId = null;


/* ══════════════════════════════
   NAVBAR
══════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('mobile-open');
    });
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  updateNavAuth();
}

function updateNavAuth() {
  const user        = getCurrentUser();
  const navLogin    = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const navDash     = document.getElementById('nav-dashboard');
  const navLogout   = document.getElementById('nav-logout');

  if (user) {
    if (navLogin)    navLogin.style.display    = 'none';
    if (navRegister) navRegister.style.display = 'none';
    if (navDash)     navDash.style.display     = 'inline-flex';
    if (navLogout)   navLogout.style.display   = 'inline-flex';
  } else {
    if (navDash)   navDash.style.display   = 'none';
    if (navLogout) navLogout.style.display = 'none';
  }
}

/* ══════════════════════════════
   AUTH
══════════════════════════════ */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('wl_user') || 'null');
}
function setUser(user) {
  localStorage.setItem('wl_user', JSON.stringify(user));
}
function logout() {
  localStorage.removeItem('wl_user');
  showToast('Sessão encerrada com sucesso.', 'success');
  setTimeout(() => window.location.href = 'index.html', 1100);
}

/* ══════════════════════════════
   CARDS DE DESTINO
══════════════════════════════ */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full)            html += `<span class="star-fill">★</span>`;
    else if (i === full && half) html += `<span class="star-fill" style="opacity:.5">★</span>`;
    else                     html += `<span style="color:var(--gray-200)">★</span>`;
  }
  return html;
}

function createDestCard(dest, showMatch = false) {
  const isFav = favorites.includes(dest.id);
  const card  = document.createElement('div');
  card.className = 'dest-card reveal';
  card.dataset.id = dest.id;
  card.dataset.categories = dest.category.join(',');

  card.innerHTML = `
    <div class="dest-card-img">
      <img src="${dest.image}" alt="${dest.name}" loading="lazy">
      <span class="dest-card-badge">${dest.badge}</span>
      <button class="dest-card-fav ${isFav ? 'active' : ''}" data-id="${dest.id}" title="Guardar nos favoritos" aria-label="Favoritar">
        ${isFav ? '♥' : '♡'}
      </button>
      ${showMatch ? `<span class="rec-label">Recomendado</span>` : ''}
    </div>
    <div class="dest-card-body">
      ${showMatch ? `<div class="match-pill">${dest.match}% compatível</div>` : ''}
      <div class="dest-card-location">${dest.location}</div>
      <h3 class="dest-card-title">${dest.name}</h3>
      <p class="dest-card-desc">${dest.description}</p>
      <div class="dest-card-footer">
        <div>
          <div class="dest-card-price">${dest.price} <small>/ pessoa</small></div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="dest-card-rating">
            ${renderStars(dest.rating)}
            <span style="margin-left:4px;color:var(--gray-400)">${dest.rating}</span>
          </div>
          <button class="btn btn-sm btn-dark" data-modal="${dest.id}">Ver mais</button>
        </div>
      </div>
    </div>
  `;

  card.querySelector('.dest-card-fav').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(dest.id, e.currentTarget);
  });
  card.querySelector('[data-modal]').addEventListener('click', e => {
    e.stopPropagation();
    handleCardClick(dest.id);
  });
  card.addEventListener('click', () => handleCardClick(dest.id));

  return card;
}

function handleCardClick(id) {
  const user = getCurrentUser();
  if (!user) { showLoginGate(); return; }
  openDestModal(id);
}

/* ══════════════════════════════
   FILTROS
══════════════════════════════ */
function initFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      applyFilter(currentFilter);
    });
  });
}

function applyFilter(filter) {
  const grid = document.getElementById('destinations-grid');
  if (!grid) return;
  grid.querySelectorAll('.dest-card').forEach(card => {
    const cats = card.dataset.categories || '';
    card.style.display = (filter === 'todos' || cats.includes(filter)) ? '' : 'none';
  });
  setTimeout(observeReveal, 50);
}

/* ══════════════════════════════
   FAVORITOS
══════════════════════════════ */
function toggleFavorite(id, btn) {
  if (!getCurrentUser()) { showLoginGate(); return; }

  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
    btn.innerHTML = '♥';
    btn.classList.add('active');
    showToast('Destino guardado nos favoritos.', 'success');
  } else {
    favorites.splice(idx, 1);
    btn.innerHTML = '♡';
    btn.classList.remove('active');
    showToast('Removido dos favoritos.', '');
  }
  localStorage.setItem('wl_favorites', JSON.stringify(favorites));
  renderFavorites();

  const statEl = document.getElementById('stat-favorites');
  if (statEl) statEl.textContent = favorites.length;
}

function renderFavorites() {
  const grid = document.getElementById('favorites-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const favDests = DESTINATIONS.filter(d => favorites.includes(d.id));
  if (!favDests.length) {
    grid.innerHTML = `<div class="empty-state"><p>Ainda não tem favoritos guardados. Explore os destinos e adicione os que mais lhe interessam.</p></div>`;
    return;
  }
  favDests.forEach(dest => grid.appendChild(createDestCard(dest)));
  observeReveal();
}

/* ══════════════════════════════
   MODAL DE DESTINO
══════════════════════════════ */
function openDestModal(id) {
  const dest = DESTINATIONS.find(d => d.id === id);
  if (!dest) return;
  activeModalId = id;

  const overlay = document.getElementById('dest-modal');
  if (!overlay) return;

  overlay.querySelector('#modal-img').src = dest.image;
  overlay.querySelector('#modal-img').alt = dest.name;
  overlay.querySelector('#modal-title').textContent = dest.name;
  overlay.querySelector('#modal-rating').innerHTML =
    `${renderStars(dest.rating)} &nbsp; ${dest.rating} &nbsp;·&nbsp; ${dest.reviews.toLocaleString('pt-PT')} avaliações`;
  overlay.querySelector('#modal-location').textContent = dest.location;
  overlay.querySelector('#modal-climate').textContent  = dest.climate;
  overlay.querySelector('#modal-desc').textContent     = dest.description;
  overlay.querySelector('#modal-price').innerHTML      = `${dest.price} <small>/ pessoa</small>`;

  const cats = dest.category.map(c =>
    `<span class="modal-chip">${capitalize(c)}</span>`
  ).join('');
  overlay.querySelector('#modal-cats').innerHTML = cats;

  const favBtn = overlay.querySelector('#modal-fav-btn');
  if (favBtn) {
    favBtn.textContent = favorites.includes(id) ? 'Guardado' : 'Guardar';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDestModal() {
  const overlay = document.getElementById('dest-modal');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  activeModalId = null;
}

function initModal() {
  const overlay = document.getElementById('dest-modal');
  if (!overlay) return;

  overlay.querySelector('#modal-close')?.addEventListener('click', closeDestModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDestModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDestModal(); });

  overlay.querySelector('#modal-fav-btn')?.addEventListener('click', () => {
    if (activeModalId == null) return;
    const fakeBtn = { innerHTML: '', classList: { add(){}, remove(){}, toggle(){} } };
    toggleFavorite(activeModalId, fakeBtn);
    const favBtn = overlay.querySelector('#modal-fav-btn');
    if (favBtn) favBtn.textContent = favorites.includes(activeModalId) ? 'Guardado' : 'Guardar';
  });
}

/* ══════════════════════════════
   LOGIN GATE MODAL
══════════════════════════════ */
function showLoginGate() {
  const existing = document.getElementById('login-gate-modal');
  if (existing) { existing.classList.add('open'); return; }

  const div = document.createElement('div');
  div.id = 'login-gate-modal';
  div.className = 'modal-overlay open';
  div.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-body" style="text-align:center;padding:52px 40px">
        <h2 class="modal-title" style="font-size:1.5rem;margin-bottom:10px">Acesso restrito</h2>
        <p style="color:var(--gray-600);font-size:.86rem;margin-bottom:32px;font-weight:300;line-height:1.7">
          Crie uma conta gratuita ou inicie sessão para ver detalhes dos destinos e guardar favoritos.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <a href="login.html" class="btn btn-dark">Iniciar sessão</a>
          <a href="register.html" class="btn btn-primary">Criar conta</a>
        </div>
        <button onclick="document.getElementById('login-gate-modal').classList.remove('open')"
          style="margin-top:20px;font-size:.76rem;color:var(--gray-400);text-decoration:underline;cursor:pointer;background:none;border:none;display:block;margin-left:auto;margin-right:auto">
          Continuar a navegar
        </button>
      </div>
    </div>`;
  document.body.appendChild(div);
  div.addEventListener('click', e => { if (e.target === div) div.classList.remove('open'); });
}

/* ══════════════════════════════
   FORMULÁRIOS
══════════════════════════════ */
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePass(v)  { return v.length >= 6; }

function setFieldError(input, msg) {
  input.classList.add('error');
  const el = input.closest('.form-group')?.querySelector('.error-msg');
  if (el) { el.textContent = msg; el.classList.add('show'); }
}
function clearFieldError(input) {
  input.classList.remove('error');
  const el = input.closest('.form-group')?.querySelector('.error-msg');
  if (el) el.classList.remove('show');
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailEl = form.querySelector('#email');
  const passEl  = form.querySelector('#password');

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearFieldError(emailEl);
    clearFieldError(passEl);
    let ok = true;

    if (!validateEmail(emailEl.value)) {
      setFieldError(emailEl, 'Insira um endereço de email válido.'); ok = false;
    }
    if (!validatePass(passEl.value)) {
      setFieldError(passEl, 'A senha deve ter pelo menos 6 caracteres.'); ok = false;
    }
    if (!ok) return;

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'A entrar...';
    btn.disabled = true;

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('wl_users') || '[]');
      const found = users.find(u => u.email === emailEl.value);

      if (found || emailEl.value === 'demo@wanderlust.com') {
        const loggedUser = found || { name: 'Utilizador Demo', email: 'demo@wanderlust.com' };
        setUser(loggedUser);
        showToast('Sessão iniciada com sucesso.', 'success');
        setTimeout(() => {
          window.location.href = localStorage.getItem('wl_preferences') ? 'dashboard.html' : 'preferences.html';
        }, 800);
      } else {
        setFieldError(passEl, 'Email ou senha incorretos. Use: demo@wanderlust.com');
        btn.textContent = 'Entrar';
        btn.disabled = false;
      }
    }, 1100);
  });
}

function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const pass    = form.querySelector('#password');
    const confirm = form.querySelector('#confirm-password');
    [name, email, pass, confirm].forEach(clearFieldError);
    let ok = true;

    if (!name.value.trim() || name.value.trim().length < 2) {
      setFieldError(name, 'Nome deve ter pelo menos 2 caracteres.'); ok = false;
    }
    if (!validateEmail(email.value)) {
      setFieldError(email, 'Email inválido.'); ok = false;
    }
    if (!validatePass(pass.value)) {
      setFieldError(pass, 'Senha deve ter pelo menos 6 caracteres.'); ok = false;
    }
    if (pass.value !== confirm.value) {
      setFieldError(confirm, 'As senhas não coincidem.'); ok = false;
    }
    if (!ok) return;

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'A criar conta...';
    btn.disabled = true;

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('wl_users') || '[]');
      const newUser = {
        name: name.value.trim(),
        email: email.value,
        location: form.querySelector('#location')?.value || ''
      };
      users.push(newUser);
      localStorage.setItem('wl_users', JSON.stringify(users));
      setUser(newUser);
      showToast('Conta criada com sucesso.', 'success');
      setTimeout(() => window.location.href = 'preferences.html', 850);
    }, 1100);
  });
}

function initPreferencesForm() {
  const form = document.getElementById('preferences-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const selected = [];
    form.querySelectorAll('.tourism-item input:checked').forEach(cb => selected.push(cb.value));

    const prefs = {
      categories: selected,
      budget:   form.querySelector('input[name="budget"]:checked')?.value   || 'médio',
      climate:  form.querySelector('input[name="climate"]:checked')?.value  || 'tropical',
      distance: form.querySelector('#distance')?.value || '12'
    };
    localStorage.setItem('wl_preferences', JSON.stringify(prefs));

    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'A guardar...';
    btn.disabled = true;

    showToast('Preferências guardadas. A gerar recomendações...', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 1100);
  });
}

/* ══════════════════════════════
   DASHBOARD
══════════════════════════════ */
function initDashboard() {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }

  const firstName = user.name?.split(' ')[0] || 'Viajante';
  const initial   = (user.name?.[0] || 'V').toUpperCase();

  document.querySelectorAll('.user-name').forEach(el => el.textContent = firstName);
  document.querySelectorAll('.user-avatar-letter').forEach(el => el.textContent = initial);

  // Recomendados
  const recGrid = document.getElementById('recommended-grid');
  if (recGrid) {
    const prefs = JSON.parse(localStorage.getItem('wl_preferences') || '{}');
    let dests = [...DESTINATIONS];
    if (prefs.categories?.length) {
      dests = dests.filter(d => d.category.some(c => prefs.categories.includes(c)));
    }
    if (!dests.length) dests = DESTINATIONS.slice(0, 4);
    dests.slice(0, 4).forEach(d => recGrid.appendChild(createDestCard(d, true)));
  }

  // Populares
  const popGrid = document.getElementById('popular-grid');
  if (popGrid) {
    [...DESTINATIONS].sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
      .forEach(d => popGrid.appendChild(createDestCard(d)));
  }

  renderFavorites();

  const statFav = document.getElementById('stat-favorites');
  if (statFav) statFav.textContent = favorites.length;

  observeReveal();
}

/* ══════════════════════════════
   LANDING PAGE
══════════════════════════════ */
function initLanding() {
  const grid = document.getElementById('destinations-grid');
  if (!grid) return;
  DESTINATIONS.forEach(dest => grid.appendChild(createDestCard(dest)));
  initFilters();
  observeReveal();

  document.getElementById('hero-search-btn')?.addEventListener('click', () => {
    const q = document.getElementById('hero-search-input')?.value?.trim();
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
    if (q) showToast(`A pesquisar por "${q}"...`, '');
  });
  document.getElementById('hero-search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('hero-search-btn')?.click();
  });
}

/* ══════════════════════════════
   SCROLL REVEAL
══════════════════════════════ */
function observeReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

/* ══════════════════════════════
   TOAST
══════════════════════════════ */
function showToast(message, type = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3400);
}

/* ══════════════════════════════
   UTILITÁRIOS
══════════════════════════════ */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function initLogout() {
  document.getElementById('nav-logout')?.addEventListener('click', e => {
    e.preventDefault(); logout();
  });
  document.getElementById('sidebar-logout')?.addEventListener('click', e => {
    e.preventDefault(); logout();
  });
}

/* ══════════════════════════════
   INIT
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLogout();
  initModal();
  observeReveal();

  const page = document.body.dataset.page;
  if (page === 'landing')     initLanding();
  if (page === 'login')       initLoginForm();
  if (page === 'register')    initRegisterForm();
  if (page === 'preferences') initPreferencesForm();
  if (page === 'dashboard')   initDashboard();
});
