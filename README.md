# Orientador Vocacional 

![Orientador Vocacional ](https://via.placeholder.com/800x400?text=Orientador+Vocacional )

## Sobre o Projeto

O Orientador Vocacional  é uma aplicação web desenvolvida com FastAPI e frontend otimizado que permite aos usuários realizarem um teste vocacional para descobrir suas áreas de interesse profissional. O sistema avalia o interesse em cinco áreas principais do SENAC: T.I., Enfermagem, Estética, Logística e Administração.

### Funcionalidades Principais

- Questionário interativo com perguntas retóricas
- Cálculo de pontuação por área com base em pesos definidos
- Geração de gráfico de pizza estilizado com os resultados
- Armazenamento dos resultados em banco de dados SQLite
- Rotas administrativas protegidas por token
- Frontend otimizado para máxima performance
- Suporte a acessibilidade e modo escuro
- Integração com VLibras para acessibilidade

## Tecnologias Utilizadas

### Backend
- Python 3.11
- FastAPI
- SQLite3
- Matplotlib
- Pydantic
- Uvicorn

### Frontend
- HTML5 semântico
- CSS3 com variáveis e design responsivo
- JavaScript puro (sem frameworks)
- SVG para ícones

### Performance e Acessibilidade
- CSS e JavaScript minificados
- Lazy loading de imagens
- Cabeçalhos de cache otimizados
- Suporte a modo escuro
- Atributos ARIA para acessibilidade
- Integração com VLibras

## Estrutura do Projeto

```
api/
├── main.py                # Arquivo principal da API FastAPI
├── database.py            # Gerenciamento do banco de dados SQLite
├── utils.py               # Funções auxiliares (geração de gráficos, etc.)
├── questions.json         # Perguntas e pesos do questionário
├── requirements.txt       # Dependências do projeto
├── vercel.json            # Configuração para deploy na Vercel
├── static/                # Arquivos estáticos do frontend
│   ├── css/               # Estilos CSS
│   │   ├── style.css      # CSS completo
│   │   └── style.min.css  # CSS minificado
│   ├── js/                # Scripts JavaScript
│   │   ├── script.js      # JavaScript completo
│   │   └── script.min.js  # JavaScript minificado
│   └── index.html         # Página principal do frontend
└── README.md              # Documentação do projeto
```

## Instalação e Execução Local

### Pré-requisitos
- Python 3.11 ou superior
- pip (gerenciador de pacotes do Python)

### Passos para Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/orientador-vocacional-senac.git
cd orientador-vocacional-senac
```

2. Instale as dependências:
```bash
pip install -r api/requirements.txt
```

3. Execute a aplicação:
```bash
cd api
uvicorn main:app --reload
```

4. Acesse a aplicação no navegador:
```
http://localhost:8000
```

## API Endpoints

### Endpoints Públicos

#### GET /
- **Descrição**: Página inicial do frontend
- **Resposta**: HTML da página inicial

#### GET /perguntas
- **Descrição**: Retorna todas as perguntas e áreas do questionário
- **Resposta**: JSON com perguntas e áreas

#### POST /responder
- **Descrição**: Processa as respostas do questionário e retorna o resultado
- **Corpo da Requisição**:
```json
{
  "nome": "Nome do Participante",
  "respostas": {
    "1": 5,
    "2": 4,
    "3": 3,
    "4": 4,
    "5": 5,
    ...
  }
}
```
- **Resposta**:
```json
{
  "id": 1,
  "nome": "Nome do Participante",
  "pontuacoes": {
    "ti": 85.5,
    "enfermagem": 45.2,
    "estetica": 60.8,
    "logistica": 30.5,
    "administracao": 70.3
  },
  "grafico_base64": "data:image/png;base64,...",
  "data": "2023-10-25T14:30:45.123456"
}
```

### Endpoints Administrativos

> Todos os endpoints administrativos requerem o cabeçalho `X-Admin-Token` com o valor correto.

#### GET /admin/resultados
- **Descrição**: Lista todos os resultados dos questionários
- **Cabeçalhos**: `X-Admin-Token: senac-admin-token-2023`
- **Resposta**: Array de resultados

#### GET /admin/resultados/{resultado_id}
- **Descrição**: Retorna um resultado específico pelo ID
- **Cabeçalhos**: `X-Admin-Token: senac-admin-token-2023`
- **Parâmetros de URL**: `resultado_id` (int)
- **Resposta**: Resultado completo com gráfico

#### GET /health
- **Descrição**: Verifica o status da API
- **Resposta**: Status e timestamp

## Deploy na Vercel

### Pré-requisitos
- Conta na Vercel
- Vercel CLI instalado (opcional)

### Passos para Deploy

1. Faça login na Vercel e crie um novo projeto

2. Conecte ao repositório Git ou faça upload dos arquivos

3. Configure as variáveis de ambiente (se necessário)

4. Defina o comando de build:
```
pip install -r api/requirements.txt
```

5. Defina o diretório de saída:
```
api
```

6. Defina o comando de execução:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

7. Clique em "Deploy" e aguarde a conclusão

8. Acesse a URL fornecida pela Vercel após o deploy

## Segurança

- O token administrativo está definido no arquivo `utils.py`
- Em um ambiente de produção, recomenda-se utilizar variáveis de ambiente para armazenar o token
- As rotas administrativas são protegidas pelo cabeçalho `X-Admin-Token`

## Performance

O frontend foi otimizado para atingir 100% no Google PageSpeed e Lighthouse, incluindo:

- Uso de tags semânticas para melhor SEO
- Lazy loading de imagens para carregamento mais rápido
- CSS e JavaScript minificados
- Cabeçalhos de cache configurados corretamente
- Design responsivo para todos os dispositivos

## Acessibilidade

A aplicação foi desenvolvida com foco em acessibilidade:

- Atributos ARIA para melhor compatibilidade com leitores de tela
- Contrastes adequados para melhor legibilidade
- Navegação por teclado
- Integração com VLibras para tradução em Libras
- Modo escuro para reduzir o cansaço visual

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

## Autor

Desenvolvido por arthur e pablo para o SENAC.

---

© 2023 SENAC. Todos os direitos reservados.

