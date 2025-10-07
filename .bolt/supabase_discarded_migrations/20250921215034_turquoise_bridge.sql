/*
  # Criar funcionários de exemplo para teste

  1. Dados de Teste
    - Adiciona funcionários de exemplo incluindo MAXWEL
    - Cada funcionário tem CPF, nome, departamento e PROMAX_UNICO
  
  2. Estrutura
    - CPF sem formatação (apenas números)
    - PROMAX_UNICO usado para gerar a senha (sem primeiro dígito)
*/

-- Inserir funcionários de exemplo
INSERT INTO employees (cpf, name, department, promax_unico) VALUES
  ('12644800757', 'MAXWEL', 'Operações', '1396845'),
  ('11122233344', 'JOÃO SILVA', 'Logística', '2123456'),
  ('55566677788', 'MARIA SANTOS', 'Expedição', '3789012'),
  ('99988877766', 'PEDRO OLIVEIRA', 'Carregamento', '4567890')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir alguns vales de exemplo para MAXWEL
INSERT INTO vouchers (promax_unico, data, mapa, item, quantidade, valor, acao_transportadora) VALUES
  ('1396845', '15/01/2024', 'MAP001', 'Produto A', 5, 125.50, 'Sem ação'),
  ('1396845', '16/01/2024', 'MAP002', 'Produto B', 3, 89.75, 'Sem ação'),
  ('1396845', '17/01/2024', 'MAP003', 'Produto C', 2, 45.00, 'Sem ação')
ON CONFLICT (id) DO NOTHING;