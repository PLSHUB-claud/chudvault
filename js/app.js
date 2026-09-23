/**
 * RETRO FORUM / CHUD MEME DOWNLOAD HUB
 * Core Application Logic
 */

// Initial Seed Dataset (serves as immediate fallback if opened directly via file://)
const DEFAULT_DOWNLOADS = [
  {
    "id": "dl-mogged-vpn",
    "title": "MoggedVPN - Versao PC (Windows) & Mobile (Android)",
    "category": "APP",
    "version": "v1.0 (Windows & Android)",
    "size": "45.8 MB (PC) / 24.3 MB (APK)",
    "date": "2026-09-22",
    "author": "PLSHUB-claud",
    "status": "HOT",
    "image": "assets/mogged_vpn.jpg",
    "desc": "a VPN mais mogger da internet brasileira",
    "greentext": "versao oficial para PC e Android, baixe o instalador correspondente",
    "tags": [],
    "links": [
      { "name": "Baixar MoggedVPN_Setup.exe (Windows PC)", "url": "https://raw.githubusercontent.com/PLSHUB-claud/MOGGED-VPN/main/MoggedVPN_Setup.exe", "type": "direct" },
      { "name": "Baixar MoggedVPN-Android.apk (Mobile Android)", "url": "https://raw.githubusercontent.com/PLSHUB-claud/MOGGED-VPN/main/MoggedVPN-Android.apk", "type": "direct" }
    ],
    "md5": "f8a912bb01c234ee910245a8df23bc10",
    "pass": "sem-senha"
  },
  {
    "id": "dl-floyd-painel",
    "title": "Floyd Painel - Versao PC (Windows)",
    "category": "APP",
    "version": "v1.0 (PC Windows x64)",
    "size": "88.3 MB",
    "date": "2026-09-22",
    "author": "PLSHUB-claud",
    "status": "HOT",
    "image": "assets/floyd_painel.png",
    "desc": "floyd painel é um painel de RAID/NUKe com a imagen do george floyd , ele é do tipo nuker que deleta o server banindo membros e criando canais em massa",
    "greentext": "baixe o floyd.exe e execute diretamente no seu sistema",
    "tags": [],
    "links": [
      { "name": "Baixar floyd.exe (Direto)", "url": "https://raw.githubusercontent.com/PLSHUB-claud/FLOYD-PAINEL/main/floyd.exe", "type": "direct" }
    ],
    "md5": "b0b4234dc9b3b0962813a40705f2c0fd",
    "pass": "sem-senha"
  }
];

// App State
let allDownloads = [...DEFAULT_DOWNLOADS];
let currentCategory = 'ALL';
let searchQuery = '';
let currentSort = 'recent';
let soundEnabled = true;

// Web Audio API Retro Sound Effects
class RetroAudio {
  constructor() {
    this.ctx = null;
  }
  
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch(e) {}
  }

  playBeep() {
    if (!soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch(e) {}
  }

  playBuzz() {
    if (!soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(260, this.ctx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.32);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch(e) {}
  }
}

const sfx = new RetroAudio();

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  await initStorageAndData();
  initVisitorCounter();
  setupEventListeners();
  renderCategories();
  renderDownloads();
  initChudBee();
});

// ============================================================================
// SECURITY & SANITIZATION UTILITIES
// ============================================================================

/**
 * Escapes characters that could trigger HTML execution inside text nodes.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes characters for HTML attributes (including backticks to prevent template injections).
 */
