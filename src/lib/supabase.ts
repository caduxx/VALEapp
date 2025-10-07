import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

// Debug para verificar se as variáveis estão sendo carregadas
console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? '✅ URL configurada' : '❌ URL não encontrada',
  key: supabaseAnonKey ? '✅ Key configurada' : '❌ Key não encontrada',
  env: import.meta.env.MODE,
  actualUrl: supabaseUrl,
  domain: window.location.hostname
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  throw new Error('Supabase URL e ANON_KEY são obrigatórios')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)