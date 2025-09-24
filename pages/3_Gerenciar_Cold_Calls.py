import streamlit as st
import sqlite3
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np
from math import pi

st.set_page_config(layout="wide")

st.title("📞 Gerenciar Cold Calls - Conversa Híbrida")
st.markdown("**Visualize performance e histórico de análises da Conversa Híbrida (6 etapas) dos seus BDRs**")

# --- Funções do Banco de Dados ---
def get_bdr_cold_calls(bdr_id):
    """Busca todos os cold calls da Conversa Híbrida de um BDR específico."""
    conn = sqlite3.connect('gestao_bdrs.db')
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
    conn = sqlite3.connect('gestao_bdrs.db')
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
    
    if result and result[6] > 0:  # Se há dados
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
    conn = sqlite3.connect('gestao_bdrs.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cold_calls WHERE id = ?", (call_id,))
    conn.commit()
    conn.close()

def create_matplotlib_radar_chart(scores, title):
    """Cria um radar chart do matplotlib focado na Conversa Híbrida (6 etapas)."""
    # Configurar o estilo escuro
    plt.style.use('dark_background')
    
    # Categorias - 6 Etapas da Conversa Híbrida
    categories = [
        '1. Warmer\n(Aquecimento)',
        '2. Reframe\n(Reenquadramento)', 
        '3. Rational Drowning\n(Afogamento Racional)',
        '4. Emotional Impact\n(Impacto Emocional)',
        '5. New Way\n(Novo Caminho)',
        '6. Your Solution\n(Sua Solução)'
    ]
    
    values = [
        scores['warmer_score'],
        scores['reframe_score'], 
        scores['rational_drowning_score'],
        scores['emotional_impact_score'],
        scores['new_way_score'],
        scores['your_solution_score']
    ]
    
    # Número de variáveis
    N = len(categories)
    
    # Calcular ângulos para cada eixo
    angles = [n / float(N) * 2 * pi for n in range(N)]
    angles += angles[:1]  # Fechar o círculo
    
    # Adicionar primeiro valor no final para fechar o círculo
    values += values[:1]
    
    # Criar figura
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
    fig.patch.set_facecolor('#1a1a1a')  # Fundo escuro
    ax.set_facecolor('#1a1a1a')
    
    # Plotar o radar chart
    ax.plot(angles, values, 'o-', linewidth=3, color='#00ffff', label=title)
    ax.fill(angles, values, alpha=0.25, color='#00ffff')
    
    # Configurar eixos
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=10, color='white')
    
    # Configurar escala radial
    ax.set_ylim(0, 10)
    ax.set_yticks([0, 2, 4, 6, 8, 10])
    ax.set_yticklabels(['0', '2', '4', '6', '8', '10'], fontsize=8, color='white')
    ax.grid(True, color='#333333', alpha=0.3)
    
    # Adicionar valores nos pontos
    for angle, value, category in zip(angles[:-1], values[:-1], categories):
        ax.text(angle, value + 0.5, str(value), 
                horizontalalignment='center', 
                verticalalignment='center',
                fontsize=9, 
                color='white',
                weight='bold')
    
    # Título
    plt.title(title, size=14, color='white', weight='bold', pad=20)
    
    # Remover bordas
    ax.spines['polar'].set_visible(False)
    
    plt.tight_layout()
    return fig


# --- Estatísticas Gerais Conversa Híbrida ---
st.subheader("📊 Performance Geral - Conversa Híbrida")
stats_gerais = get_hybrid_conversation_average_scores()

if stats_gerais['total_calls'] > 0:
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # Radar chart do matplotlib
        matplotlib_fig_geral = create_matplotlib_radar_chart(stats_gerais, "Performance Média Geral")
        st.pyplot(matplotlib_fig_geral)
    
    with col2:
        st.markdown("### 📈 Médias - 6 Etapas")
        st.metric("Total de Análises", stats_gerais['total_calls'])
        st.markdown("---")
        
        # 6 Etapas da Conversa Híbrida
        hybrid_steps = ['warmer_score', 'reframe_score', 'rational_drowning_score', 'emotional_impact_score', 'new_way_score', 'your_solution_score']
        hybrid_labels = ['1. Warmer', '2. Reframe', '3. Rational Drowning', '4. Emotional Impact', '5. New Way', '6. Your Solution']
        
        for key, label in zip(hybrid_steps, hybrid_labels):
            value = stats_gerais[key]
            if value >= 7:
                st.success(f"**{label}:** {value}/10")
            elif value >= 5:
                st.warning(f"**{label}:** {value}/10")
            else:
                st.error(f"**{label}:** {value}/10")
else:
    st.info("Nenhuma análise da Conversa Híbrida encontrada ainda.")

st.divider()

# --- Listar Cold Calls por BDR ---
st.subheader("👥 Performance Individual por BDR")

conn = sqlite3.connect('gestao_bdrs.db')
cursor = conn.cursor()
cursor.execute("SELECT id, nome FROM bdrs ORDER BY nome")
bdrs = cursor.fetchall()
conn.close()

if not bdrs:
    st.info("Nenhum BDR cadastrado ainda.")
