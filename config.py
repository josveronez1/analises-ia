import os

DATABASE_PATH = "gestao_bdrs.db"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Validar se a API key está configurada
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY não está configurada. Configure a variável de ambiente ou crie um arquivo .env")

PAGE_CONFIG = {
    "page_title": "Sistema de Análise para BDRs",
    "page_icon": "🎯",
    "layout": "wide"
}

ALLOWED_AUDIO_TYPES = ["mp3", "mp4", "m4a", "wav"]
MAX_FILE_SIZE_MB = 25