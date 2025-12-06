/**
 * GameVault - Aplicacao Principal
 * Single Page Application para gerenciamento de colecao de jogos
 */

// ============================================
// ESTADO DA APLICACAO
// ============================================
const state = {
    games: [],
    filteredGames: [],
    platforms: [],
    genres: [],
    currentFilter: 'all',
    currentPlatform: 'all',
    currentGenre: 'all',
    searchTerm: '',
    editingGameId: null,
    isLoading: true,
};

// ============================================
// ELEMENTOS DO DOM
// ============================================
const elements = {
    // Grid de jogos
    gamesGrid: document.getElementById('games-grid'),
    loading: document.getElementById('loading'),
    emptyState: document.getElementById('empty-state'),

    // Estatisticas
    totalGames: document.getElementById('total-games'),
    completedGames: document.getElementById('completed-games'),
    playingGames: document.getElementById('playing-games'),

    // Busca e filtros
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    filterButtons: document.querySelectorAll('.filter-btn:not(.platform-btn):not(.genre-btn)'),
    platformFiltersContainer: document.getElementById('platform-filters'),
    genreFiltersContainer: document.getElementById('genre-filters'),

    // Modal de formulario de jogo
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    gameForm: document.getElementById('game-form'),
    gameId: document.getElementById('game-id'),
    gameTitle: document.getElementById('game-title'),
    gameDescription: document.getElementById('game-description'),
    gameGenre: document.getElementById('game-genre'),
    gameStatus: document.getElementById('game-status'),
    gamePlatforms: document.getElementById('game-platforms'),
    gameRating: document.getElementById('game-rating'),
    gameHours: document.getElementById('game-hours'),
    gameReleaseDate: document.getElementById('game-release-date'),
    gameCover: document.getElementById('game-cover'),
    submitText: document.getElementById('submit-text'),
    openModalBtn: document.getElementById('open-modal-btn'),
    emptyAddBtn: document.getElementById('empty-add-btn'),
    modalClose: document.getElementById('modal-close'),
    cancelBtn: document.getElementById('cancel-btn'),

    // Modal de detalhes
    detailModalOverlay: document.getElementById('detail-modal-overlay'),
    detailContent: document.getElementById('detail-content'),
    detailModalClose: document.getElementById('detail-modal-close'),

    // Modal de plataforma
    platformModalOverlay: document.getElementById('platform-modal-overlay'),
    platformModalClose: document.getElementById('platform-modal-close'),
    platformForm: document.getElementById('platform-form'),
    platformName: document.getElementById('platform-name'),
    platformManufacturer: document.getElementById('platform-manufacturer'),
    openPlatformModalBtn: document.getElementById('open-platform-modal-btn'),
    platformsAccordionBtn: document.getElementById('platforms-accordion-btn'),
    platformsAccordionContent: document.getElementById('platforms-accordion-content'),
    platformsList: document.getElementById('platforms-list'),

    // Modal de genero
    genreModalOverlay: document.getElementById('genre-modal-overlay'),
    genreModalClose: document.getElementById('genre-modal-close'),
    genreForm: document.getElementById('genre-form'),
    genreName: document.getElementById('genre-name'),
    genreDescription: document.getElementById('genre-description'),
    openGenreModalBtn: document.getElementById('open-genre-modal-btn'),
    genresAccordionBtn: document.getElementById('genres-accordion-btn'),
    genresAccordionContent: document.getElementById('genres-accordion-content'),
    genresList: document.getElementById('genres-list'),

    // Toast
    toastContainer: document.getElementById('toast-container'),

    // Modal de confirmacao
    confirmModalOverlay: document.getElementById('confirm-modal-overlay'),
    confirmIcon: document.getElementById('confirm-icon'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmOkBtn: document.getElementById('confirm-ok-btn'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
};

// ============================================
// FUNCOES UTILITARIAS
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '&#10004;', error: '&#10006;', info: 'i' };
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/**
 * Exibe um modal de confirmacao customizado
 * @param {string} title - Titulo do modal
 * @param {string} message - Mensagem de confirmacao
 * @param {string} icon - Icone (opcional)
 * @param {string} confirmText - Texto do botao de confirmar
 * @returns {Promise<boolean>} - true se confirmou, false se cancelou
 */
function showConfirm(title, message, icon = '&#9888;', confirmText = 'Confirmar') {
    return new Promise((resolve) => {
        elements.confirmIcon.innerHTML = icon;
        elements.confirmTitle.textContent = title;
        elements.confirmMessage.textContent = message;
        elements.confirmOkBtn.innerHTML = confirmText;
        elements.confirmModalOverlay.classList.add('active');

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const handleKeydown = (e) => {
            if (e.key === 'Escape') handleCancel();
            if (e.key === 'Enter') handleConfirm();
        };

        const handleOverlayClick = (e) => {
            if (e.target === elements.confirmModalOverlay) handleCancel();
        };

        const cleanup = () => {
            elements.confirmModalOverlay.classList.remove('active');
            elements.confirmOkBtn.removeEventListener('click', handleConfirm);
            elements.confirmCancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', handleKeydown);
            elements.confirmModalOverlay.removeEventListener('click', handleOverlayClick);
        };

        elements.confirmOkBtn.addEventListener('click', handleConfirm);
        elements.confirmCancelBtn.addEventListener('click', handleCancel);
        document.addEventListener('keydown', handleKeydown);
        elements.confirmModalOverlay.addEventListener('click', handleOverlayClick);
    });
}

function getStatusInfo(status) {
    const statusMap = {
        playing: { text: 'Jogando', class: 'status-playing', emoji: '🎮' },
        completed: { text: 'Zerado', class: 'status-completed', emoji: '&#10004;' },
        backlog: { text: 'Backlog', class: 'status-backlog', emoji: '&#128203;' },
        abandoned: { text: 'Abandonado', class: 'status-dropped', emoji: '&#10006;' },
    };
    return statusMap[status] || { text: status, class: '', emoji: '?' };
}

function getGenreEmoji(genreName) {
    if (!genreName) return '🎮';
    const genreEmojis = {
        'acao': '&#9876;', 'aventura': '&#128506;', 'rpg': '&#129497;',
        'fps': '&#128299;', 'shooter': '&#128299;', 'estrategia': '&#9823;',
        'esporte': '&#9917;', 'corrida': '&#127950;', 'puzzle': '&#129513;',
        'terror': '&#128123;', 'horror': '&#128123;', 'simulacao': '&#127919;', 'indie': '&#128142;',
    };
    const normalized = genreName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return genreEmojis[normalized] || '🎮';
}

function formatRating(rating) {
    if (rating === null || rating === undefined || rating === '') return '-';
    return parseFloat(rating).toFixed(1);
}

function updateStats() {
    const total = state.games.length;
    const completed = state.games.filter(g => g.status === 'completed').length;
    const playing = state.games.filter(g => g.status === 'playing').length;
    animateNumber(elements.totalGames, total);
    animateNumber(elements.completedGames, completed);
    animateNumber(elements.playingGames, playing);
}

function animateNumber(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const diff = newValue - currentValue;
    const steps = 20;
    const increment = diff / steps;
    let current = currentValue;
    let step = 0;
    const timer = setInterval(() => {
        step++;
        current += increment;
        element.textContent = Math.round(current);
        if (step >= steps) {
            element.textContent = newValue;
            clearInterval(timer);
        }
    }, 25);
}

// ============================================
// RENDERIZACAO
// ============================================

function renderGameCard(game) {
    const statusInfo = getStatusInfo(game.status);
    const genreName = game.genre ? game.genre.name : 'Sem genero';
    const genreEmoji = getGenreEmoji(genreName);
    const platformNames = game.platforms && game.platforms.length > 0
        ? game.platforms.map(p => p.name).join(', ')
        : 'Sem plataforma';

    const imageHtml = game.cover_url
        ? `<img src="${game.cover_url}" alt="${game.title}" onerror="this.parentElement.innerHTML='<div class=\\'game-card-placeholder\\'>${genreEmoji}</div>'">`
        : `<div class="game-card-placeholder">${genreEmoji}</div>`;

    return `
        <article class="game-card" data-id="${game.id}" onclick="openDetailModal(${game.id})">
            <div class="game-card-image">
                ${imageHtml}
                <span class="game-card-status ${statusInfo.class}">${statusInfo.text}</span>
            </div>
            <div class="game-card-content">
                <h3 class="game-card-title" title="${game.title}">${game.title}</h3>
                <div class="game-card-meta">
                    <span class="game-card-tag">${platformNames}</span>
                    <span class="game-card-tag">${genreName}</span>
                </div>
                <div class="game-card-footer">
                    <div class="game-card-rating">
                        <span class="rating-star">&#9733;</span>
                        <span class="rating-value">${formatRating(game.rating)}</span>
                    </div>
                    <span class="game-card-hours">${game.hours_played || 0}h</span>
                    <div class="game-card-actions">
                        <button class="card-action-btn" onclick="event.stopPropagation(); openEditModal(${game.id})" title="Editar">&#9998;</button>
                        <button class="card-action-btn delete" onclick="event.stopPropagation(); confirmDelete(${game.id})" title="Excluir">&#128465;</button>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function renderGames() {
    const gamesToRender = state.filteredGames;
    elements.loading.style.display = 'none';

    if (gamesToRender.length === 0) {
        elements.gamesGrid.innerHTML = '';
        elements.emptyState.style.display = 'flex';
        if (state.searchTerm || state.currentFilter !== 'all' || state.currentPlatform !== 'all' || state.currentGenre !== 'all') {
            elements.emptyState.querySelector('h2').textContent = 'Nenhum jogo encontrado';
            elements.emptyState.querySelector('p').textContent = 'Tente ajustar os filtros ou busca.';
            elements.emptyState.querySelector('.add-game-btn').style.display = 'none';
        } else {
            elements.emptyState.querySelector('h2').textContent = 'Sua colecao esta vazia!';
            elements.emptyState.querySelector('p').textContent = 'Comece adicionando os jogos que voce ja jogou.';
            elements.emptyState.querySelector('.add-game-btn').style.display = 'flex';
        }
        return;
    }

    elements.emptyState.style.display = 'none';
    elements.gamesGrid.innerHTML = gamesToRender.map(renderGameCard).join('');
}

function applyFilters() {
    let filtered = [...state.games];
    if (state.currentFilter !== 'all') {
        filtered = filtered.filter(game => game.status === state.currentFilter);
    }
    if (state.currentPlatform !== 'all') {
        filtered = filtered.filter(game => game.platforms && game.platforms.some(p => p.id == state.currentPlatform));
    }
    if (state.currentGenre !== 'all') {
        filtered = filtered.filter(game => game.genre && game.genre.id == state.currentGenre);
    }
    if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        filtered = filtered.filter(game =>
            game.title.toLowerCase().includes(term) ||
            (game.genre && game.genre.name && game.genre.name.toLowerCase().includes(term)) ||
            (game.platforms && game.platforms.some(p => p.name.toLowerCase().includes(term)))
        );
    }
    state.filteredGames = filtered;
    renderGames();
}

function renderPlatformFilters() {
    const container = elements.platformFiltersContainer;
    let html = '<button class="filter-btn platform-btn active" data-platform="all">Todas</button>';
    state.platforms.forEach(platform => {
        html += `<button class="filter-btn platform-btn" data-platform="${platform.id}">${platform.name}</button>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentPlatform = btn.dataset.platform;
            applyFilters();
        });
    });
}

