import streamlit as st
from openai import OpenAI
import sqlite3
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np
from math import pi
import os
from config import OPENAI_API_KEY, ALLOWED_AUDIO_TYPES, MAX_FILE_SIZE_MB
from database import get_bdrs, save_cold_call_analise
from utils import create_matplotlib_radar_chart, validate_audio_file, validate_input_text

st.set_page_config(layout="wide")

st.title("📞 Análise de Cold Calls - Conversa Híbrida")
st.markdown("**Analise cold calls baseado na metodologia Conversa Híbrida (6 etapas)**")

# Verificar se a API key está configurada
if not OPENAI_API_KEY:
    st.error("⚠️ **API Key não configurada!** Por favor, configure a variável de ambiente OPENAI_API_KEY no Streamlit Cloud.")
    st.stop()

# Seletor de idioma
col_lang, col_space = st.columns([1, 3])
with col_lang:
    idioma = st.selectbox(
        "🌐 Idioma do Cold Call:",
        options=["Português", "English"],
        index=1,  # Default para English
        help="Selecione o idioma falado no cold call para melhor análise"
    )

# Explicação da metodologia
with st.expander("🧠 Sobre a Conversa Híbrida (6 Etapas)"):
    st.markdown("""
    **Conversa Híbrida** é uma metodologia que combina SPIN Selling e The Challenger Sale em 6 etapas sequenciais:
    
    **1. Warmer (Aquecimento)**
    - Foco SPIN: Perguntas de Situação e Problema
    - Estabelecer credibilidade e diagnosticar problemas conhecidos
    
    **2. Reframe (Reenquadramento)**
    - Foco SPIN: Validação do Problema
    - Introduzir insight comercial disruptivo
    
    **3. Rational Drowning (Afogamento Racional)**
    - Foco SPIN: Perguntas de Implicação
    - Usar dados para quantificar custo do problema
    
    **4. Emotional Impact (Impacto Emocional)**
    - Foco SPIN: Perguntas de Necessidade de Solução
    - Tornar o problema pessoal com histórias
    
    **5. New Way (Novo Caminho)**
    - Apresentar visão da solução ideal
    - Sem mencionar produto específico
    
    **6. Your Solution (Sua Solução)**
    - Conectar à sua solução específica
    - Agendar próximo passo
    """)

bdrs_list = get_bdrs()

if not bdrs_list:
    st.warning("Nenhum BDR cadastrado. Por favor, vá para a página 'Gerenciar BDRs' para adicionar um.")
