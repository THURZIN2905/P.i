document.addEventListener('DOMContentLoaded', () => {
    const sections = {
        intro: document.getElementById('intro-section'),
        questionnaire: document.getElementById('questionnaire-section'),
        results: document.getElementById('results-section')
    };
    
    const buttons = {
        startTest: document.getElementById('start-test'),
        submitTest: document.getElementById('submit-test'),
        restartTest: document.getElementById('restart-test'),
        themeToggle: document.getElementById('theme-toggle'),
        vlibrasToggle: document.getElementById('vlibras-toggle')
    };
    
    const elements = {
        questionsContainer: document.getElementById('questions-container'),
        nameInput: document.getElementById('participant-name'),
        resultsName: document.getElementById('results-name'),
        resultsDate: document.getElementById('results-date'),
        resultsChart: document.getElementById('results-chart'),
        scoresList: document.getElementById('scores-list'),
        loader: document.getElementById('loader')
    };
    
    let currentQuestionIndex = 0;
    let allQuestions = [];
    let allAreas = [];
    
    const showSection = (sectionId) => {
        Object.keys(sections).forEach(key => {
            sections[key].classList.add('hidden');
        });
        sections[sectionId].classList.remove('hidden');
        window.scrollTo(0, 0);
    };
    
    const showLoader = () => {
        elements.loader.style.display = 'flex';
    };
    
    const hideLoader = () => {
        elements.loader.style.display = 'none';
    };
    
    const loadQuestions = async () => {
        try {
            showLoader();
            const response = await fetch('/perguntas');
            const data = await response.json();
            
            allQuestions = data.perguntas;
            allAreas = data.areas;
            
            renderQuestions();
            hideLoader();
        } catch (error) {
            console.error('Erro ao carregar perguntas:', error);
            alert('Erro ao carregar as perguntas. Por favor, tente novamente.');
            hideLoader();
        }
    };
    
    const renderQuestions = () => {
        elements.questionsContainer.innerHTML = '';
        
        allQuestions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.setAttribute('data-question-id', question.id);
            
            const questionText = document.createElement('div');
            questionText.className = 'question-text';
            questionText.textContent = `${index + 1}. ${question.texto}`;
            
            const ratingDiv = document.createElement('div');
            ratingDiv.className = 'rating';
            
            const ratingOptions = [
                { value: 1, text: 'Discordo totalmente' },
                { value: 2, text: 'Discordo parcialmente' },
                { value: 3, text: 'Neutro' },
                { value: 4, text: 'Concordo parcialmente' },
                { value: 5, text: 'Concordo totalmente' }
            ];
            
            ratingOptions.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'rating-option';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `question-${question.id}`;
                input.id = `question-${question.id}-option-${option.value}`;
                input.className = 'rating-input';
                input.value = option.value;
                input.setAttribute('aria-label', `${option.text} para a pergunta ${index + 1}`);
                
                const label = document.createElement('label');
                label.htmlFor = `question-${question.id}-option-${option.value}`;
                label.className = 'rating-label';
                label.textContent = option.value;
                
                const optionText = document.createElement('div');
                optionText.className = 'rating-text';
                optionText.textContent = option.text;
                
                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                optionDiv.appendChild(optionText);
                ratingDiv.appendChild(optionDiv);
            });
            
            questionDiv.appendChild(questionText);
            questionDiv.appendChild(ratingDiv);
            elements.questionsContainer.appendChild(questionDiv);
        });
    };
    
    const collectAnswers = () => {
        const answers = {};
        const questionItems = document.querySelectorAll('.question-item');
        
        let allAnswered = true;
        
        questionItems.forEach(item => {
            const questionId = parseInt(item.getAttribute('data-question-id'));
            const selectedOption = item.querySelector('input[type="radio"]:checked');
            
            if (selectedOption) {
                answers[questionId] = parseInt(selectedOption.value);
            } else {
                allAnswered = false;
                item.classList.add('error');
                setTimeout(() => item.classList.remove('error'), 3000);
            }
        });
        
        return allAnswered ? answers : null;
    };
    
    const submitAnswers = async () => {
        const name = elements.nameInput.value.trim();
        if (!name) {
            elements.nameInput.classList.add('error');
            setTimeout(() => elements.nameInput.classList.remove('error'), 3000);
            alert('Por favor, informe seu nome.');
            return;
        }
        
        const answers = collectAnswers();
        if (!answers) {
            alert('Por favor, responda todas as perguntas.');
            return;
        }
        
        try {
            showLoader();
            
            const response = await fetch('/responder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: name,
                    respostas: answers
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            displayResults(result);
            hideLoader();
            showSection('results');
        } catch (error) {
            console.error('Erro ao enviar respostas:', error);
            alert('Erro ao processar suas respostas. Por favor, tente novamente.');
            hideLoader();
        }
    };
    
    const displayResults = (result) => {
        elements.resultsName.textContent = result.nome;
        
        const date = new Date(result.data);
        elements.resultsDate.textContent = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        elements.resultsChart.src = `data:image/png;base64,${result.grafico_base64}`;
        elements.resultsChart.alt = `Gráfico de resultados para ${result.nome}`;
        
        elements.scoresList.innerHTML = '';
        
        const sortedScores = Object.entries(result.pontuacoes)
            .sort((a, b) => b[1] - a[1]);
        
        sortedScores.forEach(([areaId, score]) => {
            const area = allAreas.find(a => a.id === areaId);
            if (!area) return;
            
            const li = document.createElement('li');
            li.className = 'score-item';
            
            const areaSpan = document.createElement('span');
            areaSpan.className = 'score-area';
            areaSpan.textContent = area.nome;
            areaSpan.style.setProperty('--area-color', area.cor);
            
            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'score-value';
            scoreSpan.textContent = `${score.toFixed(1)}%`;
            scoreSpan.style.color = area.cor;
            
            li.appendChild(areaSpan);
            li.appendChild(scoreSpan);
            elements.scoresList.appendChild(li);
        });
    };
    
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        const themeIcon = buttons.themeToggle.querySelector('i');
        if (isDarkMode) {
            themeIcon.className = 'fas fa-sun';
            buttons.themeToggle.setAttribute('aria-label', 'Mudar para modo claro');
        } else {
            themeIcon.className = 'fas fa-moon';
            buttons.themeToggle.setAttribute('aria-label', 'Mudar para modo escuro');
        }
        
        updateChartTheme();
    };
    
    const updateChartTheme = () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        if (window.myChart) {
            window.myChart.options.plugins.legend.labels.color = isDarkMode ? '#e0e0e0' : '#212529';
            window.myChart.options.plugins.title.color = isDarkMode ? '#e0e0e0' : '#212529';
            window.myChart.update();
        }
    };
    
    const initTheme = () => {
        const savedTheme = localStorage.getItem('darkMode');
        
        if (savedTheme === 'true') {
            document.body.classList.add('dark-mode');
            const themeIcon = buttons.themeToggle.querySelector('i');
            themeIcon.className = 'fas fa-sun';
            buttons.themeToggle.setAttribute('aria-label', 'Mudar para modo claro');
        }
    };
    
    const initVLibras = () => {
        const script = document.createElement('script');
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.onload = () => {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
        };
        document.head.appendChild(script);
    };
    
    const toggleVLibras = () => {
        if (window.VLibras) {
            const widget = window.VLibras.Widget;
            
            if (widget.isActive) {
                widget.hide();
            } else {
                widget.show();
            }
        }
    };
    
    buttons.startTest.addEventListener('click', () => {
        showSection('questionnaire');
    });
    
    buttons.submitTest.addEventListener('click', (e) => {
        e.preventDefault();
        submitAnswers();
    });
    
    buttons.restartTest.addEventListener('click', () => {
        elements.nameInput.value = '';
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => input.checked = false);
        showSection('intro');
    });
    
    buttons.themeToggle.addEventListener('click', toggleTheme);
    buttons.vlibrasToggle.addEventListener('click', toggleVLibras);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!sections.intro.classList.contains('hidden')) {
                return;
            } else if (!sections.questionnaire.classList.contains('hidden')) {
                showSection('intro');
            } else if (!sections.results.classList.contains('hidden')) {
                showSection('questionnaire');
            }
        }
    });
    
    initTheme();
    initVLibras();
    loadQuestions();
});

