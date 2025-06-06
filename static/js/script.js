/**
 * Orientador Vocacional SENAC - Script principal
 * 
 * Este script gerencia a interação do usuário com o questionário vocacional,
 * incluindo carregamento de perguntas, envio de respostas e exibição de resultados.
 */

// Configurações
const API_URL = window.location.origin;
const ADMIN_TOKEN = 'senac-admin-token-2023'; // Apenas para fins de demonstração

// Cache de elementos DOM
const elements = {
    // Seções
    intro: document.getElementById('intro'),
    questionnaire: document.getElementById('questionnaire'),
    results: document.getElementById('results'),
    
    // Botões de navegação
    startTest: document.getElementById('startTest'),
    startTestIntro: document.getElementById('startTestIntro'),
    newTest: document.getElementById('newTest'),
    downloadResult: document.getElementById('downloadResult'),
    
    // Formulário e contêineres
    questionForm: document.getElementById('questionForm'),
    questionsContainer: document.getElementById('questions-container'),
    
    // Resultados
    resultName: document.getElementById('resultName'),
    resultDate: document.getElementById('resultDate'),
    resultChart: document.getElementById('resultChart'),
    scoresList: document.getElementById('scoresList'),
    
    // Loader e tema
    loader: document.getElementById('loader'),
    themeToggle: document.getElementById('themeToggle'),
    vlibrasToggle: document.getElementById('vlibrasToggle')
};

// Estado da aplicação
let state = {
    questions: [],
    areas: [],
    currentResult: null,
    darkMode: localStorage.getItem('darkMode') === 'true'
};

/**
 * Inicializa a aplicação
 */
function init() {
    // Configurar manipuladores de eventos
    setupEventListeners();
    
    // Verificar e aplicar tema salvo
    applyTheme();
    
    // Carregar perguntas da API
    loadQuestions();
}

/**
 * Configura os ouvintes de eventos para interações do usuário
 */
function setupEventListeners() {
    // Botões de navegação
    elements.startTest.addEventListener('click', showQuestionnaire);
    elements.startTestIntro.addEventListener('click', showQuestionnaire);
    elements.newTest.addEventListener('click', resetTest);
    elements.downloadResult.addEventListener('click', downloadResult);
    
    // Formulário
    elements.questionForm.addEventListener('submit', handleFormSubmit);
    
    // Tema
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // VLibras
    elements.vlibrasToggle.addEventListener('click', toggleVLibras);
    
    // Navegação por teclado
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/**
 * Carrega as perguntas da API
 */
async function loadQuestions() {
    try {
        showLoader();
        
        const response = await fetch(`${API_URL}/perguntas`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar perguntas: ${response.status}`);
        }
        
        const data = await response.json();
        
        state.questions = data.perguntas;
        state.areas = data.areas;
        
        // Preparar o formulário com as perguntas
        renderQuestions();
        
        hideLoader();
    } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
        hideLoader();
        showError('Não foi possível carregar as perguntas. Por favor, tente novamente mais tarde.');
    }
}

/**
 * Renderiza as perguntas no formulário
 */
function renderQuestions() {
    elements.questionsContainer.innerHTML = '';
    
    state.questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question-item';
        questionElement.setAttribute('role', 'group');
        questionElement.setAttribute('aria-labelledby', `question-${question.id}`);
        
        const questionText = document.createElement('p');
        questionText.className = 'question-text';
        questionText.id = `question-${question.id}`;
        questionText.textContent = question.texto;
        
        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'rating';
        
        // Criar opções de 1 a 5
        const ratingLabels = [
            'Discordo totalmente',
            'Discordo parcialmente',
            'Neutro',
            'Concordo parcialmente',
            'Concordo totalmente'
        ];
        
        for (let i = 1; i <= 5; i++) {
            const optionContainer = document.createElement('div');
            optionContainer.className = 'rating-option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${question.id}`;
            input.id = `question-${question.id}-rating-${i}`;
            input.className = 'rating-input';
            input.value = i;
            input.required = true;
            input.setAttribute('aria-label', `${ratingLabels[i-1]} para a pergunta ${question.id}`);
            
            const label = document.createElement('label');
            label.htmlFor = `question-${question.id}-rating-${i}`;
            label.className = 'rating-label';
            label.textContent = i;
            
            const ratingText = document.createElement('span');
            ratingText.className = 'rating-text';
            ratingText.textContent = ratingLabels[i-1];
            
            optionContainer.appendChild(input);
            optionContainer.appendChild(label);
            optionContainer.appendChild(ratingText);
            ratingContainer.appendChild(optionContainer);
        }
        
        questionElement.appendChild(questionText);
        questionElement.appendChild(ratingContainer);
        elements.questionsContainer.appendChild(questionElement);
    });
}