function escapeAttr(str) {
  if (str === null || str === undefined) return '';
  return escapeHtml(str)
    .replace(/`/g, '&#96;')
    .replace(/=/g, '&#61;');
}

/**
 * Sanitizes URLs to prevent protocol-based XSS (javascript:, vbscript:, data:text/html, etc.).
 * Allows only http:, https:, relative paths, and safe anchors.
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  // Reject dangerous protocol injections
  if (/^\s*(javascript|data|vbscript|file):/i.test(trimmed)) {
    return '#';
  }
  // Allow safe web URLs and relative paths
  if (/^(?:https?:\/\/|\/|\.\/|#|magnet:)/i.test(trimmed)) {
    return trimmed;
  }
  // Safe relative paths (e.g. assets/pic.jpg)
  if (/^[a-zA-Z0-9_\-\.\/]+$/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

// Normaliza URLs do GitHub para download raw direto sem páginas ou redirects intermediários
function getDirectDownloadUrl(url) {
  if (!url) return '#';
  let safe = sanitizeUrl(url);
  if (safe === '#') return '#';
  if (safe.includes('github.com')) {
    if (safe.includes('/raw/')) {
      safe = safe.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
    }
    if (safe.includes('/blob/')) {
      safe = safe.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
  }
  return safe;
}

// Tenta buscar o README.md do repositório no GitHub para atualizar a descrição dinamicamente
async function fetchRepoReadme(url) {
  if (!url) return null;
  // Validates owner and repository with strict character sets (no path traversal .. or specials)
  const match = url.match(/(?:github\.com|raw\.githubusercontent\.com)\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  if (!match) return null;
  const owner = encodeURIComponent(match[1]);
  const repo = encodeURIComponent(match[2]);

  for (const branch of ['main', 'master']) {
    try {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
      const res = await fetch(readmeUrl);
      if (res.ok) {
        const text = await res.text();
        const trimmed = text.trim();
        // Limit string size to prevent denial of service from huge READMEs
        if (trimmed) return trimmed.slice(0, 1500);
      }
    } catch (e) {}
  }
  return null;
}

// Load Data from downloads.json or fallback + localStorage
async function initStorageAndData() {
  let loadedData = null;
  
  try {
    const res = await fetch('data/downloads.json');
    if (res.ok) {
      loadedData = await res.json();
    }
  } catch (err) {
    console.log('Local/CORS mode active, loading built-in seed dataset.');
  }

  const baseItems = (loadedData && Array.isArray(loadedData) && loadedData.length > 0) 
    ? loadedData 
    : DEFAULT_DOWNLOADS;

  // Safe localStorage parsing with try/catch to avoid crash on poisoned/corrupt storage
  let customItems = [];
  try {
    const raw = localStorage.getItem('retro_downloads_custom');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const legacyMockIds = new Set(['dl-001', 'dl-002', 'dl-003', 'dl-004', 'dl-005', 'dl-006', 'dl-007', 'dl-mogged-vpn', 'dl-floyd-painel']);
        customItems = parsed.filter(item => item && typeof item === 'object' && !legacyMockIds.has(item.id));
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar dados do localStorage, redefinindo...', e);
    localStorage.removeItem('retro_downloads_custom');
  }

  const seenIds = new Set();
  const merged = [];

  for (const item of [...customItems, ...baseItems]) {
    if (item && item.id && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      // Garante URLs de download direto e higienizadas
      if (Array.isArray(item.links)) {
        item.links.forEach(l => {
          if (l && l.url) l.url = getDirectDownloadUrl(l.url);
        });
      }
      merged.push(item);
    }
  }

  allDownloads = merged;

  // Sincroniza dinamicamente o README dos repositórios GitHub para a descrição
  allDownloads.forEach(item => {
    const primaryUrl = item.links && item.links[0] ? item.links[0].url : '';
    if (primaryUrl && (primaryUrl.includes('github.com') || primaryUrl.includes('raw.githubusercontent.com'))) {
      fetchRepoReadme(primaryUrl).then(readmeText => {
        if (readmeText && item.desc !== readmeText) {
          item.desc = readmeText;
          renderDownloads();
        }
      });
    }
  });
}

// Visitor Counter Simulation with persistent storage
function initVisitorCounter() {
  let count = parseInt(localStorage.getItem('retro_visitor_count') || '4289');
  count += 1;
  localStorage.setItem('retro_visitor_count', count.toString());
  const counterEl = document.getElementById('visitorCounter');
  if (counterEl) {
    counterEl.textContent = count.toString().padStart(6, '0');
  }
}

// Event Listeners setup
function setupEventListeners() {
  // Search Bar
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderDownloads();
    });
  }

  // Sort Select
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      sfx.playClick();
      renderDownloads();
    });
  }

  // Theme Switcher
  const toggleThemeBtn = document.getElementById('toggleTheme');
  if (toggleThemeBtn) {
    const themes = ['theme-default', 'theme-matrix', 'theme-win98'];
    const themeNames = { 'theme-default': 'VERMELHO', 'theme-matrix': 'MATRIX', 'theme-win98': 'WIN98' };
    let currentThemeIdx = 0;
    toggleThemeBtn.addEventListener('click', () => {
      sfx.playBeep();
      document.body.classList.remove('theme-matrix', 'theme-win98');
      currentThemeIdx = (currentThemeIdx + 1) % themes.length;
      if (themes[currentThemeIdx] !== 'theme-default') {
        document.body.classList.add(themes[currentThemeIdx]);
      }
      toggleThemeBtn.innerHTML = `<span>TEMA:</span> <strong class="ctrl-state">${themeNames[themes[currentThemeIdx]]}</strong>`;
    });
  }

  // Sound Toggle
  const toggleSoundBtn = document.getElementById('toggleSound');
  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      toggleSoundBtn.innerHTML = `<span>SOM 8-BIT:</span> <strong class="ctrl-state">${soundEnabled ? 'ON' : 'OFF'}</strong>`;
      if (soundEnabled) sfx.playBeep();
    });
  }

  // Add Download Modal triggers
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const sidebarBtnAdd = document.getElementById('sidebarBtnAdd');
  const btnCloseAddModal = document.getElementById('btnCloseAddModal');
  const btnCancelAddModal = document.getElementById('btnCancelAddModal');
  const modalAdd = document.getElementById('modalAddDownload');
  const formAddDownload = document.getElementById('formAddDownload');

  const openAddModal = () => {
    sfx.playClick();
    if (modalAdd) modalAdd.classList.add('active');
  };

  if (btnOpenAddModal) btnOpenAddModal.addEventListener('click', openAddModal);
  if (sidebarBtnAdd) sidebarBtnAdd.addEventListener('click', openAddModal);

  const closeModal = () => {
    sfx.playClick();
    if (modalAdd) modalAdd.classList.remove('active');
  };

  if (btnCloseAddModal) btnCloseAddModal.addEventListener('click', closeModal);
  if (btnCancelAddModal) btnCancelAddModal.addEventListener('click', closeModal);

  // Form Submit (Add New Download)
  if (formAddDownload) {
    formAddDownload.addEventListener('submit', (e) => {
      e.preventDefault();
      sfx.playBeep();
      handleAddNewDownload();
    });
  }

  // Export JSON buttons
  const btnExportJson = document.getElementById('btnExportJson');
  const sidebarBtnExport = document.getElementById('sidebarBtnExport');
  const handleExport = () => {
    sfx.playBeep();
    exportDownloadsJson();
  };
  if (btnExportJson) btnExportJson.addEventListener('click', handleExport);
  if (sidebarBtnExport) sidebarBtnExport.addEventListener('click', handleExport);

  // Bitcoin Donate copy button & address click
  const btnCopyBtc = document.getElementById('btnCopyBtcSidebar');
  const btcAddrEl = document.getElementById('sidebarBtcAddr');
  const btcText = document.getElementById('btnCopyBtcSidebarText');
  const btcAddress = "bc1qdhvekhnhwl70wf0gzc8fgl8mxnxgng5um0fqvu";

  const handleCopyBtc = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(btcAddress).then(() => {
      if (btcText) btcText.textContent = "COPIADO!";
      showToast('[OK] Endereço Bitcoin copiado com sucesso!');
      setTimeout(() => {
        if (btcText) btcText.textContent = "COPIAR";
      }, 2500);
    }).catch(() => {
      prompt("Copie o endereço Bitcoin:", btcAddress);
    });
  };

  if (btnCopyBtc) btnCopyBtc.addEventListener('click', handleCopyBtc);
  if (btcAddrEl) btcAddrEl.addEventListener('click', handleCopyBtc);

  // Global click sound delegation for links and buttons (exceto botões de cópia e botões de download)
  document.addEventListener('click', (e) => {
    // Ignorar som para botões de cópia e botões de download
    if (e.target.closest('.btn-donate-copy, #sidebarBtcAddr, #btnCopyBtcSidebar, .btn-copy-hash, .btn-retro-dl, .btn-mirror, a[download]')) {
      const dlBtn = e.target.closest('.btn-retro-dl, a[download]');
      if (dlBtn) {
        showToast('[⬇] Iniciando download direto do instalador...');
      }
      return; // Sem som ao copiar nem ao baixar apps
    }
    if (e.target.closest('button, .btn-cat, .btn-sidebar-action')) {
      sfx.playClick();
    }
  });
}

// Render Category Filter Buttons
function renderCategories() {
  const container = document.getElementById('categoryButtons');
  if (!container) return;

  const categories = ['ALL', 'APP', 'GAMES', 'TOOLS', 'EMULADORES', 'SISTEMA'];
  
  // Count items
  const counts = { 'ALL': allDownloads.length };
  allDownloads.forEach(item => {
    const cat = (item.category || 'APP').toUpperCase();
    counts[cat] = (counts[cat] || 0) + 1;
  });

  container.innerHTML = categories.map(cat => {
    const label = cat === 'ALL' ? 'TODOS' : cat;
    const count = counts[cat] || 0;
    const isActive = currentCategory === cat ? 'active' : '';
    return `
      <button class="btn-cat ${isActive}" data-cat="${escapeAttr(cat)}">
        ${escapeHtml(label)} <span class="cat-count">${count}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.btn-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.cat;
      container.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDownloads();
    });
  });
}

