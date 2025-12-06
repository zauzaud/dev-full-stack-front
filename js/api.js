/**
 * GameVault - API Service
 * Modulo responsavel por todas as comunicacoes com a API do back-end
 *
 * Rotas implementadas:
 * - POST   /games          -> Cadastrar novo jogo
 * - GET    /games          -> Listar todos os jogos
 * - GET    /games/{id}     -> Buscar jogo por ID
 * - PUT    /games/{id}     -> Atualizar jogo existente
 * - DELETE /games/{id}     -> Deletar jogo
 * - GET    /platforms      -> Listar plataformas
 * - POST   /platforms      -> Cadastrar plataforma
 * - GET    /genres         -> Listar generos
 * - POST   /genres         -> Cadastrar genero
 */

// Configuracao da URL base da API
// Altere esta URL para apontar para seu servidor back-end
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Classe responsavel por gerenciar todas as requisicoes a API
 */
class GameAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Metodo auxiliar para fazer requisicoes HTTP
     * @param {string} endpoint - Endpoint da API
     * @param {object} options - Opcoes da requisicao (method, headers, body)
     * @returns {Promise} - Resposta da API
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Erro HTTP: ${response.status}`);
            }

            // Tenta parsear como JSON, se falhar retorna resposta vazia
            const data = await response.json().catch(() => ({}));
            return data;

        } catch (error) {
            // Se for erro de rede (API offline)
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Nao foi possivel conectar a API. Verifique se o servidor esta rodando.');
            }
            throw error;
        }
    }

    // ============================================
    // ROTAS DE JOGOS
    // ============================================

    /**
     * ROTA 1: GET /games
     * Lista todos os jogos cadastrados
     * @param {string} status - Filtrar por status (opcional)
     * @param {number} genreId - Filtrar por genero (opcional)
     * @returns {Promise<Array>} - Lista de jogos
     */
    async listarJogos(status = null, genreId = null) {
        console.log('[API] GET /games - Listando todos os jogos');
        let endpoint = '/games';
        const params = [];

        if (status) params.push(`status=${status}`);
        if (genreId) params.push(`genre_id=${genreId}`);
        if (params.length > 0) endpoint += '?' + params.join('&');

        const response = await this.request(endpoint);
        // A API retorna { games: [...] }
        return response.games || response;
    }

    /**
     * ROTA 2: GET /games/{id}
     * Busca um jogo especifico pelo ID
     * @param {number} id - ID do jogo
     * @returns {Promise<Object>} - Dados do jogo
     */
    async buscarJogo(id) {
        console.log(`[API] GET /games/${id} - Buscando jogo`);
        return await this.request(`/games/${id}`);
    }

    /**
     * ROTA 3: POST /games
     * Cadastra um novo jogo
     * @param {Object} dadosJogo - Dados do jogo a ser cadastrado
     * @returns {Promise<Object>} - Jogo cadastrado
     */
    async cadastrarJogo(dadosJogo) {
        console.log('[API] POST /games - Cadastrando novo jogo', dadosJogo);
        return await this.request('/games', {
            method: 'POST',
            body: JSON.stringify(dadosJogo),
        });
    }

    /**
     * ROTA 4: PATCH /games/{id}
     * Atualiza um jogo existente
     * @param {number} id - ID do jogo
     * @param {Object} dadosJogo - Novos dados do jogo
     * @returns {Promise<Object>} - Jogo atualizado
     */
    async atualizarJogo(id, dadosJogo) {
        console.log(`[API] PATCH /games/${id} - Atualizando jogo`, dadosJogo);
        return await this.request(`/games/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dadosJogo),
        });
    }

    /**
     * ROTA 5: DELETE /games/{id}
     * Remove um jogo do sistema
     * @param {number} id - ID do jogo a ser removido
     * @returns {Promise<Object>} - Confirmacao da remocao
     */
    async deletarJogo(id) {
        console.log(`[API] DELETE /games/${id} - Deletando jogo`);
        return await this.request(`/games/${id}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // ROTAS DE PLATAFORMAS
    // ============================================

    /**
     * ROTA 6: GET /platforms
     * Lista todas as plataformas cadastradas
     * @returns {Promise<Array>} - Lista de plataformas
     */
    async listarPlataformas() {
        console.log('[API] GET /platforms - Listando plataformas');
        const response = await this.request('/platforms');
        return response.platforms || response;
    }

    /**
     * ROTA 7: POST /platforms
     * Cadastra uma nova plataforma
     * @param {Object} dados - Dados da plataforma {name, manufacturer}
     * @returns {Promise<Object>} - Plataforma cadastrada
     */
    async cadastrarPlataforma(dados) {
        console.log('[API] POST /platforms - Cadastrando plataforma', dados);
        return await this.request('/platforms', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    // ============================================
    // ROTAS DE GENEROS
    // ============================================

    /**
     * ROTA 8: GET /genres
     * Lista todos os generos cadastrados
     * @returns {Promise<Array>} - Lista de generos
     */
    async listarGeneros() {
        console.log('[API] GET /genres - Listando generos');
        const response = await this.request('/genres');
        return response.genres || response;
    }

    /**
     * ROTA 9: POST /genres
     * Cadastra um novo genero
     * @param {Object} dados - Dados do genero {name, description}
     * @returns {Promise<Object>} - Genero cadastrado
     */
    async cadastrarGenero(dados) {
        console.log('[API] POST /genres - Cadastrando genero', dados);
        return await this.request('/genres', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    // ============================================
    // METODOS AUXILIARES
    // ============================================

    /**
     * Busca jogos com filtro por nome (client-side)
     * @param {string} termo - Termo de busca
     * @returns {Promise<Array>} - Jogos que correspondem a busca
     */
    async buscarJogosPorNome(termo) {
        console.log(`[API] Buscando jogos com termo: "${termo}"`);
        const todosJogos = await this.listarJogos();

        if (!termo || termo.trim() === '') {
            return todosJogos;
        }

        const termoLower = termo.toLowerCase().trim();
        return todosJogos.filter(jogo =>
            jogo.title.toLowerCase().includes(termoLower) ||
            (jogo.genre && jogo.genre.name && jogo.genre.name.toLowerCase().includes(termoLower)) ||
            (jogo.platforms && jogo.platforms.some(p => p.name.toLowerCase().includes(termoLower)))
        );
    }
}

// Instancia global da API
const api = new GameAPI(API_BASE_URL);
