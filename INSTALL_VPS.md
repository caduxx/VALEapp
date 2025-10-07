# 🚀 Guia de Instalação Manual no VPS

## 📋 **PRÉ-REQUISITOS**

### **No seu VPS:**
- Ubuntu 20.04+ ou CentOS 7+
- Node.js 18+ 
- npm ou yarn
- Git
- Nginx (para proxy reverso)
- PM2 (para gerenciar processos)
- Certbot (para SSL)

## 🔧 **PASSO 1: PREPARAR O SERVIDOR**

### **Atualizar sistema:**
```bash
sudo apt update && sudo apt upgrade -y
```

### **Instalar Node.js 18:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **Instalar dependências:**
```bash
sudo apt install -y git nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

## 📁 **PASSO 2: BAIXAR O CÓDIGO**

### **Criar diretório:**
```bash
sudo mkdir -p /var/www/valeapp
sudo chown $USER:$USER /var/www/valeapp
cd /var/www/valeapp
```

### **Clonar código (se tiver repositório):**
```bash
git clone [SEU_REPOSITORIO] .
```

### **OU criar estrutura manualmente:**
```bash
mkdir -p src/{components,lib,utils,types}
mkdir -p public
```

## 🔑 **PASSO 3: CONFIGURAR VARIÁVEIS**

### **Criar arquivo .env:**
```bash
nano .env
```

### **Conteúdo do .env:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
NODE_ENV=production
PORT=3000
```

## 📦 **PASSO 4: INSTALAR DEPENDÊNCIAS**

### **Criar package.json:**
```json
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
```

### **Instalar:**
```bash
npm install
```

## 🏗️ **PASSO 5: BUILD DA APLICAÇÃO**

### **Fazer build:**
```bash
npm run build
```

### **Testar localmente:**
```bash
npm run preview
```

## ⚙️ **PASSO 6: CONFIGURAR PM2**

### **Criar ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'valeapp',
    script: 'npm',
    args: 'run start',
    cwd: '/var/www/valeapp',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### **Iniciar com PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 **PASSO 7: CONFIGURAR NGINX**

### **Criar configuração:**
```bash
sudo nano /etc/nginx/sites-available/valeapp
```

### **Conteúdo do Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Ativar site:**
```bash
sudo ln -s /etc/nginx/sites-available/valeapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 **PASSO 8: CONFIGURAR SSL**

### **Obter certificado:**
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## 🔥 **PASSO 9: CONFIGURAR FIREWALL**

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📊 **PASSO 10: MONITORAMENTO**

### **Comandos úteis:**
```bash
# Ver logs da aplicação
pm2 logs valeapp

# Status dos processos
pm2 status

# Reiniciar aplicação
pm2 restart valeapp

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 **SCRIPT DE DEPLOY AUTOMÁTICO**

### **Criar deploy.sh:**
```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."

# Parar aplicação
pm2 stop valeapp

# Atualizar código (se usar git)
git pull origin main

# Instalar dependências
npm install

# Fazer build
npm run build

# Reiniciar aplicação
pm2 start valeapp

echo "✅ Deploy concluído!"
```

### **Tornar executável:**
```bash
chmod +x deploy.sh
```

## 🎯 **ESTRUTURA FINAL:**

```
/var/www/valeapp/
├── src/
│   ├── components/
│   ├── lib/
│   ├── utils/
│   └── types/
├── public/
├── dist/ (após build)
├── .env
├── package.json
├── ecosystem.config.js
└── deploy.sh
```

## ✅ **VERIFICAÇÕES FINAIS:**

1. **Aplicação rodando:** `pm2 status`
2. **Nginx funcionando:** `sudo systemctl status nginx`
3. **SSL ativo:** Acesse https://seu-dominio.com
4. **Logs limpos:** `pm2 logs valeapp`

## 🆘 **TROUBLESHOOTING:**

### **Aplicação não inicia:**
```bash
pm2 logs valeapp
npm run build
```

### **Nginx erro 502:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### **SSL não funciona:**
```bash
sudo certbot renew --dry-run
```

## 📞 **SUPORTE:**

Se precisar de ajuda com algum passo específico, me informe qual erro está encontrando!