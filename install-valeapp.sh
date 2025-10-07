#!/bin/bash

# Script de instalação automatizada do VALEAPP
# Execute com: bash install-valeapp.sh

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

# Verificar se está na pasta correta
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" != "/var/www/VALEapp" ]]; then
    error "Execute este script na pasta /var/www/VALEapp"
    echo "Pasta atual: $CURRENT_DIR"
    echo "Execute: cd /var/www/VALEapp && bash install-valeapp.sh"
    exit 1
fi

log "Iniciando instalação do VALEAPP..."
log "Pasta atual: $CURRENT_DIR"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
log "Node.js versão: $NODE_VERSION"

# 1. Criar package.json
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
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
EOF

# 2. Criar vite.config.ts
log "Criando vite.config.ts..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  preview: {
    host: '0.0.0.0',
    port: 3000
  }
});
EOF

# 3. Criar tsconfig.json
log "Criando tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
EOF

# 4. Criar tsconfig.app.json
log "Criando tsconfig.app.json..."
cat > tsconfig.app.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOF

# 5. Criar tsconfig.node.json
log "Criando tsconfig.node.json..."
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
EOF

# 6. Criar tailwind.config.js
log "Criando tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOF

# 7. Criar postcss.config.js
log "Criando postcss.config.js..."
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

# 8. Criar index.html
log "Criando index.html..."
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VALEAPP - Sistema de Gerenciamento de Vales</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# 9. Criar src/main.tsx
log "Criando src/main.tsx..."
cat > src/main.tsx << 'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
EOF

# 10. Criar src/index.css
log "Criando src/index.css..."
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# 11. Criar src/App.tsx
log "Criando src/App.tsx..."
cat > src/App.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LoginForm } from './components/LoginForm';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { PasswordChangeForm } from './components/PasswordChangeForm';

