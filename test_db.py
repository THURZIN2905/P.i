import asyncio
import database
import utils

async def test():
    pontuacoes = {'ti': 85, 'enfermagem': 45, 'estetica': 60, 'logistica': 30, 'administracao': 70}
    grafico = utils.gerar_grafico_pizza(pontuacoes)
    resultado_id = await database.salvar_resultado('Teste', pontuacoes, grafico)
    print(f'Resultado salvo com ID: {resultado_id}')
    
    resultado = await database.obter_resultado_por_id(resultado_id)
    print(f'Resultado recuperado: {resultado["nome"]}')
    print(f'Tamanho do gráfico recuperado: {len(resultado["grafico_base64"])}')
    
    return resultado

if __name__ == "__main__":
    asyncio.run(test())

