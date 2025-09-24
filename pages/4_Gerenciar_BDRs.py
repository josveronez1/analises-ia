import streamlit as st
import sqlite3
from utils import validate_input_text

st.set_page_config(layout="wide")

st.title("👥 Gerenciar BDRs")
st.markdown("**Cadastre, edite e gerencie seus BDRs e visualize o histórico de análises**")

# --- Funções do Banco de Dados ---
def get_bdr_analyses(bdr_id):
    """Busca todas as análises de um BDR específico."""
    conn = sqlite3.connect('gestao_bdrs.db')
    cursor = conn.cursor()
    cursor.execute(
        "SELECT data, resumo, metas FROM analises WHERE bdr_id = ? ORDER BY data DESC",
        (bdr_id,)
    )
    analyses = cursor.fetchall()
    conn.close()
    return analyses

# --- Adicionar Novo BDR ---
with st.expander("➕ Adicionar Novo BDR"):
    novo_bdr_nome = st.text_input("Nome do BDR", key="novo_bdr_input", max_chars=50, help="Apenas letras, números, espaços e acentos")
    if st.button("Adicionar BDR"):
        if novo_bdr_nome:
            # Validar nome do BDR
            nome_valid, nome_msg = validate_input_text(novo_bdr_nome, "Nome do BDR", 50)
            
            if not nome_valid:
                st.error(f"❌ {nome_msg}")
                st.stop()
            else:
                try:
                    conn = sqlite3.connect('gestao_bdrs.db')
                    cursor = conn.cursor()
                    cursor.execute("INSERT INTO bdrs (nome) VALUES (?)", (novo_bdr_nome,))
                    conn.commit()
                    conn.close()
                    st.success(f"BDR '{novo_bdr_nome}' adicionado com sucesso!")
                    st.rerun()
                except sqlite3.IntegrityError:
                    st.error(f"Erro: O BDR '{novo_bdr_nome}' já existe.")
        else:
            st.warning("Por favor, digite o nome do BDR.")

st.divider()

# --- Listar e Gerenciar BDRs Existentes ---
st.subheader("📋 BDRs Cadastrados")

conn = sqlite3.connect('gestao_bdrs.db')
cursor = conn.cursor()
cursor.execute("SELECT id, nome FROM bdrs ORDER BY nome")
bdrs = cursor.fetchall()
conn.close()

if not bdrs:
    st.info("Nenhum BDR cadastrado ainda.")
else:
    for bdr_id, nome in bdrs:
        with st.expander(nome):  # Cada BDR agora é um menu expansível
            
            # --- Visualizar Histórico ---
            st.markdown("**📊 Histórico de Análises**")
            analyses = get_bdr_analyses(bdr_id)
            if not analyses:
                st.info("Nenhuma análise encontrada para este BDR.")
            else:
                for data, resumo, metas in analyses:
                    st.markdown(f"**Data:** {data}")
                    st.markdown("**Resumo:**")
                    st.info(resumo)
                    st.markdown("**Metas e Próximos Passos:**")
                    st.warning(metas)
                    st.divider()
            
            # --- Editar Nome ---
            st.markdown("**✏️ Editar ou Remover BDR**")
            novo_nome = st.text_input("Editar nome", value=nome, key=f"edit_{bdr_id}", max_chars=50, help="Apenas letras, números, espaços e acentos")
            
            col1, col2 = st.columns(2)
            with col1:
                if st.button("Salvar Alterações", key=f"salvar_{bdr_id}"):
                    # Validar nome do BDR
                    nome_valid, nome_msg = validate_input_text(novo_nome, "Nome do BDR", 50)
                    
                    if not nome_valid:
                        st.error(f"❌ {nome_msg}")
                        st.stop()
                    else:
                        try:
                            conn = sqlite3.connect('gestao_bdrs.db')
                            cursor = conn.cursor()
                            cursor.execute("UPDATE bdrs SET nome = ? WHERE id = ?", (novo_nome, bdr_id))
                            conn.commit()
                            conn.close()
                            st.success("Nome atualizado com sucesso!")
                            st.rerun()
                        except sqlite3.IntegrityError:
                            st.error(f"Erro: O BDR '{novo_nome}' já existe.")
            with col2:
                if st.button("Remover BDR", key=f"remover_{bdr_id}"):
                    conn = sqlite3.connect('gestao_bdrs.db')
                    cursor = conn.cursor()
                    # Cuidado: aqui também deletaríamos as análises associadas ou reatribuiríamos
                    cursor.execute("DELETE FROM analises WHERE bdr_id = ?", (bdr_id,))
                    cursor.execute("DELETE FROM cold_calls WHERE bdr_id = ?", (bdr_id,))
                    cursor.execute("DELETE FROM bdrs WHERE id = ?", (bdr_id,))
                    conn.commit()
                    conn.close()
                    st.success(f"BDR '{nome}' e seu histórico foram removidos.")
                    st.rerun()

# --- Estatísticas Gerais ---
st.markdown("---")
st.subheader("📈 Estatísticas Gerais")

conn = sqlite3.connect('gestao_bdrs.db')
cursor = conn.cursor()

# Contar BDRs
cursor.execute("SELECT COUNT(*) FROM bdrs")
total_bdrs = cursor.fetchone()[0]

# Contar análises de 1:1
cursor.execute("SELECT COUNT(*) FROM analises")
total_analises_1x1 = cursor.fetchone()[0]

# Contar análises de cold calls
cursor.execute("SELECT COUNT(*) FROM cold_calls")
total_analises_cold_calls = cursor.fetchone()[0]

conn.close()

col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Total de BDRs", total_bdrs)
with col2:
    st.metric("Análises 1:1", total_analises_1x1)
with col3:
    st.metric("Análises Cold Calls", total_analises_cold_calls)