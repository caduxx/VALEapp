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
            : 'CPF ou senha incorretos. Use a senha de 6 dígitos que você definiu anteriormente.';
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