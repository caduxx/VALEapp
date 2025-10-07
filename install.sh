#!/bin/bash

# Script de instalação automática do VALEAPP no VPS
# Execute com: bash install.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Banner
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    VALEAPP - INSTALADOR VPS                 ║"
echo "║                  Sistema de Gerenciamento de Vales          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se é root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
   exit 1
fi

# Verificar sistema operacional
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    error "Este script é apenas para sistemas Linux"
    exit 1
fi

# Solicitar informações
echo ""
info "Configuração inicial:"
read -p "Digite o domínio (ex: valeapp.com.br): " DOMAIN
read -p "Digite o email para SSL (ex: admin@empresa.com): " EMAIL
read -p "URL do Supabase: " SUPABASE_URL
read -p "Chave anônima do Supabase: " SUPABASE_KEY

# Confirmar informações
echo ""
info "Configurações:"
echo "Domínio: $DOMAIN"
echo "Email: $EMAIL"
echo "Supabase URL: $SUPABASE_URL"
echo ""
read -p "Confirma as informações? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Instalação cancelada"
    exit 1
fi

# Atualizar sistema
log "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
log "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versão do Node
NODE_VERSION=$(node --version)
log "Node.js instalado: $NODE_VERSION"

# Instalar dependências do sistema
log "Instalando dependências do sistema..."
sudo apt install -y git nginx certbot python3-certbot-nginx ufw

# Instalar PM2
log "Instalando PM2..."
sudo npm install -g pm2

# Criar diretório da aplicação
log "Criando diretório da aplicação..."
sudo mkdir -p /var/www/valeapp
sudo chown $USER:$USER /var/www/valeapp
cd /var/www/valeapp

# Criar estrutura de diretórios
log "Criando estrutura de diretórios..."
mkdir -p src/{components,lib,utils,types}
mkdir -p public

# Criar arquivo .env
log "Criando arquivo de configuração..."
cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY
NODE_ENV=production
PORT=3000
EOF

# Criar package.json
log "Criando package.json..."
cat > package.json << 'EOF'
{
  "name": "valeapp-vps",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 3000 --host 0.0.0.0",
    "start": "npm run preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2"
  }
}
EOF

# Configurar Nginx
log "Configurando Nginx..."
sudo tee /etc/nginx/sites-available/valeapp > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    access_log /var/log/nginx/valeapp_access.log;
    error_log /var/log/nginx/valeapp_error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site no Nginx
sudo ln -sf /etc/nginx/sites-available/valeapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Configurar firewall
log "Configurando firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Configurar SSL
log "Configurando SSL com Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Criar diretório de logs para PM2
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

log "✅ Instalação base concluída!"
echo ""
warning "PRÓXIMOS PASSOS:"
echo "1. Copie todos os arquivos do código fonte para /var/www/valeapp/"
echo "2. Execute: cd /var/www/valeapp && npm install"
echo "3. Execute: npm run build"
echo "4. Execute: pm2 start ecosystem.config.js"
echo "5. Execute: pm2 save && pm2 startup"
echo ""
info "Sua aplicação estará disponível em: https://$DOMAIN"
echo ""
log "🎉 Instalação concluída com sucesso!"