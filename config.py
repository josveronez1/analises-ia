import os

DATABASE_PATH = "gestao_bdrs.db"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Validar se a API key está configurada (apenas em produção)
if not OPENAI_API_KEY and os.getenv("STREAMLIT_CLOUD"):
    raise ValueError("OPENAI_API_KEY não está configurada. Configure a variável de ambiente no Streamlit Cloud.")

PAGE_CONFIG = {
    "page_title": "Sistema de Análise para BDRs",
    "page_icon": "🎯",
    "layout": "wide"
}

ALLOWED_AUDIO_TYPES = ["mp3", "mp4", "m4a", "wav"]
MAX_FILE_SIZE_MB = 25