/**
 * Manipula o envio do formulário
 * @param {Event} event - Evento de envio do formulário
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        showLoader();
        
        const formData = new FormData(elements.questionForm);
        const nome = formData.get('nome');
        
        if (!nome || nome.trim() === '') {
            throw new Error('Por favor, informe seu nome.');
        }
        
        // Coletar respostas
        const respostas = {};
        
        state.questions.forEach(question => {
            const value = formData.get(`question-${question.id}`);
            
            if (!value) {
                throw new Error(`Por favor, responda a pergunta ${question.id}.`);
            }
            
            respostas[question.id] = parseInt(value);
        });
        
        // Enviar para a API
        const response = await fetch(`${API_URL}/responder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                respostas: respostas
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao enviar respostas: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Salvar resultado atual
        state.currentResult = result;
        
        // Mostrar resultados
        showResults(result);
        
        hideLoader();
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        hideLoader();
        showError(error.message || 'Ocorreu um erro ao processar suas respostas. Por favor, tente novamente.');
    }
}

/**
 * Exibe a seção de questionário
 */
function showQuestionnaire() {
    elements.intro.classList.add('hidden');
    elements.results.classList.add('hidden');
    elements.questionnaire.classList.remove('hidden');
    
    // Scroll para o topo do questionário
    elements.questionnaire.scrollIntoView({ behavior: 'smooth' });
    
    // Foco no campo de nome
    document.getElementById('nome').focus();
}

/**
 * Exibe a seção de resultados
 * @param {Object} result - Resultado do questionário
 */
function showResults(result) {
    elements.questionnaire.classList.add('hidden');
    elements.results.classList.remove('hidden');
    
    // Preencher dados do resultado
    elements.resultName.textContent = result.nome;
    elements.resultDate.textContent = new Date(result.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Exibir gráfico
    elements.resultChart.src = `data:image/png;base64,${result.grafico_base64}`;
    elements.resultChart.alt = `Gráfico de resultados de ${result.nome}`;
    
    // Preencher pontuações
    elements.scoresList.innerHTML = '';
    
    // Ordenar pontuações do maior para o menor
    const sortedScores = Object.entries(result.pontuacoes)
        .sort((a, b) => b[1] - a[1]);
    
    sortedScores.forEach(([areaId, score]) => {
        const area = state.areas.find(a => a.id === areaId);
        
        if (!area) return;
        
        const scoreItem = document.createElement('li');
        scoreItem.className = 'score-item';
        
        const areaName = document.createElement('span');
        areaName.className = 'score-area';
        areaName.textContent = area.nome;
        
        const scoreValue = document.createElement('span');
        scoreValue.className = 'score-value';
        scoreValue.textContent = `${score.toFixed(1)}%`;
        scoreValue.style.color = area.cor;
        
        scoreItem.appendChild(areaName);
        scoreItem.appendChild(scoreValue);
        elements.scoresList.appendChild(scoreItem);
    });
    
    // Scroll para o topo dos resultados
    elements.results.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Reinicia o teste
 */
function resetTest() {
    elements.questionForm.reset();
    elements.results.classList.add('hidden');
    elements.questionnaire.classList.remove('hidden');
    
    // Scroll para o topo do questionário
    elements.questionnaire.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Baixa o resultado como imagem
 */
function downloadResult() {
    if (!state.currentResult) return;
    
    // Criar um link para download da imagem
    const link = document.createElement('a');
    link.href = elements.resultChart.src;
    link.download = `resultado-vocacional-${state.currentResult.nome.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Alterna entre os temas claro e escuro
 */
function toggleTheme() {
    state.darkMode = !state.darkMode;
    localStorage.setItem('darkMode', state.darkMode);
    applyTheme();
}

/**
 * Aplica o tema atual (claro ou escuro)
 */
function applyTheme() {
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        elements.themeToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;
    } else {
        document.body.classList.remove('dark-mode');
        elements.themeToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;
    }
}

/**
 * Alterna a visibilidade do VLibras
 */
function toggleVLibras() {
    const vw = document.querySelector('.enabled');
    
    if (vw) {
        vw.classList.toggle('active');
    }
}

/**
 * Manipula a navegação por teclado
 * @param {KeyboardEvent} event - Evento de teclado
 */
function handleKeyboardNavigation(event) {
    // Implementar navegação por teclado se necessário
}

/**
 * Exibe o loader
 */
function showLoader() {
    elements.loader.style.display = 'flex';
}

/**
 * Oculta o loader
 */
function hideLoader() {
    elements.loader.style.display = 'none';
}

/**
 * Exibe uma mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    alert(message);
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

