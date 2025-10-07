#!/bin/bash

echo "🚀 Iniciando deploy do VALEAPP..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute o script no diretório da aplicação."
    exit 1
fi

# Backup da versão atual
log "Fazendo backup da versão atual..."
if [ -d "dist" ]; then
    cp -r dist dist.backup.$(date +%Y%m%d_%H%M%S)
    log "Backup criado com sucesso"
fi

# Parar aplicação
log "Parando aplicação..."
pm2 stop valeapp 2>/dev/null || warning "Aplicação não estava rodando"

# Atualizar código (se usar git)
if [ -d ".git" ]; then
    log "Atualizando código do repositório..."
    git pull origin main || error "Falha ao atualizar código"
fi

# Instalar/atualizar dependências
log "Instalando dependências..."
npm install || {
    error "Falha ao instalar dependências"
    exit 1
}

# Fazer build
log "Fazendo build da aplicação..."
npm run build || {
    error "Falha no build da aplicação"
    exit 1
}

# Verificar se build foi criado
if [ ! -d "dist" ]; then
    error "Diretório dist não foi criado. Build falhou."
    exit 1
fi

# Reiniciar aplicação
log "Reiniciando aplicação..."
pm2 start ecosystem.config.js || pm2 restart valeapp || {
    error "Falha ao iniciar aplicação"
    exit 1
}

# Verificar status
sleep 3
if pm2 list | grep -q "valeapp.*online"; then
    log "✅ Deploy concluído com sucesso!"
    log "Aplicação está rodando em: http://localhost:3000"
    
    # Mostrar logs recentes
    log "Logs recentes:"
    pm2 logs valeapp --lines 10 --nostream
else
    error "❌ Deploy falhou! Aplicação não está online."
    pm2 logs valeapp --lines 20 --nostream
    exit 1
fi

log "🎉 VALEAPP deployado com sucesso!"