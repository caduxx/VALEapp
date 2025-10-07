/*
  # Criar tabela de usuários administrativos

  1. Nova Tabela
    - `admin_users`
      - `id` (uuid, primary key)
      - `login` (text, unique) - CPF do usuário
      - `password` (text) - Senha (em produção usar hash)
      - `name` (text) - Nome do usuário
      - `is_active` (boolean) - Status ativo/inativo
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `admin_users`
    - Política para permitir acesso público (temporário para desenvolvimento)

  3. Dados iniciais
    - Inserir usuário administrativo padrão
*/

-- Criar tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso público (desenvolvimento)
CREATE POLICY "Allow public access to admin_users"
  ON admin_users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Inserir usuário administrativo padrão
INSERT INTO admin_users (login, password, name) 
VALUES ('08091624743', '31195', 'Administrador Principal')
ON CONFLICT (login) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_users_login ON admin_users (login);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users (is_active);