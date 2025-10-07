# 🚀 Guia Completo de Deploy - VALEAPP

## 📋 **OPÇÕES DE DEPLOY**

### **1. 🖥️ VPS/Servidor Próprio (Recomendado)**
### **2. ☁️ Vercel/Netlify (Frontend apenas)**
### **3. 🐳 Docker (Containerizado)**

---

## 🖥️ **DEPLOY EM VPS/SERVIDOR**

### **📦 Pré-requisitos**
```bash
# Ubuntu 20.04+ ou CentOS 7+
# Node.js 18+
# Nginx
# PM2
# Certbot (SSL)
```

### **🔧 Instalação Automática**
```bash
# 1. Executar script de instalação
chmod +x install-valeapp.sh
sudo ./install-valeapp.sh

# 2. Configurar variáveis
nano .env
```

### **⚙️ Configuração Manual**

#### **1. Preparar Servidor**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar dependências
sudo apt install -y git nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

#### **2. Configurar Aplicação**
```bash
# Criar diretório
sudo mkdir -p /var/www/valeapp
sudo chown $USER:$USER /var/www/valeapp
cd /var/www/valeapp

# Copiar arquivos do projeto
# (todos os arquivos desta pasta)

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
nano .env
```

#### **3. Build e Deploy**
```bash
# Fazer build
npm run build

# Configurar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **4. Configurar Nginx**
```bash
# Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/valeapp
sudo ln -s /etc/nginx/sites-available/valeapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### **5. SSL com Let's Encrypt**
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

#### **6. Firewall**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## ☁️ **DEPLOY EM VERCEL**

### **📝 Configuração**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### **⚙️ Configurações Vercel**
```json
{
  "name": "valeapp",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-key"
  }
}
```

---

## 🐳 **DEPLOY COM DOCKER**

### **📄 Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

### **🐙 Docker Compose**
```yaml
version: '3.8'
services:
  valeapp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### **🚀 Executar**
```bash
# Build e run
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## 🔄 **SCRIPTS DE AUTOMAÇÃO**

### **📜 Deploy Automático**
```bash
# Usar script fornecido
chmod +x deploy.sh
./deploy.sh
```

### **🔄 Atualização Contínua**
```bash
# Cron job para atualizações
# crontab -e
0 2 * * * cd /var/www/valeapp && ./deploy.sh
```

---

## 📊 **MONITORAMENTO**

### **📈 PM2 Monitoring**
```bash
# Status
pm2 status

# Logs
pm2 logs valeapp

# Restart
pm2 restart valeapp

# Monitoramento web
pm2 plus
```

### **📋 Nginx Logs**
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### **🔍 Health Check**
```bash
# Verificar se aplicação está rodando
curl http://localhost:3000

# Verificar SSL
curl -I https://seu-dominio.com
```

---

## 🆘 **TROUBLESHOOTING**

### **❌ Problemas Comuns**

#### **Aplicação não inicia**
```bash
# Verificar logs
pm2 logs valeapp

# Verificar build
npm run build

# Verificar porta
netstat -tulpn | grep :3000
```

#### **Nginx 502 Bad Gateway**
```bash
# Verificar configuração
sudo nginx -t

# Verificar se app está rodando
pm2 status

# Restart services
sudo systemctl restart nginx
pm2 restart valeapp
```

#### **SSL não funciona**
```bash
# Renovar certificado
sudo certbot renew --dry-run

# Verificar configuração SSL
sudo nginx -t
```

#### **Banco não conecta**
```bash
# Verificar .env
cat .env

# Testar conexão
curl -I https://seu-projeto.supabase.co
```

---

## 📞 **SUPORTE PÓS-DEPLOY**

### **🔧 Manutenção Regular**
- Backup semanal dos dados
- Atualização mensal das dependências  
- Monitoramento de logs diário
- Renovação SSL automática

### **📈 Otimizações**
- CDN para assets estáticos
- Compressão Gzip
- Cache de browser
- Minificação adicional

### **🛡️ Segurança**
- Firewall configurado
- SSL/TLS atualizado
- Logs de acesso monitorados
- Backup regular

---

## ✅ **CHECKLIST FINAL**

- [ ] Aplicação rodando em produção
- [ ] SSL configurado e funcionando
- [ ] Banco de dados conectado
- [ ] PM2 configurado para restart automático
- [ ] Nginx configurado corretamente
- [ ] Firewall ativo
- [ ] Logs funcionando
- [ ] Backup configurado
- [ ] Domínio apontando corretamente
- [ ] Variáveis de ambiente configuradas

**🎉 Sistema pronto para uso em produção!**