from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import json
import os
from datetime import datetime

# Importar módulos locais
from database import salvar_resultado, obter_todos_resultados, obter_resultado_por_id
from utils import calcular_pontuacoes, gerar_grafico_pizza, carregar_perguntas, validar_token_admin

# Criar a aplicação FastAPI
app = FastAPI(
    title="Orientador Vocacional SENAC API",
    description="API para o sistema de orientação vocacional do SENAC",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Modelos de dados
class RespostaQuestionario(BaseModel):
    nome: str = Field(..., description="Nome do participante")
    respostas: Dict[int, int] = Field(
        ..., 
        description="Respostas do questionário (id_pergunta: valor_resposta)"
    )

class ResultadoResponse(BaseModel):
    id: int
    nome: str
    pontuacoes: Dict[str, float]
    grafico_base64: str
    data: str

# Middleware para adicionar cabeçalhos de cache e performance
@app.middleware("http")
async def add_performance_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Adicionar cabeçalhos para melhorar performance
    response.headers["Cache-Control"] = "public, max-age=86400"  # Cache por 24 horas
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Dependência para verificar token de administrador
async def verificar_admin(x_admin_token: str = Header(None)):
    if not x_admin_token or not validar_token_admin(x_admin_token):
        raise HTTPException(
            status_code=401,
            detail="Token de administrador inválido ou ausente"
        )
    return True

# Rota para servir o frontend
@app.get("/")
async def read_root():
    with open("static/index.html", "r", encoding="utf-8") as file:
        html_content = file.read()
    return Response(content=html_content, media_type="text/html")

# Rota para obter as perguntas
@app.get("/perguntas", response_model=Dict[str, Any])
async def obter_perguntas():
    try:
        return carregar_perguntas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar perguntas: {str(e)}")

# Rota para enviar respostas e obter resultado
@app.post("/responder", response_model=ResultadoResponse)
async def responder_questionario(resposta: RespostaQuestionario):
    try:
        # Calcular pontuações
        pontuacoes = calcular_pontuacoes(resposta.respostas)
        
        # Gerar gráfico
        grafico_base64 = gerar_grafico_pizza(pontuacoes)
        
        # Salvar no banco de dados
        resultado_id = await salvar_resultado(
            resposta.nome,
            pontuacoes,
            grafico_base64
        )
        
        # Retornar resultado
        return {
            "id": resultado_id,
            "nome": resposta.nome,
            "pontuacoes": pontuacoes,
            "grafico_base64": grafico_base64,
            "data": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar questionário: {str(e)}")

# Rota administrativa para listar todos os resultados
@app.get("/admin/resultados", response_model=List[Dict[str, Any]])
async def listar_resultados(_=Depends(verificar_admin)):
    try:
        return await obter_todos_resultados()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar resultados: {str(e)}")

# Rota administrativa para obter um resultado específico
@app.get("/admin/resultados/{resultado_id}", response_model=Dict[str, Any])
async def obter_resultado(resultado_id: int, _=Depends(verificar_admin)):
    try:
        resultado = await obter_resultado_por_id(resultado_id)
        if not resultado:
            raise HTTPException(status_code=404, detail="Resultado não encontrado")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter resultado: {str(e)}")

# Rota para verificar saúde da API
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# Iniciar servidor com uvicorn se executado diretamente
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

