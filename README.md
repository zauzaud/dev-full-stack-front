# GameVault - Frontend

**GameVault** e uma Single Page Application (SPA) para gerenciamento de colecao pessoal de jogos. O sistema permite catalogar jogos que voce ja jogou, esta jogando ou pretende jogar, com informacoes detalhadas como plataforma, genero, nota pessoal e horas jogadas.

## Objetivo

O projeto resolve o problema de organizacao da biblioteca pessoal de games. Muitos jogadores possuem dezenas ou centenas de jogos em diferentes plataformas e perdem o controle do que ja jogaram, zeraram ou abandonaram. O GameVault oferece uma interface visual e intuitiva para:

- Catalogar jogos com informacoes detalhadas
- Acompanhar o status de cada jogo (jogando, zerado, backlog, abandonado)
- Visualizar estatisticas da colecao
- Filtrar e buscar jogos rapidamente

## Tecnologias Utilizadas

- **HTML5** - Estrutura semantica da aplicacao
- **CSS3** - Estilizacao customizada com tema dark/gaming
- **JavaScript (ES6+)** - Logica da aplicacao e comunicacao com API
- **Google Fonts** - Tipografia (Orbitron e Rajdhani)

## Funcionalidades

- Listagem de jogos em cards visuais
- Cadastro de novos jogos
- Edicao de jogos existentes
- Exclusao de jogos
- Busca por nome, genero ou plataforma
- Filtros por status (Jogando, Zerado, Backlog, Abandonado)
- Filtros por plataforma (carregadas dinamicamente da API)
- Filtros por genero (carregados dinamicamente da API)
- Visualizacao detalhada de cada jogo
- Estatisticas em tempo real (total, zerados, jogando)
- Notificacoes toast para feedback de acoes
- Design responsivo para diferentes dispositivos

## Rotas da API Consumidas

O frontend consome as seguintes rotas da API:

### Games (Jogos)

| Metodo | Rota                             | Descricao                        |
| ------ | -------------------------------- | -------------------------------- |
| GET    | `/games`                         | Lista todos os jogos cadastrados |
| GET    | `/games?status=...&genre_id=...` | Lista jogos com filtros          |
| GET    | `/games/{id}`                    | Busca um jogo especifico pelo ID |
| POST   | `/games`                         | Cadastra um novo jogo            |
| PUT    | `/games/{id}`                    | Atualiza um jogo existente       |
| DELETE | `/games/{id}`                    | Remove um jogo do sistema        |

### Platforms (Plataformas)

| Metodo | Rota         | Descricao                  |
| ------ | ------------ | -------------------------- |
| GET    | `/platforms` | Lista todas as plataformas |
| POST   | `/platforms` | Cadastra nova plataforma   |

### Genres (Generos)

| Metodo | Rota      | Descricao              |
| ------ | --------- | ---------------------- |
| GET    | `/genres` | Lista todos os generos |
| POST   | `/genres` | Cadastra novo genero   |

## Estrutura do Projeto

```
dev-full-stack-front/
├── index.html          # Pagina principal da SPA
├── css/
│   └── styles.css      # Estilos customizados
├── js/
│   ├── api.js          # Modulo de comunicacao com a API
│   └── app.js          # Logica principal da aplicacao
├── assets/             # Recursos estaticos (imagens, icones)
└── README.md           # Documentacao do projeto
```

## Instalacao e Execucao

### Pre-requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- API backend rodando (ver repositorio do back-end)

### Passos para Execucao

1. **Clone o repositorio**

   ```bash
   git clone https://github.com/seu-usuario/dev-full-stack-front.git
   cd dev-full-stack-front
   ```

2. **Configure a URL da API**

   Abra o arquivo `js/api.js` e verifique se a constante `API_BASE_URL` aponta para o endereco correto da sua API:

   ```javascript
   const API_BASE_URL = "http://127.0.0.1:5000";
   ```

3. **Inicie a API backend**

   Certifique-se de que o servidor Flask esta rodando. Consulte o README do repositorio do back-end para instrucoes.

4. **Abra o arquivo index.html**

   Basta abrir o arquivo `index.html` diretamente no navegador:

   - **Windows:** De duplo clique no arquivo `index.html`
   - **Linux/Mac:** Execute `open index.html` ou `xdg-open index.html`
   - Ou arraste o arquivo para uma janela do navegador

   > **Nota:** Nao e necessario servidor local, extensoes ou configuracoes adicionais. O frontend funciona diretamente ao abrir o arquivo HTML.

## Configuracao de CORS

Para que o frontend consiga se comunicar com a API, e necessario que o backend tenha CORS habilitado. No Flask, adicione:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

## Capturas de Tela

### Tela Principal

Interface principal mostrando a colecao de jogos em cards com filtros laterais e estatisticas no header.

### Modal de Cadastro

Formulario para adicionar ou editar jogos com campos para titulo, plataforma, genero, status, nota, horas jogadas e descricao.

### Visualizacao Detalhada

Modal com informacoes completas do jogo selecionado, incluindo imagem de capa, estatisticas e descricao.

## Design

O projeto utiliza um tema **dark gaming** com:

- Paleta de cores escuras com acentos neon (roxo, azul, rosa)
- Tipografia gaming (Orbitron para titulos, Rajdhani para texto)
- Efeitos de hover com glow
- Animacoes suaves
- Cards com gradientes e bordas iluminadas
- Layout responsivo com grid adaptativo

## Autor

Desenvolvido com <3 para o MVP da disciplina de Desenvolvimento Full Stack Basico - PUC-Rio.

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