else:
    bdr_map = {nome: bdr_id for bdr_id, nome in bdrs_list}
    
    # Formulário de entrada
    col1, col2 = st.columns(2)
    
    with col1:
        bdr_nome_selecionado = st.selectbox("Selecione o BDR:", options=bdr_map.keys())
        prospect_nome = st.text_input("Nome do Prospect:", max_chars=100, help="Apenas letras, números, espaços e acentos")
    
    with col2:
        prospect_empresa = st.text_input("Empresa do Prospect:", max_chars=100, help="Apenas letras, números, espaços e acentos")
        insight_comercial = st.text_area("Insight Comercial Utilizado:", 
                                       placeholder="Descreva o insight comercial que foi usado nesta chamada (opcional)",
                                       max_chars=500, help="Apenas letras, números, espaços e acentos")

    audio_file = st.file_uploader(
        "Selecione o arquivo de áudio do Cold Call:",
        type=ALLOWED_AUDIO_TYPES
    )

    if audio_file is not None:

        is_valid, message = validate_audio_file(audio_file)
        if not is_valid:
            st.error(f"❌ {message}")
            st.stop()

        st.audio(audio_file)

        if st.button("🎯 Analisar Cold Call - Conversa Híbrida", type="primary"):
            # Validar campos obrigatórios
            nome_valid, nome_msg = validate_input_text(prospect_nome, "Nome do Prospect", 100)
            empresa_valid, empresa_msg = validate_input_text(prospect_empresa, "Empresa do Prospect", 100)
            
            # Validar insight comercial se preenchido
            insight_valid = True
            insight_msg = ""
            if insight_comercial and insight_comercial.strip():
                insight_valid, insight_msg = validate_input_text(insight_comercial, "Insight Comercial", 500)
            
            if not nome_valid:
                st.error(f"❌ {nome_msg}")
                st.stop()
            elif not empresa_valid:
                st.error(f"❌ {empresa_msg}")
                st.stop()
            elif not insight_valid:
                st.error(f"❌ {insight_msg}")
                st.stop()
            else:
                with st.spinner("Analisando cold call com metodologia Conversa Híbrida... Este processo pode levar alguns minutos."):
                    bdr_id_selecionado = bdr_map[bdr_nome_selecionado]
                    
                    client = OpenAI(api_key=OPENAI_API_KEY)

                    st.info("Transcrevendo áudio... Isso pode levar um momento.")
                    
                    transcription = client.audio.transcriptions.create(
                        model="whisper-1", file=audio_file
                    )
                    texto_transcrito = transcription.text
                
                # Criar prompt bilíngue baseado no idioma selecionado
                if idioma == "English":
                    prompt_analysis = f"""
You are a sales expert and certified coach in the Hybrid Conversation methodology.

Analyze this cold call transcription based on the HYBRID CONVERSATION methodology (6 steps):

**HYBRID CONVERSATION METHODOLOGY:**
This approach combines SPIN Selling and The Challenger Sale in 6 sequential steps for maximum effectiveness in complex B2B sales.

**THE 6 STEPS:**

**1. Warmer (Warm-up)**
- SPIN Focus: Situation and Problem Questions
- Objective: Establish credibility, show research, diagnose known problems
- Key Elements: Transparent opening, demonstrate knowledge, engagement question

**2. Reframe (Recontextualization)**
- SPIN Focus: Problem Validation
- Objective: Validate prospect response and introduce disruptive commercial insight
- Key Elements: Validate and agree, introduce reframing with insight

**3. Rational Drowning (Rational Drowning)**
- SPIN Focus: Implication Questions
- Objective: Use data and logic to quantify cost of reframed problem
- Key Elements: Present key data, ask implication question

**4. Emotional Impact (Emotional Impact)**
- SPIN Focus: Need-Payoff Questions
- Objective: Make problem personal with story and make prospect articulate benefits
- Key Elements: Tell mini-story, ask need-payoff question

**5. New Way (New Way)**
- Objective: Introduce ideal solution vision, capabilities needed to solve reframed problem
- Key Elements: Present solution vision without mentioning specific product

**6. Your Solution (Your Solution)**
- Objective: Connect "New Way" directly to your product/service and schedule next step
- Key Elements: Make connection, propose next step (call to action)

**CALL INFORMATION:**
- BDR: {bdr_nome_selecionado}
- Prospect: {prospect_nome}
- Company: {prospect_empresa}
- Language: English
- Commercial Insight Used: {insight_comercial if insight_comercial else 'Not specified'}

**TRANSCRIPTION:**
{texto_transcrito}

**REQUESTED ANALYSIS:**

Evaluate each step from 0 to 10 and provide:

### HYBRID CONVERSATION SCORES
**Warmer:** X/10
**Reframe:** X/10
**Rational Drowning:** X/10
**Emotional Impact:** X/10
**New Way:** X/10
**Your Solution:** X/10

### DETAILED ANALYSIS
(Complete call analysis based on the 6-step hybrid conversation methodology)

### COMMERCIAL INSIGHT EVALUATION
(How well was the commercial insight used and developed?)

### ATTENTION POINTS
(Specific areas that need improvement based on the 6 steps)

### RECOMMENDATIONS
(Specific actions to improve each step)

IMPORTANT: Be rigorous in evaluation. High scores (8-10) should be reserved for exemplary execution of each step.
"""
                else:  # Português
                    prompt_analysis = f"""
Você é um especialista em vendas e coach certificado na metodologia Conversa Híbrida.

Analise esta transcrição de cold call baseado na metodologia CONVERSA HÍBRIDA (6 etapas):

**METODOLOGIA CONVERSA HÍBRIDA:**
Esta abordagem combina SPIN Selling e The Challenger Sale em 6 etapas sequenciais para máxima eficácia em vendas B2B complexas.

**AS 6 ETAPAS:**

**1. Warmer (Aquecimento)**
- Foco SPIN: Perguntas de Situação e Problema
- Objetivo: Estabelecer credibilidade, mostrar pesquisa, diagnosticar problemas conhecidos
- Elementos-chave: Abertura transparente, demonstrar conhecimento, pergunta de engajamento

**2. Reframe (Reenquadramento)**
- Foco SPIN: Validação do Problema
- Objetivo: Validar resposta do prospect e introduzir insight comercial disruptivo
- Elementos-chave: Validar e concordar, introduzir reenquadramento com insight

**3. Rational Drowning (Afogamento Racional)**
- Foco SPIN: Perguntas de Implicação
- Objetivo: Usar dados e lógica para quantificar custo do problema reenquadrado
- Elementos-chave: Apresentar dado chave, fazer pergunta de implicação

**4. Emotional Impact (Impacto Emocional)**
- Foco SPIN: Perguntas de Necessidade de Solução
- Objetivo: Tornar problema pessoal com história e fazer prospect articular benefícios
- Elementos-chave: Contar mini-história, fazer pergunta de necessidade de solução

**5. New Way (Novo Caminho)**
- Objetivo: Introduzir visão da solução ideal, capacidades necessárias para resolver problema reenquadrado
- Elementos-chave: Apresentar visão da solução sem mencionar produto específico

**6. Your Solution (Sua Solução)**
- Objetivo: Conectar "Novo Caminho" diretamente ao seu produto/serviço e agendar próximo passo
- Elementos-chave: Fazer conexão, propor próximo passo (call to action)

**INFORMAÇÕES DA LIGAÇÃO:**
- BDR: {bdr_nome_selecionado}
- Prospect: {prospect_nome}
- Empresa: {prospect_empresa}
- Idioma: Português
- Insight Comercial Utilizado: {insight_comercial if insight_comercial else 'Não especificado'}

**TRANSCRIÇÃO:**
{texto_transcrito}

**ANÁLISE SOLICITADA:**

Avalie cada etapa de 0 a 10 e forneça:

### SCORES CONVERSA HÍBRIDA
**Warmer:** X/10
**Reframe:** X/10
**Rational Drowning:** X/10
**Emotional Impact:** X/10
**New Way:** X/10
**Your Solution:** X/10

### ANÁLISE DETALHADA
(Análise completa da ligação baseada na metodologia de 6 etapas da conversa híbrida)

### AVALIAÇÃO DO INSIGHT COMERCIAL
(Quão bem o insight comercial foi usado e desenvolvido?)

### PONTOS DE ATENÇÃO
(Áreas específicas que precisam de melhoria baseadas nas 6 etapas)

### RECOMENDAÇÕES
(Ações específicas para melhorar cada etapa)

IMPORTANTE: Seja rigoroso na avaliação. Scores altos (8-10) devem ser reservados para execução exemplar de cada etapa.
"""
                
                st.info("Analisando com metodologia Conversa Híbrida...")
                response = client.chat.completions.create(
                    model="gpt-4-turbo",
                    messages=[{"role": "user", "content": prompt_analysis}]
                )
                analise_completa = response.choices[0].message.content
                
                # Extrair scores e seções
                try:
                    import re
                    
                    # Extrair scores usando regex bilíngue - apenas 6 etapas
                    if idioma == "English":
                        score_patterns = {
                            'warmer_score': r'Warmer.*?(\d+)/10',
                            'reframe_score': r'Reframe.*?(\d+)/10',
                            'rational_drowning_score': r'Rational Drowning.*?(\d+)/10',
                            'emotional_impact_score': r'Emotional Impact.*?(\d+)/10',
                            'new_way_score': r'New Way.*?(\d+)/10',
                            'your_solution_score': r'Your Solution.*?(\d+)/10'
                        }
                    else:
                        score_patterns = {
                            'warmer_score': r'Warmer.*?(\d+)/10',
                            'reframe_score': r'Reframe.*?(\d+)/10',
                            'rational_drowning_score': r'Rational Drowning.*?(\d+)/10',
                            'emotional_impact_score': r'Emotional Impact.*?(\d+)/10',
                            'new_way_score': r'New Way.*?(\d+)/10',
                            'your_solution_score': r'Your Solution.*?(\d+)/10'
                        }
                    
                    scores = {}
                    for key, pattern in score_patterns.items():
                        match = re.search(pattern, analise_completa, re.IGNORECASE)
                        scores[key] = int(match.group(1)) if match else 5
                    
                    # Extrair seções bilíngue
                    sections = analise_completa.split("###")
                    pontos_atencao = ""
                    recomendacoes = ""
                    
                    for section in sections:
                        section_upper = section.upper()
                        if idioma == "English":
                            if "ATTENTION POINTS" in section_upper:
                                pontos_atencao = section.split("ATTENTION POINTS")[1].strip()
                            elif "RECOMMENDATIONS" in section_upper:
                                recomendacoes = section.split("RECOMMENDATIONS")[1].strip()
                        else:
                            if "PONTOS DE ATENÇÃO" in section_upper:
                                pontos_atencao = section.split("PONTOS DE ATENÇÃO")[1].strip()
                            elif "RECOMENDAÇÕES" in section_upper:
                                recomendacoes = section.split("RECOMENDAÇÕES")[1].strip()
                    
                    if not pontos_atencao:
                        pontos_atencao = "Ver análise completa"
                    if not recomendacoes:
                        recomendacoes = "Ver análise completa"
                        
                except Exception as e:
                    st.error(f"Erro ao processar scores: {e}")
                    scores = {key: 5 for key in ['warmer_score', 'reframe_score', 'rational_drowning_score', 'emotional_impact_score', 'new_way_score', 'your_solution_score']}
                    pontos_atencao = "Erro no processamento"
                    recomendacoes = "Ver análise completa"

                # Salvar no banco
                save_cold_call_analise(
                    bdr_id_selecionado, 
                    prospect_nome, 
                    prospect_empresa, 
                    scores,
                    analise_completa, 
                    pontos_atencao, 
                    recomendacoes,
                    insight_comercial
                )
                
                st.success("✅ Análise Conversa Híbrida salva com sucesso!")
                
                # Exibir gráfico de radar
                st.markdown("---")
                st.markdown("## 📊 Performance - Conversa Híbrida (6 Etapas)")
                
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    # Radar chart do matplotlib
                    matplotlib_fig = create_matplotlib_radar_chart(scores, bdr_nome_selecionado)
                    st.pyplot(matplotlib_fig)
                
                with col2:
                    st.markdown("### 📈 Scores - 6 Etapas")
                    
                    # 6 Etapas da Conversa Híbrida
                    hybrid_steps = ['warmer_score', 'reframe_score', 'rational_drowning_score', 'emotional_impact_score', 'new_way_score', 'your_solution_score']
                    hybrid_labels = ['1. Warmer', '2. Reframe', '3. Rational Drowning', '4. Emotional Impact', '5. New Way', '6. Your Solution']
                    
                    for key, label in zip(hybrid_steps, hybrid_labels):
                        value = scores[key]
                        if value >= 8:
                            st.success(f"**{label}:** {value}/10")
                        elif value >= 6:
                            st.warning(f"**{label}:** {value}/10")
                        else:
                            st.error(f"**{label}:** {value}/10")
                
                # Exibir análise completa
                st.markdown("---")
                st.markdown("## 📋 Análise Completa - Conversa Híbrida")
                st.markdown(analise_completa)