import streamlit as st

st.set_page_config(
    page_title="Sistema de Análise - BDRs",
    page_icon="🎯",
    layout="wide"
)

st.title("🎯 Sistema de Análise para BDRs")
st.markdown("**Plataforma completa para análise de Cold Calls e reuniões 1:1 com metodologia Conversa Híbrida**")

st.markdown("---")

col1, col2 = st.columns(2)

with col1:
    st.markdown("### 📞 Análise de Cold Calls - Conversa Híbrida")
    st.markdown("""
    - **Metodologia Conversa Híbrida** (6 etapas)
    - **Análise bilíngue** (Português/Inglês)
    - **Gráficos de radar** para visualizar performance
    - **Scores detalhados** por etapa da conversa
    - **Insights comerciais** personalizados
    """)
    
    st.markdown("### 📊 Gerenciamento de Cold Calls")
    st.markdown("""
    - **Dashboard de performance** Conversa Híbrida
    - **Histórico completo** de análises
    - **Métricas por BDR** e geral
    - **Comparação visual** entre BDRs
    - **Análise de insights comerciais**
    """)

with col2:
    st.markdown("### 🎯 Análise de Reuniões 1:1")
    st.markdown("""
    - **Transcrição automática** com Whisper
    - **Análise com GPT-4** para insights
    - **Resumos estruturados** das reuniões
    - **Metas e próximos passos** definidos
    """)
    
    st.markdown("### 👥 Gerenciamento de BDRs")
    st.markdown("""
    - **CRUD completo** de BDRs
    - **Histórico de análises** por BDR
    - **Edição e remoção** de dados
    - **Visualização organizada** do histórico
    """)

st.markdown("---")

st.info("💡 **Navegue pelas páginas** usando o menu lateral para acessar todas as funcionalidades!")

st.markdown("### 🚀 Como usar:")
st.markdown("""
1. **Cadastre seus BDRs** na página "Gerenciar BDRs"
2. **Analise Cold Calls** com metodologia Conversa Híbrida na página dedicada
3. **Analise reuniões 1:1** para extrair insights e definir metas
4. **Acompanhe a performance** nos dashboards de gerenciamento
5. **Desenvolva insights comerciais** para cada persona e mercado
""")