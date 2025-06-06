import json
import base64
import io
from typing import Dict, List, Any
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.facecolor'] = '#f8f9fa'
plt.rcParams['figure.facecolor'] = '#ffffff'
plt.rcParams['text.color'] = '#212529'
plt.rcParams['axes.labelcolor'] = '#495057'
plt.rcParams['xtick.color'] = '#6c757d'
plt.rcParams['ytick.color'] = '#6c757d'

def carregar_perguntas() -> Dict[str, Any]:
    with open('questions.json', 'r', encoding='utf-8') as file:
        return json.load(file)

def calcular_pontuacoes(respostas: Dict[int, int]) -> Dict[str, float]:
    dados = carregar_perguntas()
    
    pontuacoes = {area['id']: 0 for area in dados['areas']}
    pontuacoes_max = {area['id']: 0 for area in dados['areas']}
    
    for pergunta in dados['perguntas']:
        pergunta_id = pergunta['id']
        if pergunta_id in respostas:
            valor_resposta = respostas[pergunta_id]
            for area, peso in pergunta['pesos'].items():
                pontuacoes[area] += valor_resposta * peso
                pontuacoes_max[area] += 5 * peso
    
    pontuacoes_normalizadas = {}
    for area in pontuacoes:
        if pontuacoes_max[area] > 0:
            pontuacoes_normalizadas[area] = (pontuacoes[area] / pontuacoes_max[area]) * 100
        else:
            pontuacoes_normalizadas[area] = 0
            
    return pontuacoes_normalizadas

def gerar_grafico_pizza(pontuacoes: Dict[str, float]) -> str:
    dados = carregar_perguntas()
    areas = {area['id']: area for area in dados['areas']}
    
    labels = [areas[area_id]['nome'] for area_id in pontuacoes.keys()]
    valores = list(pontuacoes.values())
    cores = [areas[area_id]['cor'] for area_id in pontuacoes.keys()]
    
    plt.figure(figsize=(10, 7), dpi=100)
    
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
    
    for autotext in autotexts:
        autotext.set_fontsize(10)
        autotext.set_fontweight('bold')
        autotext.set_color('white')
    
    plt.title('Resultado do Orientador Vocacional SENAC', fontsize=16, pad=20)
    
    plt.legend(
        labels, 
        loc="center left", 
        bbox_to_anchor=(1, 0, 0.5, 1),
        fontsize=10
    )
    
    plt.axis('equal')
    plt.tight_layout()
    
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
    buffer.seek(0)
    imagem_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    
    return imagem_base64

def validar_token_admin(token: str) -> bool:
    return token == "senac-admin-token-2023"

