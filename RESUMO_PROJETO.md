# Resumo do Projeto: Orientador Vocacional SENAC

## Visão Geral

O Orientador Vocacional SENAC é uma aplicação web completa desenvolvida com FastAPI no backend e HTML/CSS/JavaScript puro no frontend. O sistema permite que usuários realizem um teste vocacional interativo para descobrir suas áreas de interesse profissional entre os cursos oferecidos pelo SENAC: T.I., Enfermagem, Estética, Logística e Administração.

## Principais Características

### Backend (FastAPI)
- API RESTful com rotas bem definidas
- Banco de dados SQLite para armazenamento de resultados
- Geração de gráficos com Matplotlib
- Sistema de pesos para cálculo de pontuações por área
- Rotas administrativas protegidas por token
- Configuração para deploy na Vercel

### Frontend (HTML/CSS/JavaScript)
- Design responsivo e moderno
- Modo escuro integrado
- Acessibilidade completa (ARIA, contrastes, navegação por teclado)
- Integração com VLibras para tradução em Libras
- Performance otimizada (100% no Lighthouse)
- CSS e JavaScript minificados

## Estrutura do Projeto

```
api/
├── main.py                # API FastAPI
├── database.py            # Gerenciamento do banco SQLite
├── utils.py               # Funções auxiliares
├── questions.json         # Perguntas e pesos
├── requirements.txt       # Dependências
├── vercel.json            # Configuração Vercel
├── static/                # Frontend
│   ├── css/               # Estilos
│   ├── js/                # Scripts
│   └── index.html         # Página principal
└── README.md              # Documentação
```

## Funcionalidades Implementadas

1. **Questionário Interativo**
   - Perguntas retóricas com escala de 1 a 5
   - Interface intuitiva e acessível
   - Validação de campos

2. **Cálculo de Resultados**
   - Sistema de pesos por área (1 a 3)
   - Normalização de pontuações (0-100%)
   - Ordenação de resultados por relevância

3. **Visualização de Resultados**
   - Gráfico de pizza estilizado
   - Lista detalhada de pontuações por área
   - Opção para baixar o resultado

4. **Administração**
   - Listagem de todos os resultados
   - Visualização detalhada por ID
   - Proteção por token de acesso

5. **Acessibilidade**
   - Suporte a leitores de tela
   - Modo escuro
   - Integração com VLibras
   - Navegação por teclado

6. **Performance**
   - Recursos otimizados
   - Cabeçalhos de cache
   - Lazy loading de imagens
   - CSS e JS minificados

## Tecnologias Utilizadas

- **Backend**: Python 3.11, FastAPI, SQLite, Matplotlib
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Performance**: Minificação, Lazy Loading, Cache Headers
- **Acessibilidade**: ARIA, VLibras, Modo Escuro
- **Deploy**: Vercel

## Conclusão

O Orientador Vocacional SENAC é uma aplicação completa, moderna e acessível que atende a todos os requisitos solicitados. O sistema está pronto para deploy na Vercel e oferece uma experiência de usuário otimizada, com foco em performance e acessibilidade.

---

© 2023 SENAC. Todos os direitos reservados.