function renderGenreFilters() {
    const container = elements.genreFiltersContainer;
    let html = '<button class="filter-btn genre-btn active" data-genre="all">Todos</button>';
    state.genres.forEach(genre => {
        html += `<button class="filter-btn genre-btn" data-genre="${genre.id}">${genre.name}</button>`;
    });
    container.innerHTML = html;
    container.querySelectorAll('.genre-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentGenre = btn.dataset.genre;
            applyFilters();
        });
    });
}

function populateGenreSelect() {
    const select = elements.gameGenre;
    select.innerHTML = '<option value="">Selecione...</option>';
    state.genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id;
        option.textContent = genre.name;
        select.appendChild(option);
    });
}

function populatePlatformCheckboxes() {
    const container = elements.gamePlatforms;
    container.innerHTML = '';
    state.platforms.forEach(platform => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="platform-${platform.id}" value="${platform.id}">
            <label for="platform-${platform.id}">${platform.name}</label>
        `;
        container.appendChild(div);
    });
}

// ============================================
// MODAL DE JOGO
// ============================================

function openAddModal() {
    state.editingGameId = null;
    elements.modalTitle.textContent = 'Adicionar Novo Jogo';
    elements.submitText.textContent = 'Salvar Jogo';
    elements.gameForm.reset();
    elements.gamePlatforms.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    elements.modalOverlay.classList.add('active');
}

async function openEditModal(id) {
    try {
        const game = await api.buscarJogo(id);
        state.editingGameId = id;
        elements.modalTitle.textContent = 'Editar Jogo';
        elements.submitText.textContent = 'Atualizar Jogo';
        elements.gameId.value = game.id;
        elements.gameTitle.value = game.title || '';
        elements.gameDescription.value = game.description || '';
        elements.gameGenre.value = game.genre ? game.genre.id : '';
        elements.gameStatus.value = game.status || '';
        elements.gameRating.value = game.rating || '';
        elements.gameHours.value = game.hours_played || '';
        elements.gameReleaseDate.value = game.release_date || '';
        elements.gameCover.value = game.cover_url || '';
        elements.gamePlatforms.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = game.platforms && game.platforms.some(p => p.id == cb.value);
        });
        elements.modalOverlay.classList.add('active');
    } catch (error) {
        showToast('Erro ao carregar dados do jogo', 'error');
        console.error(error);
    }
}

function closeModal() {
    elements.modalOverlay.classList.remove('active');
    elements.gameForm.reset();
    state.editingGameId = null;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const platformIds = [];
    elements.gamePlatforms.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        platformIds.push(parseInt(cb.value));
    });

    const gameData = {
        title: elements.gameTitle.value.trim(),
        description: elements.gameDescription.value.trim() || null,
        genre_id: elements.gameGenre.value ? parseInt(elements.gameGenre.value) : null,
        status: elements.gameStatus.value,
        platform_ids: platformIds,
        rating: elements.gameRating.value ? parseFloat(elements.gameRating.value) : null,
        hours_played: elements.gameHours.value ? parseFloat(elements.gameHours.value) : 0,
        release_date: elements.gameReleaseDate.value || null,
        cover_url: elements.gameCover.value.trim() || null,
    };

    try {
        if (state.editingGameId) {
            await api.atualizarJogo(state.editingGameId, gameData);
            showToast('Jogo atualizado com sucesso!', 'success');
        } else {
            await api.cadastrarJogo(gameData);
            showToast('Jogo adicionado com sucesso!', 'success');
        }
        closeModal();
        await loadGames();
    } catch (error) {
        showToast(error.message || 'Erro ao salvar jogo', 'error');
        console.error(error);
    }
}

// ============================================
// MODAL DE DETALHES
// ============================================

async function openDetailModal(id) {
    try {
        const game = await api.buscarJogo(id);
        const statusInfo = getStatusInfo(game.status);
        const genreName = game.genre ? game.genre.name : 'Sem genero';
        const genreEmoji = getGenreEmoji(genreName);
        const platformNames = game.platforms && game.platforms.length > 0
            ? game.platforms.map(p => p.name).join(', ')
            : 'Sem plataforma';

        const imageHtml = game.cover_url
            ? `<img src="${game.cover_url}" alt="${game.title}" onerror="this.parentElement.innerHTML='<div class=\\'detail-image-placeholder\\'>${genreEmoji}</div>'">`
            : `<div class="detail-image-placeholder">${genreEmoji}</div>`;

        elements.detailContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-image">${imageHtml}</div>
                <div class="detail-info">
                    <h2 class="detail-title">${game.title}</h2>
                    <div class="detail-tags">
                        <span class="detail-tag">${platformNames}</span>
                        <span class="detail-tag">${genreName}</span>
                        <span class="detail-tag game-card-status ${statusInfo.class}">${statusInfo.emoji} ${statusInfo.text}</span>
                    </div>
                </div>
            </div>
            <div class="detail-stats">
                <div class="detail-stat">
                    <div class="detail-stat-value">&#9733; ${formatRating(game.rating)}</div>
                    <div class="detail-stat-label">Nota</div>
                </div>
                <div class="detail-stat">
                    <div class="detail-stat-value">${game.hours_played || 0}h</div>
                    <div class="detail-stat-label">Jogadas</div>
                </div>
                <div class="detail-stat">
                    <div class="detail-stat-value">${game.release_date ? new Date(game.release_date).toLocaleDateString('pt-BR') : '-'}</div>
                    <div class="detail-stat-label">Lancamento</div>
                </div>
            </div>
            ${game.description ? `<div class="detail-notes"><h4>&#128221; Descricao</h4><p>${game.description}</p></div>` : ''}
            <div class="detail-actions">
                <button class="btn btn-secondary" onclick="closeDetailModal(); openEditModal(${game.id})">&#9998; Editar</button>
                <button class="btn btn-primary" onclick="closeDetailModal()">Fechar</button>
            </div>
        `;
        elements.detailModalOverlay.classList.add('active');
    } catch (error) {
        showToast('Erro ao carregar detalhes do jogo', 'error');
        console.error(error);
    }
}

function closeDetailModal() {
    elements.detailModalOverlay.classList.remove('active');
}

// ============================================
// MODAL DE PLATAFORMA
// ============================================

function openPlatformModal() {
    elements.platformForm.reset();
    renderPlatformsList();
    elements.platformModalOverlay.classList.add('active');
}

function closePlatformModal() {
    elements.platformModalOverlay.classList.remove('active');
}

function renderPlatformsList() {
    if (state.platforms.length === 0) {
        elements.platformsList.innerHTML = '<div class="accordion-empty">Nenhuma plataforma cadastrada</div>';
        return;
    }
    elements.platformsList.innerHTML = state.platforms.map(p => `
        <div class="accordion-item">
            <div class="accordion-item-info">
                <span class="accordion-item-name">${p.name}</span>
                ${p.manufacturer ? `<span class="accordion-item-desc">${p.manufacturer}</span>` : ''}
            </div>
        </div>
    `).join('');
}

async function handlePlatformSubmit(event) {
    event.preventDefault();
    const data = {
        name: elements.platformName.value.trim(),
        manufacturer: elements.platformManufacturer.value.trim() || null,
    };

    try {
        await api.cadastrarPlataforma(data);
        showToast('Plataforma adicionada com sucesso!', 'success');
        elements.platformForm.reset();
        await loadPlatforms();
        renderPlatformsList();
    } catch (error) {
        showToast(error.message || 'Erro ao adicionar plataforma', 'error');
        console.error(error);
    }
}

// ============================================
// MODAL DE GENERO
// ============================================

function openGenreModal() {
    elements.genreForm.reset();
    renderGenresList();
    elements.genreModalOverlay.classList.add('active');
}

function closeGenreModal() {
    elements.genreModalOverlay.classList.remove('active');
}

function renderGenresList() {
    if (state.genres.length === 0) {
        elements.genresList.innerHTML = '<div class="accordion-empty">Nenhum genero cadastrado</div>';
        return;
    }
    elements.genresList.innerHTML = state.genres.map(g => `
        <div class="accordion-item">
            <div class="accordion-item-info">
                <span class="accordion-item-name">${g.name}</span>
                ${g.description ? `<span class="accordion-item-desc">${g.description}</span>` : ''}
            </div>
        </div>
    `).join('');
}

async function handleGenreSubmit(event) {
    event.preventDefault();
    const data = {
        name: elements.genreName.value.trim(),
        description: elements.genreDescription.value.trim() || null,
    };

    try {
        await api.cadastrarGenero(data);
        showToast('Genero adicionado com sucesso!', 'success');
        elements.genreForm.reset();
        await loadGenres();
        renderGenresList();
    } catch (error) {
        showToast(error.message || 'Erro ao adicionar genero', 'error');
        console.error(error);
    }
}

// ============================================
// ACCORDION
// ============================================

function toggleAccordion(btn, content) {
    btn.classList.toggle('active');
    content.classList.toggle('active');
}

// ============================================
// DELECAO
// ============================================

async function confirmDelete(id) {
    const game = state.games.find(g => g.id === id);
    if (!game) return;

    const confirmed = await showConfirm(
        'Excluir Jogo',
        `Tem certeza que deseja excluir "${game.title}"? Esta acao nao pode ser desfeita.`,
        '&#128465;',
        '&#128465; Excluir'
    );

    if (!confirmed) return;

    try {
        await api.deletarJogo(id);
        showToast('Jogo excluido com sucesso!', 'success');
        await loadGames();
    } catch (error) {
        showToast(error.message || 'Erro ao excluir jogo', 'error');
        console.error(error);
    }
}

// ============================================
// CARREGAMENTO DE DADOS
// ============================================

async function loadPlatforms() {
    try {
        state.platforms = await api.listarPlataformas();
        renderPlatformFilters();
        populatePlatformCheckboxes();
    } catch (error) {
        console.error('Erro ao carregar plataformas:', error);
        state.platforms = [];
    }
}

async function loadGenres() {
    try {
        state.genres = await api.listarGeneros();
        renderGenreFilters();
        populateGenreSelect();
    } catch (error) {
        console.error('Erro ao carregar generos:', error);
        state.genres = [];
    }
}

async function loadGames() {
    try {
        state.isLoading = true;
        elements.loading.style.display = 'flex';
        elements.emptyState.style.display = 'none';
        elements.gamesGrid.innerHTML = '';

        const games = await api.listarJogos();
        state.games = games;
        state.filteredGames = games;

        updateStats();
        applyFilters();
        state.isLoading = false;
    } catch (error) {
        state.isLoading = false;
        elements.loading.style.display = 'none';
        elements.emptyState.style.display = 'flex';
        elements.emptyState.querySelector('h2').textContent = 'Erro ao conectar';
        elements.emptyState.querySelector('p').textContent = 'Verifique se a API esta rodando em ' + API_BASE_URL;
        elements.emptyState.querySelector('.add-game-btn').style.display = 'none';
        showToast('Erro ao carregar jogos. Verifique se a API esta online.', 'error');
        console.error(error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Modal de jogo
    elements.openModalBtn.addEventListener('click', openAddModal);
    elements.emptyAddBtn.addEventListener('click', openAddModal);
    elements.modalClose.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });
    elements.gameForm.addEventListener('submit', handleFormSubmit);

    // Modal de detalhes
    elements.detailModalClose.addEventListener('click', closeDetailModal);
    elements.detailModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.detailModalOverlay) closeDetailModal();
    });

    // Modal de plataforma
    elements.openPlatformModalBtn.addEventListener('click', openPlatformModal);
    elements.platformModalClose.addEventListener('click', closePlatformModal);
    elements.platformModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.platformModalOverlay) closePlatformModal();
    });
    elements.platformForm.addEventListener('submit', handlePlatformSubmit);
    elements.platformsAccordionBtn.addEventListener('click', () => {
        toggleAccordion(elements.platformsAccordionBtn, elements.platformsAccordionContent);
    });

    // Modal de genero
    elements.openGenreModalBtn.addEventListener('click', openGenreModal);
    elements.genreModalClose.addEventListener('click', closeGenreModal);
    elements.genreModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.genreModalOverlay) closeGenreModal();
    });
    elements.genreForm.addEventListener('submit', handleGenreSubmit);
    elements.genresAccordionBtn.addEventListener('click', () => {
        toggleAccordion(elements.genresAccordionBtn, elements.genresAccordionContent);
    });

    // Busca
    elements.searchBtn.addEventListener('click', () => {
        state.searchTerm = elements.searchInput.value;
        applyFilters();
    });
    elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            state.searchTerm = elements.searchInput.value;
            applyFilters();
        }
    });
    let searchTimeout;
    elements.searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.searchTerm = elements.searchInput.value;
            applyFilters();
        }, 300);
    });

    // Filtros de status
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    // Tecla ESC para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.modalOverlay.classList.contains('active')) closeModal();
            if (elements.detailModalOverlay.classList.contains('active')) closeDetailModal();
            if (elements.platformModalOverlay.classList.contains('active')) closePlatformModal();
            if (elements.genreModalOverlay.classList.contains('active')) closeGenreModal();
        }
    });
}

// ============================================
// INICIALIZACAO
// ============================================

async function init() {
    console.log('🎮 GameVault - Inicializando...');
    initEventListeners();
    await Promise.all([loadPlatforms(), loadGenres()]);
    await loadGames();
    console.log('GameVault - Pronto!');
}

document.addEventListener('DOMContentLoaded', init);
