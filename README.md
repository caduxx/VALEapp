# 🚀 VALEAPP - Sistema de Gerenciamento de Vales
## LOG20 Logística

Sistema completo para gerenciamento de vales de funcionários com interface web moderna e banco de dados Supabase.

## 📋 **CARACTERÍSTICAS**

### **🔐 Autenticação**
- Login de funcionários com CPF e senha
- Login administrativo separado
- Primeiro acesso com alteração obrigatória de senha
- Sistema de sessões seguro

### **👤 Dashboard do Funcionário**
- Visualização dos próprios vales
- Justificativa de vales pendentes
- Filtros e busca avançada
- Coleta automática de geolocalização
- Rastreamento de dispositivo

### **🛠️ Painel Administrativo**
- Dashboard com estatísticas completas
- Gerenciamento de funcionários
- Importação de vales via Excel
- Exportação de dados
- Limpeza automática da base
- Links para Google Sheets e Looker Studio

### **📊 Recursos Técnicos**
- Interface responsiva (mobile-first)
- Cores da identidade LOG20 (azul e laranja)
- Geolocalização robusta (GPS + IP fallback)
- Conversão automática de datas Excel
- Sistema de logs detalhado

## 🔧 **TECNOLOGIAS**

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Banco:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Excel:** XLSX.js
- **Deploy:** PM2 + Nginx

## 📁 **ESTRUTURA DO PROJETO**

```
valeapp/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AdminDashboard.tsx
│   │   ├── EmployeeDashboard.tsx
│   │   ├── LoginForm.tsx
│   │   └── PasswordChangeForm.tsx
│   ├── lib/
│   │   └── supabase.ts     # Cliente Supabase
│   ├── utils/              # Utilitários
│   │   ├── deviceInfo.ts
│   │   ├── geolocation.ts
│   │   └── excelDateConverter.ts
│   ├── types/
│   │   └── index.ts        # Tipos TypeScript
│   ├── App.tsx             # Componente principal
│   ├── main.tsx           # Entry point
│   └── index.css          # Estilos globais
├── public/
│   └── logo copy copy copy.png  # Logo LOG20
├── supabase/
│   └── migrations/        # Migrações do banco
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── ecosystem.config.js    # Configuração PM2
├── deploy.sh             # Script de deploy
└── README.md
```

## 🚀 **INSTALAÇÃO LOCAL**

### **1. Pré-requisitos**
```bash
# Node.js 18+
node --version

# npm ou yarn
npm --version
```

### **2. Clonar e instalar**
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase
```

### **3. Configurar Supabase**
```bash
# No arquivo .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### **4. Executar**
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🌐 **DEPLOY EM PRODUÇÃO**

### **VPS/Servidor**
```bash
# 1. Copiar arquivos para servidor
scp -r . usuario@servidor:/var/www/valeapp/

# 2. No servidor
cd /var/www/valeapp
npm install
npm run build

# 3. Configurar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 4. Configurar Nginx (ver nginx.conf)
sudo systemctl reload nginx
```

### **SSL com Let's Encrypt**
```bash
sudo certbot --nginx -d seu-dominio.com
```

## 📊 **BANCO DE DADOS**

### **Tabelas Principais**
- `employees` - Funcionários
- `admin_users` - Administradores  
- `vouchers` - Vales ativos
- `vales_justificados` - Vales justificados (permanente)

### **Recursos de Segurança**
- Row Level Security (RLS) habilitado
- Políticas de acesso por usuário
- Índices otimizados
- Backup automático

## 🔐 **CREDENCIAIS PADRÃO**

### **Admin**
- Login: `admin`
- Senha: `123456`

### **Funcionário (Primeiro Acesso)**
- CPF: Qualquer CPF cadastrado
- Senha: 3 primeiros dígitos do CPF

## 📱 **USO DO SISTEMA**

### **Funcionário**
1. Login com CPF
2. Primeiro acesso: usar 3 primeiros dígitos do CPF
3. Definir nova senha de 6 dígitos
4. Visualizar vales pendentes
5. Justificar vales necessários

### **Administrador**
1. Login com credenciais admin
2. Dashboard com estatísticas
3. Importar vales via Excel
4. Gerenciar funcionários
5. Fazer limpeza da base

## 🛠️ **MANUTENÇÃO**

### **Logs**
```bash
# Ver logs da aplicação
pm2 logs valeapp

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
```

### **Backup**
```bash
# Backup do banco (Supabase faz automaticamente)
# Backup dos arquivos
tar -czf valeapp-backup.tar.gz /var/www/valeapp/
```

### **Atualização**
```bash
# Usar script de deploy
./deploy.sh
```

## 🆘 **SUPORTE**

### **Problemas Comuns**
1. **Erro de conexão Supabase**: Verificar .env
2. **Vales não aparecem**: Verificar PROMAX_UNICO
3. **Login não funciona**: Verificar RLS policies
4. **Import falha**: Verificar formato Excel

### **Contato**
- Sistema desenvolvido para LOG20 Logística
- Versão: 1.0.0
- Data: 2025

## 📄 **LICENÇA**

Sistema proprietário - LOG20 Logística
Todos os direitos reservados.