// Render Downloads List
function renderDownloads() {
  const listEl = document.getElementById('downloadsList');
  const countEl = document.getElementById('downloadsCount');
  if (!listEl) return;

  // Filter
  let filtered = allDownloads.filter(item => {
    const matchesCat = currentCategory === 'ALL' || (item.category && item.category.toUpperCase() === currentCategory);
    
    if (!matchesCat) return false;
    if (!searchQuery) return true;

    const fullText = `
      ${item.title} 
      ${item.desc || ''} 
      ${item.version || ''} 
      ${item.author || ''} 
      ${(item.tags || []).join(' ')}
    `.toLowerCase();

    return fullText.includes(searchQuery);
  });

  // Sort
  filtered.sort((a, b) => {
    if (currentSort === 'recent') {
      const diff = new Date(b.date || '2026-01-01') - new Date(a.date || '2026-01-01');
      if (diff !== 0) return diff;
      return allDownloads.indexOf(a) - allDownloads.indexOf(b);
    } else if (currentSort === 'title') {
      return a.title.localeCompare(b.title);
    } else if (currentSort === 'size') {
      const getMb = (sz) => parseFloat(sz) * (sz.includes('GB') ? 1024 : 1);
      return (getMb(b.size || '0') - getMb(a.size || '0'));
    }
    return 0;
  });

  if (countEl) {
    countEl.textContent = `[${filtered.length} ARQUIVOS INDEXADOS]`;
  }

  const sidebarDlCount = document.getElementById('sidebarDlCount');
  if (sidebarDlCount) {
    sidebarDlCount.textContent = filtered.length;
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p>[!] NENHUM ARQUIVO ENCONTRADO PARA ESTA BUSCA</p>
        <p style="font-size: 16px; margin-top: 8px; color: var(--text-muted);">
          Tente outro termo ou clique no botão acima para adicionar um novo link!
        </p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(item => createDownloadCardHtml(item)).join('');

  // Attach card specific buttons
  listEl.querySelectorAll('.btn-show-info').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playClick();
      showInfoModal(btn.dataset.id);
    });
  });

  listEl.querySelectorAll('.btn-copy-hash').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.hash || '');
      showToast(`Hash MD5 copiado: ${btn.dataset.hash}`);
    });
  });
}

