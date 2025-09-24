import matplotlib.pyplot as plt
import numpy as np
from math import pi

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
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    fig.patch.set_facecolor('#1a1a1a')  # Fundo escuro
    ax.set_facecolor('#1a1a1a')
    
    # Plotar o radar chart
    ax.plot(angles, values, 'o-', linewidth=3, color='#00ffff', label=title)
    ax.fill(angles, values, alpha=0.25, color='#00ffff')
    
    # Configurar eixos
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=11, color='white')
    
    # Configurar escala radial
    ax.set_ylim(0, 10)
    ax.set_yticks([0, 2, 4, 6, 8, 10])
    ax.set_yticklabels(['0', '2', '4', '6', '8', '10'], fontsize=9, color='white')
    ax.grid(True, color='#333333', alpha=0.3)
    
    # Adicionar valores nos pontos
    for angle, value, category in zip(angles[:-1], values[:-1], categories):
        ax.text(angle, value + 0.5, str(value), 
                horizontalalignment='center', 
                verticalalignment='center',
                fontsize=10, 
                color='white',
                weight='bold')
    
    # Título
    plt.title(title, size=18, color='white', weight='bold', pad=20)
    
    # Remover bordas
    ax.spines['polar'].set_visible(False)
    
    plt.tight_layout()
    return fig

def validate_audio_file(audio_file):
    """Valida se o arquivo de áudio é válido."""
    if audio_file is None:
        return False, "Nenhum arquivo selecionado"
    
    # Verificar se o arquivo tem nome
    if not audio_file.name or audio_file.name.strip() == "":
        return False, "Nome do arquivo inválido"
    
    # Verificar tipo de arquivo
    file_extension = audio_file.name.split('.')[-1].lower()
    if file_extension not in ['mp3', 'mp4', 'm4a', 'wav']:
        return False, "Tipo de arquivo não suportado. Use: mp3, mp4, m4a ou wav"
    
    # Verificar tamanho (25MB máximo)
    max_size = 25 * 1024 * 1024  # 25MB em bytes
    if audio_file.size > max_size:
        return False, f"Arquivo muito grande ({audio_file.size / (1024*1024):.1f}MB). Máximo 25MB"
    
    # Verificar se o arquivo não está vazio
    if audio_file.size == 0:
        return False, "Arquivo está vazio"
    
    # Verificar se o nome do arquivo não contém caracteres perigosos
    dangerous_chars = ['..', '/', '\\', '<', '>', ':', '"', '|', '?', '*']
    if any(char in audio_file.name for char in dangerous_chars):
        return False, "Nome do arquivo contém caracteres inválidos"
    
    return True, "Arquivo válido"

def validate_input_text(text, field_name, max_length=1000):
    """Valida texto de entrada do usuário."""
    if not text or text.strip() == "":
        return False, f"{field_name} não pode estar vazio"
    
    if len(text) > max_length:
        return False, f"{field_name} muito longo. Máximo {max_length} caracteres"
    
    # Verificar caracteres perigosos para SQL injection e XSS
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '--', '/*', '*/', 'xp_', 'sp_', 'exec', 'select', 'insert', 'update', 'delete', 'drop', 'create', 'alter', 'union', 'script', 'javascript', 'vbscript', 'onload', 'onerror', 'onclick']
    
    text_lower = text.lower()
    for char in dangerous_chars:
        if char in text_lower:
            return False, f"{field_name} contém caracteres ou palavras inválidas: '{char}'"
    
    # Verificar se contém apenas caracteres alfanuméricos, espaços, acentos e alguns símbolos seguros
    import re
    if not re.match(r'^[a-zA-Z0-9\sáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ\-\.\,\!\?\(\)]+$', text):
        return False, f"{field_name} contém caracteres não permitidos. Use apenas letras, números, espaços e acentos"
    
    return True, "Texto válido"