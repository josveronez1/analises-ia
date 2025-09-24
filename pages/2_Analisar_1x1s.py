import streamlit as st
from openai import OpenAI
import sqlite3
from datetime import datetime
import os
from config import OPENAI_API_KEY, ALLOWED_AUDIO_TYPES
from database import get_bdrs, save_analise
from utils import validate_audio_file, validate_input_text

st.set_page_config(layout="wide")



st.title("🎯 Sistema de Análise de 1:1s")
st.markdown("**Analise reuniões 1:1 com seus BDRs usando IA para extrair insights valiosos.**")
st.info("💡 **Novo!** Agora você também pode analisar Cold Calls na página dedicada!")

# Verificar se a API key está configurada
if not OPENAI_API_KEY:
    st.error("⚠️ **API Key não configurada!** Por favor, configure a variável de ambiente OPENAI_API_KEY no Streamlit Cloud.")
    st.stop()

bdrs_list = get_bdrs()

if not bdrs_list:
    st.warning("Nenhum BDR cadastrado. Por favor, vá para a página 'Gerenciar BDRs' para adicionar um.")
else:
    bdr_map = {nome: bdr_id for bdr_id, nome in bdrs_list}
    
    bdr_nome_selecionado = st.selectbox("Selecione o BDR para a análise:", options=bdr_map.keys())

    audio_file = st.file_uploader(
        "Selecione o arquivo de áudio:",
        type=ALLOWED_AUDIO_TYPES
    )

    if audio_file is not None:

        is_valid, message = validate_audio_file(audio_file)
        if not is_valid:
            st.error(f"❌ {message}")
            st.stop()

        st.audio(audio_file)

        if st.button("Analisar Áudio"):
            with st.spinner("Analisando reunião... Este processo pode levar alguns minutos."):
                bdr_id_selecionado = bdr_map[bdr_nome_selecionado]
                
                client = OpenAI(api_key=OPENAI_API_KEY)

                st.info("Iniciando análise... Isso pode levar um momento.")
                
                transcription = client.audio.transcriptions.create(
                    model="whisper-1", file=audio_file
                )
                texto_transcrito = transcription.text
            
            prompt_de_analise = f"""
            Você é um coach de vendas... (seu prompt completo aqui)
            
            Transcrição:
            \"\"\"
            {texto_transcrito}
            \"\"\"
            ... (resto do seu prompt aqui, pedindo Resumo e Metas)
            """
            response = client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[{"role": "user", "content": prompt_de_analise}]
            )
            analise_completa = response.choices[0].message.content
            
            try:
                resumo = analise_completa.split("### 🎯 Metas e Próximos Passos")[0].replace("### 📋 Resumo da Reunião", "").strip()
                metas = analise_completa.split("### 🎯 Metas e Próximos Passos")[1].strip()
            except IndexError:
                resumo = "Não foi possível extrair o resumo."
                metas = analise_completa

            save_analise(bdr_id_selecionado, resumo, metas)
            
            st.success("Análise salva com sucesso no banco de dados!")
            st.write(analise_completa)