// Generate Card HTML (Fully Escaped & Sanitized)
function createDownloadCardHtml(item) {
  const safeId = escapeAttr(item.id || 'dl-' + Math.random().toString(36).substr(2, 9));
  const safeCategory = escapeHtml(item.category || 'APP');
  const safeStatus = escapeHtml(item.status || 'ATIVO');
  const safeTitle = escapeHtml(item.title || 'Download');
  const safeVersion = escapeHtml(item.version || 'v1.0');
  const safeSize = escapeHtml(item.size || 'N/A');
  const safeDate = escapeHtml(item.date || '2026');
  const safeAuthor = escapeHtml(item.author || 'Anon');
  const safePass = escapeHtml(item.pass || '');
  const safeDesc = escapeHtml(item.desc || '');
  const safeGreentext = escapeHtml(item.greentext || '');

  // Renderiza todos os botões de download disponíveis de forma sanitizada
  const linksHtml = (item.links && Array.isArray(item.links) && item.links.length > 0)
    ? item.links.map(link => {
        const rawUrl = getDirectDownloadUrl(link.url);
        const safeUrl = sanitizeUrl(rawUrl);
        const fName = (safeUrl.split('/').pop() || 'download').split('?')[0];
        const safeFName = escapeAttr(fName.replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
        const safeName = escapeHtml(link.name || 'Download');
        return `
          <a href="${escapeAttr(safeUrl)}" download="${safeFName}" class="btn-retro-dl" rel="noopener noreferrer">
            [DOWNLOAD] ${safeName}
          </a>
        `;
      }).join('')
    : `
      <a href="#" class="btn-retro-dl">
        [DOWNLOAD] Baixar
      </a>
    `;

  const thumbHtml = item.image ? `
    <div class="dl-card-thumb-wrapper">
      <img src="${escapeAttr(sanitizeUrl(item.image))}" alt="${safeTitle}" class="dl-card-thumb" loading="lazy">
    </div>
  ` : '';

  return `
    <article class="dl-card ${item.image ? 'has-thumb' : ''}" id="${safeId}">
      <div class="dl-header">
        <div class="dl-title-group">
          <span class="badge-status ${safeStatus}">${safeStatus}</span>
          <span class="dl-category-tag">[${safeCategory}]</span>
          <h3 class="dl-title">${safeTitle}</h3>
        </div>
      </div>

      <div class="dl-card-body-layout">
        <div class="dl-card-info">
          <div class="dl-meta">
            <span>VERSAO: <strong>${safeVersion}</strong></span>
            <span>TAMANHO: <strong>${safeSize}</strong></span>
            <span>DATA: <strong>${safeDate}</strong></span>
            <span>UPLOADER: <strong>${safeAuthor}</strong></span>
            ${safePass && safePass !== 'sem-senha' ? `<span>SENHA: <strong>${safePass}</strong></span>` : ''}
          </div>

          <p class="dl-desc">${safeDesc}</p>
          
          ${safeGreentext ? `<div class="dl-greentext">&gt; ${safeGreentext}</div>` : ''}

          <div class="dl-action-bar">
            <div class="dl-links-group">
              ${linksHtml}
            </div>
          </div>
        </div>
        ${thumbHtml}
      </div>
    </article>
  `;
}

// Handle Adding a New Download (Input validation & sanitization)
function handleAddNewDownload() {
  const title = document.getElementById('newTitle').value.trim();
  const category = document.getElementById('newCategory').value;
  const version = document.getElementById('newVersion').value.trim() || 'v1.0';
  const size = document.getElementById('newSize').value.trim() || 'N/A';
  const author = document.getElementById('newAuthor').value.trim() || 'Anonymous';
  const status = document.getElementById('newStatus').value;
  const rawPrimaryUrl = document.getElementById('newUrl').value.trim() || '#';
  const primaryUrl = sanitizeUrl(rawPrimaryUrl);
  const rawMirrorUrl = document.getElementById('newMirrorUrl').value.trim();
  const mirrorUrl = rawMirrorUrl ? sanitizeUrl(rawMirrorUrl) : '';
  const desc = document.getElementById('newDesc').value.trim();
  const tagsStr = document.getElementById('newTags').value.trim();
  const pass = document.getElementById('newPass').value.trim() || 'sem-senha';

  if (!title) {
    alert('Por favor, informe o título do download!');
    return;
  }

  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
  
  const links = [
    { name: 'Download Principal', url: primaryUrl, type: 'direct' }
  ];

  if (mirrorUrl && mirrorUrl !== '#') {
    links.push({ name: 'Espelho Secundário', url: mirrorUrl, type: 'mirror' });
  }

  // Generate pseudorandom MD5 for retro feel if not provided
  const randomMd5 = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');

  const newDownload = {
    id: 'dl-' + Date.now(),
    title,
    category,
    version,
    size,
    date: new Date().toISOString().split('T')[0],
    author,
    status,
    desc,
    tags,
    links,
    md5: randomMd5,
    pass
  };

  // Prepend to all downloads and save to localStorage
  allDownloads.unshift(newDownload);
  const customItems = JSON.parse(localStorage.getItem('retro_downloads_custom') || '[]');
  customItems.unshift(newDownload);
  localStorage.setItem('retro_downloads_custom', JSON.stringify(customItems));

  // Reset & close
  document.getElementById('formAddDownload').reset();
  document.getElementById('modalAddDownload').classList.remove('active');

  renderCategories();
  renderDownloads();
  showToast(`[OK] Download "${escapeHtml(title)}" indexado com sucesso!`);
}

// Show Info / Hash Modal (Sanitized)
function showInfoModal(id) {
  const item = allDownloads.find(d => d.id === id);
  if (!item) return;

  const modalEl = document.getElementById('modalInfo');
  const bodyEl = document.getElementById('modalInfoBody');
  if (!modalEl || !bodyEl) return;

  const safeId = escapeAttr(item.id || '');
  const safeCategory = escapeHtml(item.category || 'APP');
  const safeStatus = escapeHtml(item.status || 'ATIVO');
  const safeTitle = escapeHtml(item.title || '');
  const safeVersion = escapeHtml(item.version || '');
  const safeSize = escapeHtml(item.size || 'N/A');
  const safeAuthor = escapeHtml(item.author || 'Anon');
  const safeDate = escapeHtml(item.date || '');
  const safePass = escapeHtml(item.pass || 'sem-senha');
  const safeMd5 = escapeHtml(item.md5 || 'N/A');

  const linksHtml = (item.links && Array.isArray(item.links))
    ? item.links.map(l => {
        const safeUrl = sanitizeUrl(l.url);
        return `<li><a href="${escapeAttr(safeUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--text-accent);">${escapeHtml(l.name)}</a> - <small>${escapeHtml(safeUrl)}</small></li>`;
      }).join('')
    : '';

  bodyEl.innerHTML = `
    <div style="font-family: var(--font-mono); font-size: 13px; line-height: 1.8;">
      <p style="color: var(--text-gold); font-size: 16px; font-weight: bold; border-bottom: 1px dashed var(--border-secondary); padding-bottom: 4px;">
        ${safeTitle} (${safeVersion})
      </p>
      <p style="margin-top: 8px;"><strong>ID do Fórum:</strong> <code>${safeId}</code></p>
      <p><strong>Categoria:</strong> ${safeCategory}</p>
      <p><strong>Tamanho do Arquivo:</strong> ${safeSize}</p>
      <p><strong>Uploader Original:</strong> ${safeAuthor}</p>
      <p><strong>Data de Indexação:</strong> ${safeDate}</p>
      <p><strong>Status de Verificação:</strong> <span class="badge-status ${safeStatus}">${safeStatus}</span></p>
      <p><strong>Senha de Descompactação:</strong> <code style="background: #000; padding: 2px 6px; color: var(--text-accent);">${safePass}</code></p>
      
      <div style="margin-top: 10px; background: #080808; padding: 8px; border: 1px solid #333;">
        <span style="color: #aaa;">Checksum MD5 Oficial:</span><br>
        <code style="color: var(--text-red); font-size: 14px; word-break: break-all;">${safeMd5}</code>
      </div>

      <div style="margin-top: 12px;">
        <strong>Links Disponíveis:</strong>
        <ul style="margin-left: 20px; margin-top: 4px;">
          ${linksHtml}
        </ul>
      </div>
    </div>
  `;

  modalEl.classList.add('active');
  const closeBtn = document.getElementById('btnCloseInfoModal');
  if (closeBtn) {
    closeBtn.onclick = () => modalEl.classList.remove('active');
  }
}

// Export data as JSON file for backup / permanent saving
function exportDownloadsJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allDownloads, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `downloads_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('[OK] Arquivo downloads.json exportado!');
}

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('retroToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'retroToast';
    toast.className = 'retro-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}


// ============================================================================
// CHUDBEE MASCOT LOGIC (Animação de voo infinito: vai e volta a cada 5s)
// ============================================================================
function initChudBee() {
  const beeContainer = document.getElementById('chudBeeContainer');
  const beeSpeech = document.getElementById('chudBeeSpeech');
  const btnTrigger = document.getElementById('sidebarBtnBee');
  if (!beeContainer) return;

  // Contexto de áudio para ganho estourado/meme
  let beeAudioCtx = null;

  function playBeeVoiceOverlapping() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!beeAudioCtx) {
        beeAudioCtx = new AudioCtx();
      }
      if (beeAudioCtx.state === 'suspended') {
        beeAudioCtx.resume();
      }

      // Cria uma nova instância a cada clique para permitir sobreposição de áudios simultâneos
      const sound = new Audio('assets/audio_paz.m4a');
      const source = beeAudioCtx.createMediaElementSource(sound);
      const gainNode = beeAudioCtx.createGain();

      // Volume aumentado e estourado (estilo meme boost)
      gainNode.gain.value = 3.2;

      source.connect(gainNode);
      gainNode.connect(beeAudioCtx.destination);

      sound.play().catch(() => {
        // Fallback em caso de restrição do navegador
        const fallbackSound = new Audio('assets/audio_paz.m4a');
        fallbackSound.play().catch(() => {});
      });

      // Libera os nós ao finalizar o áudio
      sound.addEventListener('ended', () => {
        try {
          source.disconnect();
          gainNode.disconnect();
        } catch (e) {}
      });
    } catch (err) {
      // Fallback nativo: garante que toca mesmo sem Web Audio API
      const sound = new Audio('assets/audio_paz.m4a');
      sound.play().catch(() => {});
    }
  }

  const phrases = [
    'BILLIONS MUST BUZZ!',
    'MOGGED!',
    'TOTAL BEE DEATH!',
    'IT\'S SO OVER...',
    'BUZZZZZZZZ!',
    'COPE & SEETHE',
    'CHUD APPROVED',
    'NETSCAPE 4.0 READY'
  ];

  let currentDirection = 'forward'; // 'forward' (ida) ou 'backward' (volta)
  let isFlying = false;
  let nextFlightTimeout = null;
  let speechTimeout = null;

  function flyBee(forcedDirection) {
    if (isFlying) return;
    isFlying = true;

    const dir = forcedDirection || currentDirection;

    // Remove ambas as classes e força reflow
    beeContainer.classList.remove('flying-forward', 'flying-backward');
    void beeContainer.offsetWidth;

    // Aplica a classe da direção atual
    if (dir === 'forward') {
      beeContainer.classList.add('flying-forward');
    } else {
      beeContainer.classList.add('flying-backward');
    }

    // Sem som de bip ao surgir (voo silencioso)

    // Sorteia frase para o balãozinho
    if (beeSpeech) {
      beeSpeech.textContent = phrases[Math.floor(Math.random() * phrases.length)];
      beeSpeech.classList.remove('show-speech');
    }
  }

  // Ao terminar o trajeto do voo (saiu da tela)
  beeContainer.addEventListener('animationend', () => {
    beeContainer.classList.remove('flying-forward', 'flying-backward');
    isFlying = false;

    // Inverte a direção: se foi pra direita, agora volta pra esquerda (e vice-versa)
    currentDirection = (currentDirection === 'forward') ? 'backward' : 'forward';

    // Aguarda exatamente 5 segundos e dispara o próximo voo de volta (loop infinito)
    clearTimeout(nextFlightTimeout);
    nextFlightTimeout = setTimeout(() => {
      flyBee();
    }, 5000);
  });

  // Interação ao clicar na abelhinha (toca áudio amplificado a cada clique, sobrepondo)
  beeContainer.addEventListener('click', (e) => {
    e.stopPropagation();

    // Toca o áudio estourado permitindo sobreposição imediata
    playBeeVoiceOverlapping();

    if (beeSpeech) {
      beeSpeech.textContent = phrases[Math.floor(Math.random() * phrases.length)];
      beeSpeech.classList.remove('show-speech');
      void beeSpeech.offsetWidth;
      beeSpeech.classList.add('show-speech');
      clearTimeout(speechTimeout);
      speechTimeout = setTimeout(() => {
        beeSpeech.classList.remove('show-speech');
      }, 2200);
    }
  });

  // Botão na barra lateral de Atalhos
  if (btnTrigger) {
    btnTrigger.addEventListener('click', () => {
      clearTimeout(nextFlightTimeout);
      flyBee();
      showToast('[🐝] Chudbee voando!');
    });
  }

  // Primeiro voo inicia 2 segundos após carregar a página
  nextFlightTimeout = setTimeout(() => {
    flyBee('forward');
  }, 2000);
}