else:
    for bdr_id, nome in bdrs:
        cold_calls = get_bdr_cold_calls(bdr_id)
        scores_bdr = get_hybrid_conversation_average_scores(bdr_id)
        
        # Header do BDR com estatísticas da Conversa Híbrida
        if scores_bdr['total_calls'] > 0:
            # Calcular média geral
            all_scores = [scores_bdr[key] for key in scores_bdr.keys() if key != 'total_calls']
            media_geral = sum(all_scores) / len(all_scores)
            
            with st.expander(f"🎯 {nome} - {scores_bdr['total_calls']} análises (Média: {media_geral:.1f}/10)", expanded=False):
                
                if not cold_calls:
                    st.info("Nenhuma análise da Conversa Híbrida para este BDR.")
                else:
                    # Performance da Conversa Híbrida do BDR
                    col1, col2 = st.columns([2, 1])
                    
                    with col1:
                        # Radar chart do matplotlib
                        matplotlib_fig_bdr = create_matplotlib_radar_chart(scores_bdr, f"Performance Conversa Híbrida - {nome}")
                        st.pyplot(matplotlib_fig_bdr)
                    
                    with col2:
                        st.markdown("### 📊 Scores Médios - 6 Etapas")
                        
                        # 6 Etapas da Conversa Híbrida
                        hybrid_steps = ['warmer_score', 'reframe_score', 'rational_drowning_score', 'emotional_impact_score', 'new_way_score', 'your_solution_score']
                        hybrid_labels = ['1. Warmer', '2. Reframe', '3. Rational Drowning', '4. Emotional Impact', '5. New Way', '6. Your Solution']
                        
                        for key, label in zip(hybrid_steps, hybrid_labels):
                            value = scores_bdr[key]
                            if value >= 7:
                                st.success(f"**{label}:** {value}/10")
                            elif value >= 5:
                                st.warning(f"**{label}:** {value}/10")
                            else:
                                st.error(f"**{label}:** {value}/10")
                    
                    st.markdown("---")
                    
                    # Lista de cold calls da Conversa Híbrida
                    for data, prospect_nome, prospect_empresa, warmer, reframe, rational_drowning, emotional_impact, new_way, your_solution, analise_completa, pontos_atencao, recomendacoes, insight_comercial, call_id in cold_calls:
                        
                        # Container para cada cold call da Conversa Híbrida
                        call_container = st.container()
                        with call_container:
                            # Header do call
                            col_info, col_delete = st.columns([4, 1])
                            
                            with col_info:
                                st.markdown(f"**🏢 {prospect_empresa} - {prospect_nome}**")
                                st.caption(f"📅 {data}")
                                if insight_comercial:
                                    st.caption(f"💡 **Insight Comercial:** {insight_comercial}")
                            
                            with col_delete:
                                if st.button("🗑️", key=f"delete_{call_id}", help="Deletar este cold call"):
                                    delete_cold_call(call_id)
                                    st.success("Cold call deletado!")
                                    st.rerun()
                            
                            # Scores da Conversa Híbrida individuais
                            st.markdown("**📊 Scores - 6 Etapas:**")
                            
                            # 6 Etapas da Conversa Híbrida
                            col1, col2, col3, col4, col5, col6 = st.columns(6)
                            hybrid_steps = [warmer, reframe, rational_drowning, emotional_impact, new_way, your_solution]
                            hybrid_labels = ["1. Warmer", "2. Reframe", "3. Rational Drowning", "4. Emotional Impact", "5. New Way", "6. Your Solution"]
                            
                            for col, score, label in zip([col1, col2, col3, col4, col5, col6], hybrid_steps, hybrid_labels):
                                with col:
                                    if score >= 7:
                                        col.success(f"**{label}**\n{score}/10")
                                    elif score >= 5:
                                        col.warning(f"**{label}**\n{score}/10")
                                    else:
                                        col.error(f"**{label}**\n{score}/10")
                            
                            # Conteúdo detalhado em tabs
                            tab1, tab2, tab3 = st.tabs(["📋 Análise Completa", "⚠️ Pontos de Atenção", "💡 Recomendações"])
                            
                            with tab1:
                                st.markdown(analise_completa)
                            
                            with tab2:
                                st.markdown(pontos_atencao)
                            
                            with tab3:
                                st.markdown(recomendacoes)
                            
                            st.divider()
        else:
            st.info(f"Nenhuma análise da Conversa Híbrida encontrada para {nome}.")

# --- Seção de Limpeza ---
st.markdown("---")
with st.expander("⚠️ Zona de Perigo"):
    st.warning("**Atenção:** As ações abaixo são irreversíveis!")
    
    if st.button("🗑️ Limpar TODOS os Cold Calls", type="secondary"):
        if st.button("⚠️ CONFIRMAR EXCLUSÃO DE TODOS OS COLD CALLS"):
            conn = sqlite3.connect('gestao_bdrs.db')
            cursor = conn.cursor()
            cursor.execute("DELETE FROM cold_calls")
            conn.commit()
            conn.close()
            st.success("Todos os cold calls foram removidos!")
            st.rerun()