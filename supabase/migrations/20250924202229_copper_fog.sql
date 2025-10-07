/*
  # Criar usuário administrador padrão

  1. Novo usuário admin
    - Login: admin
    - Senha: admin123
    - Nome: CARLOS EDUARDO CUNHA
    - Status: ativo

  2. Segurança
    - Usuário ativo por padrão
    - Timestamps atualizados
*/

-- Inserir usuário administrador padrão
INSERT INTO admin_users (login, password, name, is_active, created_at, updated_at)
VALUES ('admin', 'admin123', 'CARLOS EDUARDO CUNHA', true, now(), now())
ON CONFLICT (login) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = now();