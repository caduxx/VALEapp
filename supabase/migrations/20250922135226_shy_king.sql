/*
  # Inserir usuário administrativo padrão

  1. Dados do Admin
    - Login: 08091624743
    - Senha: 31195
    - Nome: Administrador
    - Status: Ativo

  2. Segurança
    - Usuário padrão para acesso inicial
    - Pode criar outros usuários após login
*/

-- Inserir usuário administrativo padrão
INSERT INTO admin_users (login, password, name, is_active) 
VALUES ('08091624743', '31195', 'Administrador', true)
ON CONFLICT (login) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = now();