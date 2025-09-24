import sqlite3
from datetime import datetime
from config import DATABASE_PATH

def get_connection():
    """Retorna uma conexão com o banco de dados."""
    return sqlite3.connect(DATABASE_PATH)

def get_bdrs():
    """Busca todos os BDRs cadastrados no banco de dados."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome FROM bdrs ORDER BY nome")
    bdrs = cursor.fetchall()
    conn.close()
    return bdrs

def sanitize_text(text):
    """Sanitiza texto removendo caracteres perigosos."""
    if not text:
        return text
    
    # Remover caracteres de controle e caracteres perigosos
    import re
    text = re.sub(r'[<>"\';]', '', text)
    text = re.sub(r'--|/\*|\*/', '', text)
    return text.strip()

def save_cold_call_analise(bdr_id, prospect_nome, prospect_empresa, scores, analise_completa, pontos_atencao, recomendacoes, insight_comercial):
    """Salva uma nova análise de cold call com foco na Conversa Híbrida (6 etapas)."""
    # Sanitizar dados de entrada
    prospect_nome = sanitize_text(prospect_nome)
    prospect_empresa = sanitize_text(prospect_empresa)
    analise_completa = sanitize_text(analise_completa)
    pontos_atencao = sanitize_text(pontos_atencao)
    recomendacoes = sanitize_text(recomendacoes)
    insight_comercial = sanitize_text(insight_comercial)
    
    conn = get_connection()
    cursor = conn.cursor()
    data_atual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        """INSERT INTO cold_calls (bdr_id, data, prospect_nome, prospect_empresa, 
           warmer_score, reframe_score, rational_drowning_score, emotional_impact_score, 
           new_way_score, your_solution_score, analise_completa, pontos_atencao, recomendacoes, insight_comercial) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (bdr_id, data_atual, prospect_nome, prospect_empresa, 
         scores['warmer_score'], scores['reframe_score'], scores['rational_drowning_score'], 
         scores['emotional_impact_score'], scores['new_way_score'], scores['your_solution_score'],
         analise_completa, pontos_atencao, recomendacoes, insight_comercial)
    )
    conn.commit()
    conn.close()

def save_analise(bdr_id, resumo, metas):
    """Salva uma nova análise de 1:1 no banco de dados."""
    # Sanitizar dados de entrada
    resumo = sanitize_text(resumo)
    metas = sanitize_text(metas)
    
    conn = get_connection()
    cursor = conn.cursor()
    data_atual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO analises (bdr_id, data, resumo, metas) VALUES (?, ?, ?, ?)",
        (bdr_id, data_atual, resumo, metas)
    )
    conn.commit()
    conn.close()

def get_bdr_cold_calls(bdr_id):
    """Busca todos os cold calls da Conversa Híbrida de um BDR específico."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT data, prospect_nome, prospect_empresa, 
           warmer_score, reframe_score, rational_drowning_score, emotional_impact_score, 
           new_way_score, your_solution_score, analise_completa, pontos_atencao, recomendacoes, insight_comercial, id 
           FROM cold_calls WHERE bdr_id = ? ORDER BY data DESC""",
        (bdr_id,)
    )
    cold_calls = cursor.fetchall()
    conn.close()
    return cold_calls

def get_hybrid_conversation_average_scores(bdr_id=None):
    """Calcula médias dos scores da Conversa Híbrida (6 etapas)."""
    conn = get_connection()
    cursor = conn.cursor()
    
    if bdr_id:
        cursor.execute(
            """SELECT AVG(warmer_score), AVG(reframe_score), AVG(rational_drowning_score), 
               AVG(emotional_impact_score), AVG(new_way_score), AVG(your_solution_score), COUNT(*) 
               FROM cold_calls WHERE bdr_id = ?""",
            (bdr_id,)
        )
    else:
        cursor.execute(
            """SELECT AVG(warmer_score), AVG(reframe_score), AVG(rational_drowning_score), 
               AVG(emotional_impact_score), AVG(new_way_score), AVG(your_solution_score), COUNT(*) 
               FROM cold_calls"""
        )

    result = cursor.fetchone()
    conn.close()

    if result and result[6] > 0:
        return {
            'warmer_score': round(result[0] or 0, 1),
            'reframe_score': round(result[1] or 0, 1),
            'rational_drowning_score': round(result[2] or 0, 1),
            'emotional_impact_score': round(result[3] or 0, 1),
            'new_way_score': round(result[4] or 0, 1),
            'your_solution_score': round(result[5] or 0, 1),
            'total_calls': result[6]
        }
    else:
        return {
            'warmer_score': 0,
            'reframe_score': 0,
            'rational_drowning_score': 0,
            'emotional_impact_score': 0,
            'new_way_score': 0,
            'your_solution_score': 0,
            'total_calls': 0
        }

def delete_cold_call(call_id):
    """Deleta um cold call específico."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cold_calls WHERE id = ?", (call_id,))
    conn.commit()
    conn.close()

def get_bdr_analyses(bdr_id):
    """Busca todas as análises de um BDR específico"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT data, resumo, metas FROM analises WHERE bdr_id = ? ORDER BY data DESC",
        (bdr_id,)
    )
    analyses = cursor.fetchall()
    conn.close()
    return analyses