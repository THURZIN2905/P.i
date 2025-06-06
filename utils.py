import json
import base64
import io
from typing import Dict, List, Any
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Usar backend não interativo

# Configurações para melhorar a aparência dos gráficos
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.facecolor'] = '#f8f9fa'
plt.rcParams['figure.facecolor'] = '#ffffff'
plt.rcParams['text.color'] = '#212529'
plt.rcParams['axes.labelcolor'] = '#495057'
plt.rcParams['xtick.color'] = '#6c757d'
plt.rcParams['ytick.color'] = '#6c757d'

def carregar_perguntas() -> Dict[str, Any]:
    """
    Carrega as perguntas e áreas do arquivo JSON.
    
    Returns:
        Dicionário com as perguntas e áreas
    """
    with open('questions.json', 'r', encoding='utf-8') as file:
        return json.load(file)

def calcular_pontuacoes(respostas: Dict[int, int]) -> Dict[str, float]:
    """
    Calcula as pontuações por área com base nas respostas.
    
    Args:
        respostas: Dicionário com as respostas (id_pergunta: valor_resposta)
        
    Returns:
        Dicionário com as pontuações normalizadas por área
    """
    dados = carregar_perguntas()
    
    # Inicializar pontuações
    pontuacoes = {area['id']: 0 for area in dados['areas']}
    pontuacoes_max = {area['id']: 0 for area in dados['areas']}
    
    # Calcular pontuações
    for pergunta in dados['perguntas']:
        pergunta_id = pergunta['id']
        if pergunta_id in respostas:
            valor_resposta = respostas[pergunta_id]
            for area, peso in pergunta['pesos'].items():
                pontuacoes[area] += valor_resposta * peso
                pontuacoes_max[area] += 5 * peso  # 5 é o valor máximo da resposta
    
    # Normalizar pontuações (0-100)
    pontuacoes_normalizadas = {}
    for area in pontuacoes:
        if pontuacoes_max[area] > 0:
            pontuacoes_normalizadas[area] = (pontuacoes[area] / pontuacoes_max[area]) * 100
        else:
            pontuacoes_normalizadas[area] = 0
            
    return pontuacoes_normalizadas

def gerar_grafico_pizza(pontuacoes: Dict[str, float]) -> str:
    """
    Gera um gráfico de pizza com as pontuações por área.
    
    Args:
        pontuacoes: Dicionário com as pontuações por área
        
    Returns:
        String do gráfico em formato base64
    """
    dados = carregar_perguntas()
    areas = {area['id']: area for area in dados['areas']}
    
    # Preparar dados para o gráfico
    labels = [areas[area_id]['nome'] for area_id in pontuacoes.keys()]
    valores = list(pontuacoes.values())
    cores = [areas[area_id]['cor'] for area_id in pontuacoes.keys()]
    
    # Criar figura com tamanho adequado
    plt.figure(figsize=(10, 7), dpi=100)
    
    # Criar gráfico de pizza
    patches, texts, autotexts = plt.pie(
        valores, 
        labels=labels, 
        autopct='%1.1f%%',
        startangle=90, 
        colors=cores,
        wedgeprops={'edgecolor': 'white', 'linewidth': 2},
        textprops={'fontsize': 12, 'color': '#212529'},
        shadow=False
    )
    
    # Melhorar a aparência dos textos
    for autotext in autotexts:
        autotext.set_fontsize(10)
        autotext.set_fontweight('bold')
        autotext.set_color('white')
    
    # Adicionar título
    plt.title('Resultado do Orientador Vocacional SENAC', fontsize=16, pad=20)
    
    # Adicionar legenda com cores
    plt.legend(
        labels, 
        loc="center left", 
        bbox_to_anchor=(1, 0, 0.5, 1),
        fontsize=10
    )
    
    # Garantir que o gráfico seja circular
    plt.axis('equal')
    plt.tight_layout()
    
    # Converter para base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
    buffer.seek(0)
    imagem_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    return imagem_base64

def validar_token_admin(token: str) -> bool:
    """
    Valida o token de administrador.
    
    Args:
        token: Token a ser validado
        
    Returns:
        True se o token for válido, False caso contrário
    """
    # Em um ambiente de produção, isso seria mais seguro
    # Por exemplo, usando variáveis de ambiente ou um serviço de gerenciamento de segredos
    return token == "senac-admin-token-2023"

