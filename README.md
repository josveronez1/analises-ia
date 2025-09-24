# 🎯 Sistema de Análise para BDRs

Sistema completo para análise de Cold Calls e reuniões 1:1 com metodologia Conversa Híbrida, desenvolvido com Streamlit e IA.

## 🚀 Funcionalidades

### 📞 Análise de Cold Calls - Conversa Híbrida
- **Metodologia Conversa Híbrida** (6 etapas)
- **Análise bilíngue** (Português/Inglês)
- **Gráficos de radar** para visualizar performance
- **Scores detalhados** por etapa da conversa
- **Insights comerciais** personalizados

### 🎯 Análise de Reuniões 1:1
- **Transcrição automática** com Whisper
- **Análise com GPT-4** para insights
- **Resumos estruturados** das reuniões
- **Metas e próximos passos** definidos

### 👥 Gerenciamento de BDRs
- **CRUD completo** de BDRs
- **Histórico de análises** por BDR
- **Dashboard de performance** com métricas
- **Comparação visual** entre BDRs

## 🛠️ Tecnologias

- **Streamlit** - Interface web
- **OpenAI GPT-4** - Análise de conteúdo
- **Whisper** - Transcrição de áudio
- **SQLite** - Banco de dados
- **Matplotlib** - Gráficos de radar
- **Python** - Backend

## 🔒 Segurança

- ✅ Validação de entrada de dados
- ✅ Proteção contra SQL Injection
- ✅ Proteção contra XSS
- ✅ Sanitização de dados
- ✅ Validação de arquivos de upload
- ✅ Variáveis de ambiente para API keys

## 📋 Pré-requisitos

- Python 3.8+
- Chave da API OpenAI
- Streamlit

## 🚀 Instalação

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd analise-1-1
```

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Configure as variáveis de ambiente:**
```bash
# Crie um arquivo .env na raiz do projeto
OPENAI_API_KEY=sua_chave_aqui
```

4. **Execute o aplicativo:**
```bash
streamlit run app.py
```

## 📁 Estrutura do Projeto

```
analise-1-1/
├── app.py                 # Aplicação principal
├── config.py              # Configurações
├── database.py            # Funções do banco de dados
├── utils.py               # Funções auxiliares
├── database_setup.py      # Setup do banco
├── requirements.txt       # Dependências
├── .env                   # Variáveis de ambiente (não commitado)
├── .gitignore            # Arquivos ignorados pelo Git
└── pages/                # Páginas do Streamlit
    ├── 1_Analisar_Cold_Calls.py
    ├── 2_Analisar_1x1s.py
    ├── 3_Gerenciar_Cold_Calls.py
    └── 4_Gerenciar_BDRs.py
```

## 🎯 Como Usar

1. **Cadastre seus BDRs** na página "Gerenciar BDRs"
2. **Analise Cold Calls** com metodologia Conversa Híbrida
3. **Analise reuniões 1:1** para extrair insights
4. **Acompanhe a performance** nos dashboards
5. **Desenvolva insights comerciais** para cada persona

## 🔧 Configuração para Deploy

### Streamlit Cloud
1. Conecte seu repositório GitHub ao Streamlit Cloud
2. Configure a variável de ambiente `OPENAI_API_KEY`
3. Deploy automático!

### Variáveis de Ambiente Necessárias
- `OPENAI_API_KEY` - Sua chave da API OpenAI

## 📊 Metodologia Conversa Híbrida

O sistema utiliza a metodologia Conversa Híbrida, que combina SPIN Selling e The Challenger Sale em 6 etapas:

1. **Warmer** (Aquecimento)
2. **Reframe** (Reenquadramento)
3. **Rational Drowning** (Afogamento Racional)
4. **Emotional Impact** (Impacto Emocional)
5. **New Way** (Novo Caminho)
6. **Your Solution** (Sua Solução)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através dos issues do GitHub.

---

**Desenvolvido com ❤️ para otimizar a performance de BDRs**
