import sqlite3

conn = sqlite3.connect('gestao_bdrs.db')

cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS bdrs (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE
    )
''')
print("Tabela de 'bdrs' criada ou já existente.")

cursor.execute(''' 
    CREATE TABLE IF NOT EXISTS analises (
    id INTEGER PRIMARY KEY,
    bdr_id INTEGER,
    data TEXT NOT NULL,
    resumo TEXT,
    metas TEXT,
    FOREIGN KEY (bdr_id) REFERENCES bdrs (id)
    )
''')

print("Tabela 'analises' criada ou já existente.")

cursor.execute('''
    CREATE TABLE IF NOT EXISTS cold_calls (
    id INTEGER PRIMARY KEY,
    bdr_id INTEGER,
    data TEXT NOT NULL,
    prospect_nome TEXT,
    prospect_empresa TEXT,
    -- Conversa Híbrida - 6 Etapas
    warmer_score INTEGER,
    reframe_score INTEGER,
    rational_drowning_score INTEGER,
    emotional_impact_score INTEGER,
    new_way_score INTEGER,
    your_solution_score INTEGER,
    -- Analysis Content
    analise_completa TEXT,
    pontos_atencao TEXT,
    recomendacoes TEXT,
    insight_comercial TEXT,
    FOREIGN KEY (bdr_id) REFERENCES bdrs (id)
    )
''')

print("Tabela 'cold_calls' criada ou já existente.")

conn.commit()
conn.close()

print("\nBanco de dados 'gestao_bdrs.db' configurado com sucesso!")