import sqlite3
import json
import os
import aiosqlite
from typing import Dict, List, Optional, Any

# Garantir que o diretório de dados existe
os.makedirs("data", exist_ok=True)
DB_PATH = "data/orientador_vocacional.db"

def init_db():
    """Inicializa o banco de dados com as tabelas necessárias."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela para armazenar os resultados dos questionários
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resultados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pontuacao_ti REAL,
        pontuacao_enfermagem REAL,
        pontuacao_estetica REAL,
        pontuacao_logistica REAL,
        pontuacao_administracao REAL,
        grafico_base64 TEXT
    )
    ''')
    
    conn.commit()
    conn.close()

async def salvar_resultado(
    nome: str, 
    pontuacoes: Dict[str, float], 
    grafico_base64: str
) -> int:
    """
    Salva o resultado do questionário no banco de dados.
    
    Args:
        nome: Nome do participante
        pontuacoes: Dicionário com as pontuações por área
        grafico_base64: String do gráfico em formato base64
        
    Returns:
        ID do resultado inserido
    """
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.cursor()
        await cursor.execute(
            '''
            INSERT INTO resultados 
            (nome, pontuacao_ti, pontuacao_enfermagem, pontuacao_estetica, 
             pontuacao_logistica, pontuacao_administracao, grafico_base64)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                nome,
                pontuacoes.get('ti', 0),
                pontuacoes.get('enfermagem', 0),
                pontuacoes.get('estetica', 0),
                pontuacoes.get('logistica', 0),
                pontuacoes.get('administracao', 0),
                grafico_base64
            )
        )
        await db.commit()
        return cursor.lastrowid

async def obter_todos_resultados() -> List[Dict[str, Any]]:
    """
    Obtém todos os resultados do banco de dados.
    
    Returns:
        Lista de dicionários com os resultados
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            '''
            SELECT id, nome, data, 
                   pontuacao_ti, pontuacao_enfermagem, pontuacao_estetica,
                   pontuacao_logistica, pontuacao_administracao
            FROM resultados
            ORDER BY data DESC
            '''
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def obter_resultado_por_id(resultado_id: int) -> Optional[Dict[str, Any]]:
    """
    Obtém um resultado específico pelo ID.
    
    Args:
        resultado_id: ID do resultado a ser obtido
        
    Returns:
        Dicionário com os dados do resultado ou None se não encontrado
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            '''
            SELECT id, nome, data, 
                   pontuacao_ti, pontuacao_enfermagem, pontuacao_estetica,
                   pontuacao_logistica, pontuacao_administracao, grafico_base64
            FROM resultados
            WHERE id = ?
            ''',
            (resultado_id,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None

# Inicializa o banco de dados ao importar o módulo
init_db()