interface User {
  id: string;
  cpf?: string;
  login?: string;
  name: string;
  department?: string;
  promax_unico?: string;
  isAdmin: boolean;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [employeeForPasswordChange, setEmployeeForPasswordChange] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('valeapp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('valeapp_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (cpfOrLogin: string, password: string) => {
    setErrorMessage('');
    
    console.log('🔍 Iniciando login...', {
      tipo: isAdminLogin ? 'Admin' : 'Funcionário',
      login: cpfOrLogin,
      ambiente: import.meta.env.MODE,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      domain: window.location.hostname
    });
    
    try {
      // Verificar se Supabase está configurado
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Configuração do banco de dados não encontrada. Entre em contato com o suporte.');
      }

      if (isAdminLogin) {
        // Admin login
        console.log('🔍 Tentando login admin com:', cpfOrLogin.trim());
        
        const { data: adminUser, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('login', cpfOrLogin.trim())
          .eq('is_active', true)
          .single();

        console.log('📊 Resultado da query admin:', { data: adminUser, error });

        if (error) {
          console.error('❌ Erro na query:', error);
          if (error.code === 'PGRST116') {
            throw new Error('Login não encontrado ou inativo. Verifique suas credenciais.');
          }
          throw new Error(`Erro de conexão: ${error.message}`);
        }

        console.log('🔐 Verificando senha...');
        // Check password client-side
        if (!adminUser.password || adminUser.password.trim() !== password.trim()) {
          console.log('❌ Senha incorreta');
          throw new Error('Login ou senha incorretos. Verifique suas credenciais.');
        }

        console.log('✅ Login admin bem-sucedido');
        const userData: User = {
          id: adminUser.id,
          login: adminUser.login,
          name: adminUser.name,
          isAdmin: true
        };

        setUser(userData);
        localStorage.setItem('valeapp_user', JSON.stringify(userData));
      } else {
        // Employee login
        console.log('👤 Tentando login de funcionário com CPF:', cpfOrLogin);
        
        const { data: employee, error } = await supabase
          .from('employees')
          .select('id, cpf, name, department, promax_unico, Senha, created_at')
          .eq('cpf', cpfOrLogin)
          .single();

        console.log('📊 Resultado da query funcionário:', { 
          found: !!employee, 
          error: error?.message,
          hasPassword: !!employee?.Senha,
          hasSenha: !!employee?.Senha
        });
        
        if (error) {
          console.error('❌ Erro na query funcionário:', error);
          if (error.code === 'PGRST116') {
            throw new Error('CPF não encontrado no sistema. Verifique se o CPF está correto.');
          }
          throw new Error(`Erro de conexão com o banco de dados: ${error.message}`);
        }

        console.log('🔐 Verificando credenciais do funcionário...');
        
        // Verificar se é primeiro login (campo Senha vazio/null)
        const hasPassword = employee.Senha && employee.Senha.trim() !== '';
        const isFirstLogin = !hasPassword;
        
        console.log('🔍 Status da senha:', {
          hasPassword,
          isFirstLogin,
          senhaValue: employee.Senha,
          senhaLength: employee.Senha?.length
        });
        
        let passwordMatch = false;
        
        if (isFirstLogin) {
          // Primeiro login: usar os 3 primeiros dígitos do CPF
          const firstThreeCpfDigits = cpfOrLogin.substring(0, 3);
          passwordMatch = firstThreeCpfDigits === password.trim();
          
          console.log('🔑 Verificação primeiro login:', {
            cpfDigits: firstThreeCpfDigits,
            passwordEntered: password.trim(),
            match: passwordMatch
          });
        } else {
          // Login subsequente: usar senha salva
          passwordMatch = employee.Senha.trim() === password.trim();
          
          console.log('🔑 Verificação login normal:', {
            savedPassword: employee.Senha.trim(),
            passwordEntered: password.trim(),
            match: passwordMatch
          });
        }
        
        if (!passwordMatch) {
          const errorMsg = isFirstLogin 
            ? 'CPF ou senha incorretos. No primeiro acesso, use os 3 primeiros dígitos do seu CPF como senha.'
            : 'CPF ou senha incorretos. Use a senha que você definiu anteriormente.';
          throw new Error(errorMsg);
        }

        // Verificar se é o primeiro login (não tem senha definida - precisa alterar senha)
        if (isFirstLogin) {
          console.log('🔐 Primeiro login detectado, redirecionando para alteração de senha');
          setEmployeeForPasswordChange(employee);
          setNeedsPasswordChange(true);
          return;
        }

        console.log('✅ Login de funcionário bem-sucedido');
        const userData: User = {
          id: employee.id,
          cpf: employee.cpf,
          name: employee.name,
          department: employee.department,
          promax_unico: employee.promax_unico,
          isAdmin: false
        };

        setUser(userData);
        localStorage.setItem('valeapp_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro no login');
      throw error;
    }
  };

  const handlePasswordChanged = () => {
    console.log('✅ Senha alterada com sucesso, redirecionando para login');
    setNeedsPasswordChange(false);
    setEmployeeForPasswordChange(null);
    setErrorMessage('');
    // Mostrar mensagem de sucesso
    setErrorMessage('Senha alterada com sucesso! Faça login com sua nova senha.');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('valeapp_user');
    setIsAdminLogin(false);
    setErrorMessage('');
    setNeedsPasswordChange(false);
    setEmployeeForPasswordChange(null);
  };

  const toggleAdminLogin = () => {
    console.log('toggleAdminLogin chamado, isAdminLogin atual:', isAdminLogin);
    setIsAdminLogin(!isAdminLogin);
    setErrorMessage('');
    console.log('toggleAdminLogin novo valor:', !isAdminLogin);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Show password change form if needed
  if (needsPasswordChange && employeeForPasswordChange) {
    return (
      <PasswordChangeForm
        employee={employeeForPasswordChange}
        onPasswordChanged={handlePasswordChanged}
      />
    );
  }

  if (!user) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onAdminLogin={toggleAdminLogin}
        errorMessage={errorMessage}
        isAdminLogin={isAdminLogin}
      />
    );
  }

  if (user.isAdmin) {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return <EmployeeDashboard user={user} onLogout={handleLogout} />;
}
EOF

# 12. Criar src/lib/supabase.ts
log "Criando src/lib/supabase.ts..."
cat > src/lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug para verificar se as variáveis estão sendo carregadas
console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ URL configurada' : '❌ URL não encontrada',
  key: supabaseAnonKey ? '✅ Key configurada' : '❌ Key não encontrada',
  env: import.meta.env.MODE,
  actualUrl: supabaseUrl,
  domain: window.location.hostname
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
EOF

# 13. Criar src/types/index.ts
log "Criando src/types/index.ts..."
cat > src/types/index.ts << 'EOF'
export interface User {
  id: string;
  cpf?: string;
  login?: string;
  name: string;
  department?: string;
  promax_unico?: string;
  isAdmin: boolean;
}

export interface AuthUser extends User {}

export interface Employee {
  id: string;
  cpf: string;
  name: string;
  department?: string;
  promax_unico: string;
  Senha?: string;
  created_at: string;
  Coditem_mapa?: string;
}

export interface Voucher {
  id: string;
  Data: string;
  Mapa: string;
  cod_cli?: string;
  Cliente?: string;
  Vale?: string;
  Emissão?: string;
  Item_TI?: string;
  Cód_Item?: string;
  Item: string;
  UN?: string;
  Qtde_Saída?: number;
  Avulsa?: string;
  Qtde_Retorno?: number;
  Avulsa2?: string;
  Qtde_Diferença: number;
  Avulsa3?: string;
  Valor: number;
  Conferente?: string;
  Coditem_mapa: string;
  Promax_unico: string;
  justification_type?: string;
  observations?: string;
  justified_at?: string;
  acao_transportadora: string;
  created_at: string;
  Medida?: string;
  justified_by_ip?: string;
  justified_by_device?: string;
  justified_by_location?: string;
  device_type?: string;
  screen_resolution?: string;
  timezone?: string;
}

export interface AdminUser {
  id: string;
  login: string;
  password: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}
EOF

# Criar arquivos de componentes (simplificados para o script)
log "Criando componentes básicos..."

# LoginForm básico
cat > src/components/LoginForm.tsx << 'EOF'
import React, { useState } from 'react';
import { User, Lock, Building2 } from 'lucide-react';

interface LoginFormProps {
  onLogin: (cpf: string, password: string) => Promise<void>;
  onAdminLogin: () => void;
  errorMessage?: string;
  isAdminLogin?: boolean;
}

export function LoginForm({ onLogin, onAdminLogin, errorMessage, isAdminLogin = false }: LoginFormProps) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loginValue = isAdminLogin ? cpf.trim() : cpf.replace(/\D/g, '');
    try {
      await onLogin(loginValue, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6">
            <div className="h-20 w-20 mx-auto bg-white rounded-full flex items-center justify-center">
              <Building2 className="h-12 w-12 text-teal-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">VALEAPP</h2>
          <p className="text-sm text-white font-medium">CDD CENTRO</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {isAdminLogin ? 'Login' : 'CPF'}
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <button
            type="button"
            onClick={onAdminLogin}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md"
          >
            {isAdminLogin ? 'Voltar' : 'Acesso Admin'}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
EOF

# Componentes básicos (versões simplificadas)
cat > src/components/PasswordChangeForm.tsx << 'EOF'
import React from 'react';

export function PasswordChangeForm({ employee, onPasswordChanged }: any) {
  return (
    <div className="min-h-screen bg-orange-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Alterar Senha</h2>
        <p>Funcionalidade em desenvolvimento...</p>
        <button 
          onClick={onPasswordChanged}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
EOF

cat > src/components/AdminDashboard.tsx << 'EOF'
import React from 'react';
import { LogOut } from 'lucide-react';

export function AdminDashboard({ user, onLogout }: any) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-teal-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-xl">VALEAPP - ADMIN</h1>
          <button onClick={onLogout} className="text-white flex items-center">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>
      </header>
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Olá, {user.name}</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Dashboard administrativo em desenvolvimento...</p>
        </div>
      </main>
    </div>
  );
}
EOF

cat > src/components/EmployeeDashboard.tsx << 'EOF'
import React from 'react';
import { LogOut } from 'lucide-react';

export function EmployeeDashboard({ user, onLogout }: any) {
  return (
    <div className="min-h-screen bg-teal-50">
      <header className="bg-teal-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-xl">VALEAPP</h1>
          <button onClick={onLogout} className="text-white flex items-center">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </button>
        </div>
      </header>
      <main className="p-8">
        <h2 className="text-2xl font-bold mb-4">Olá, {user.name}</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Dashboard do funcionário em desenvolvimento...</p>
        </div>
      </main>
    </div>
  );
}
EOF

# Criar arquivos de utilitários básicos
mkdir -p src/utils
cat > src/utils/deviceInfo.ts << 'EOF'
export const collectDeviceInfo = async () => {
  return {
    user_agent: navigator.userAgent,
    device_type: 'desktop',
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};
EOF

cat > src/utils/excelDateConverter.ts << 'EOF'
export const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) return 'Data inválida';
  try {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
};

export const convertExcelDateToISO = (excelDateString: string): string | null => {
  return new Date().toISOString().split('T')[0];
};
EOF

# 14. Criar ecosystem.config.js
log "Criando ecosystem.config.js..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'valeapp',
    script: 'npm',
    args: 'run start',
    cwd: '/var/www/VALEapp',
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
EOF

# 15. Criar .env.example
log "Criando .env.example..."
cat > .env.example << 'EOF'
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Ambiente
NODE_ENV=production
PORT=3000
EOF

# Instalar dependências
log "Instalando dependências do Node.js..."
npm install

# Verificar se instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    log "✅ Dependências instaladas com sucesso!"
else
    error "❌ Erro ao instalar dependências"
    exit 1
fi

# Verificar estrutura criada
log "Verificando estrutura criada..."
echo "📁 Estrutura do projeto:"
find . -type f -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.html" | head -20

log "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
info "📋 PRÓXIMOS PASSOS:"
echo "1. Criar arquivo .env com suas credenciais do Supabase:"
echo "   cp .env.example .env"
echo "   nano .env"
echo ""
echo "2. Fazer build da aplicação:"
echo "   npm run build"
echo ""
echo "3. Testar aplicação:"
echo "   npm run preview"
echo ""
echo "4. Configurar PM2 para produção:"
echo "   pm2 start ecosystem.config.js"
echo ""
log "🚀 VALEAPP pronto para uso!"