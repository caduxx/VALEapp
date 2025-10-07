import { supabase } from '../lib/supabase';

export interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const runSupabaseDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  // 1. Verificar variáveis de ambiente
  console.log('🔍 Iniciando diagnósticos do Supabase...');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  results.push({
    test: 'Variáveis de Ambiente',
    status: (supabaseUrl && supabaseKey) ? 'success' : 'error',
    message: (supabaseUrl && supabaseKey) 
      ? 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY configuradas'
      : 'Variáveis de ambiente não encontradas',
    details: {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'não encontrada'
    }
  });

  // 2. Teste de conectividade básica
  try {
    console.log('🌐 Testando conectividade básica...');
    const { data, error } = await supabase.from('employees').select('count').limit(1);
    
    results.push({
      test: 'Conectividade Básica',
      status: error ? 'error' : 'success',
      message: error ? `Erro de conexão: ${error.message}` : 'Conexão estabelecida com sucesso',
      details: { error: error?.message, data }
    });
  } catch (error) {
    results.push({
      test: 'Conectividade Básica',
      status: 'error',
      message: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error }
    });
  }

  // 3. Teste de acesso à tabela employees
  try {
    console.log('👥 Testando acesso à tabela employees...');
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, cpf')
      .limit(1);

    results.push({
      test: 'Acesso Tabela Employees',
      status: error ? 'error' : 'success',
      message: error 
        ? `Erro ao acessar tabela employees: ${error.message}`
        : `Tabela employees acessível (${data?.length || 0} registros encontrados)`,
      details: { error: error?.message, recordCount: data?.length }
    });
  } catch (error) {
    results.push({
      test: 'Acesso Tabela Employees',
      status: 'error',
      message: `Erro ao consultar employees: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error }
    });
  }

  // 4. Teste de acesso à tabela admin_users
  try {
    console.log('🔐 Testando acesso à tabela admin_users...');
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, name, login')
      .limit(1);

    results.push({
      test: 'Acesso Tabela Admin Users',
      status: error ? 'error' : 'success',
      message: error 
        ? `Erro ao acessar tabela admin_users: ${error.message}`
        : `Tabela admin_users acessível (${data?.length || 0} registros encontrados)`,
      details: { error: error?.message, recordCount: data?.length }
    });
  } catch (error) {
    results.push({
      test: 'Acesso Tabela Admin Users',
      status: 'error',
      message: `Erro ao consultar admin_users: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error }
    });
  }

  // 5. Teste de RLS (Row Level Security)
  try {
    console.log('🛡️ Testando políticas RLS...');
    const { data, error } = await supabase
      .from('employees')
      .select('cpf')
      .eq('cpf', '00000000000'); // CPF que provavelmente não existe

    results.push({
      test: 'Políticas RLS',
      status: error ? 'warning' : 'success',
      message: error 
        ? `RLS pode estar bloqueando acesso: ${error.message}`
        : 'RLS funcionando corretamente',
      details: { error: error?.message }
    });
  } catch (error) {
    results.push({
      test: 'Políticas RLS',
      status: 'warning',
      message: `Erro ao testar RLS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error }
    });
  }

  console.log('✅ Diagnósticos concluídos:', results);
  return results;
};

export const testSpecificLogin = async (cpf: string): Promise<DiagnosticResult> => {
  try {
    console.log(`🔍 Testando login específico para CPF: ${cpf}`);
    
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, cpf, promax_unico, Senha')
      .eq('cpf', cpf)
      .single();

    if (error) {
      return {
        test: `Login Test - CPF ${cpf}`,
        status: 'error',
        message: `Erro ao buscar funcionário: ${error.message}`,
        details: { error: error.message, code: error.code }
      };
    }

    return {
      test: `Login Test - CPF ${cpf}`,
      status: 'success',
      message: `Funcionário encontrado: ${data.name}`,
      details: {
        id: data.id,
        name: data.name,
        hasPassword: !!data.Senha,
        hasPromax: !!data.promax_unico,
        passwordLength: data.Senha?.length,
        promaxLength: data.promax_unico?.length
      }
    };
  } catch (error) {
    return {
      test: `Login Test - CPF ${cpf}`,
      status: 'error',
      message: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: { error }
    };
  }
};