#!/bin/bash

# Script de Deploy para AWS EC2
echo "🚀 Iniciando deploy da aplicação..."

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🗄️ Gerando cliente Prisma..."
npx prisma generate

# Fazer push do schema para o banco
echo "🔄 Atualizando banco de dados..."
npx prisma db push

# Build da aplicação
echo "🔨 Fazendo build da aplicação..."
npm run build

# Reiniciar aplicação com PM2
echo "🔄 Reiniciando aplicação..."
pm2 restart ecosystem.config.js

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Aplicação rodando em: http://localhost:3000"
