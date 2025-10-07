/*
  # Criar usuário administrador padrão

  1. Verificação e Criação
    - Verifica se existe pelo menos um admin ativo
    - Se não existir, cria um admin padrão
  
  2. Dados do Admin Padrão
    - Login: admin
    - Senha: admin123
    - Nome: Administrador
    - Status: Ativo
*/

-- Inserir admin padrão apenas se não existir nenhum admin ativo
INSERT INTO admin_users (login, password, name, is_active)
SELECT 'admin', 'admin123', 'Administrador', true
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE is_active = true
);

-- Garantir que existe pelo menos um admin ativo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE is_active = true) THEN
    INSERT INTO admin_users (login, password, name, is_active)
    VALUES ('admin', 'admin123', 'Administrador', true);
    
    RAISE NOTICE 'Admin padrão criado: login=admin, senha=admin123';
  ELSE
    RAISE NOTICE 'Admin já existe no sistema';
  END IF;
END $$;