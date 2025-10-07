import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PasswordChangeFormProps {
  employee: {
    id: string;
    name: string;
    cpf: string;
    promax_unico: string;
  };
  onPasswordChanged: () => void;
}

export function PasswordChangeForm({ employee, onPasswordChanged }: PasswordChangeFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidPassword = (password: string) => {
    return /^[0-9]{6}$/.test(password);
  };

  const isFormValid = 
    isValidPassword(newPassword) && 
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('Por favor, verifique se as senhas são iguais e têm 6 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          Senha: newPassword.trim()
        })
        .eq('id', employee.id);

      if (updateError) {
        throw updateError;
      }

      onPasswordChanged();
    } catch (error) {
      setError(
        error instanceof Error 
          ? `Erro ao alterar senha: ${error.message}` 
          : 'Erro ao alterar senha. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setNewPassword(numericValue);
    setError('');
  };

  const handleConfirmPasswordChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setConfirmPassword(numericValue);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center p-4">
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
          <h2 className="text-3xl font-bold text-white">Primeira Alteração de Senha</h2>
          <p className="text-sm text-white font-medium">VALEAPP - LOG20 LOGÍSTICA</p>
          <p className="mt-2 text-orange-200">
            Olá, {employee.name}
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">🔐 Primeiro Acesso</p>
                <p>
                  Por segurança, você deve criar uma nova senha de 6 dígitos numéricos 
                  para acessar o sistema.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha (6 dígitos numéricos)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    newPassword && !isValidPassword(newPassword)
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {newPassword && !isValidPassword(newPassword) && (
                <p className="mt-1 text-sm text-red-600">
                  A senha deve ter exatamente 6 dígitos numéricos
                </p>
              )}
              {newPassword && isValidPassword(newPassword) && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Senha válida
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  As senhas não coincidem
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && isValidPassword(newPassword) && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Senhas coincidem
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-colors ${
                isFormValid && !loading
                  ? 'text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                  : 'text-gray-500 bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Alterando Senha...
                </div>
              ) : (
                'Alterar Senha'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}