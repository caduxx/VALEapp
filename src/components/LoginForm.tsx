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

  const formatCPF = (value: string) => {
    if (isAdminLogin) return value;
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = isAdminLogin ? value : formatCPF(value);
    setCpf(formatted);
  };

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
            <div className="mx-auto">
              <img 
                src="/logo copy copy copy.png" 
                alt="LOG20 Logística" 
                className="h-20 w-auto mx-auto"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">VALEAPP</h2>
          <p className="text-sm text-white font-medium">LOG20 LOGÍSTICA</p>
          <p className="mt-2 text-orange-300">
            {isAdminLogin ? 'Acesso Administrativo' : 'Sistema de Gerenciamento de Vales'}
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                {isAdminLogin ? 'Login' : 'CPF'}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="cpf"
                  type="text"
                  value={cpf}
                  onChange={handleCPFChange}
                  maxLength={isAdminLogin ? 20 : 14}
                  placeholder={isAdminLogin ? "Digite seu login" : "000.000.000-00"}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {isAdminLogin ? 'Senha' : 'PROMAX'}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={isAdminLogin ? 50 : 6}
                  placeholder={isAdminLogin ? "Digite sua senha" : "Senha de 6 dígitos"}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={onAdminLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
            >
              {isAdminLogin ? '← Voltar ao Login Normal' : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Acesso Administrativo
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
          <p className="font-medium mb-1">🔐 Primeiro Acesso</p>
          <p className="text-sm">
            <strong>Primeiro acesso:</strong> Use os 3 primeiros dígitos do seu CPF como senha.<br/>
            <strong>Acessos seguintes:</strong> Use a senha de 6 dígitos que você definiu.
          </p>
        </div>
      </div>
    </div>
  );
}