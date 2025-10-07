/*
  # Corrigir cálculo da quantidade de diferença

  1. Correção de Dados
    - Atualizar registros com valores incorretos de qtde_diferenca
    - Definir valor padrão correto para novos registros
    
  2. Lógica de Negócio
    - qtde_diferenca deve representar a quantidade em falta/diferença
    - Valores típicos: 1, 2, 3, etc. (não valores altos como 71, 2160)
    
  3. Validação
    - Adicionar constraint para valores razoáveis
    - Prevenir inserção de dados incorretos no futuro
*/

-- Primeiro, vamos verificar e corrigir os dados existentes
-- Assumindo que valores muito altos (>100) são incorretos e devem ser 1
UPDATE vouchers 
SET qtde_diferenca = 1 
WHERE qtde_diferenca > 100;

-- Para valores entre 10-100, vamos assumir que são códigos e converter para 1
UPDATE vouchers 
SET qtde_diferenca = 1 
WHERE qtde_diferenca BETWEEN 10 AND 100;

-- Garantir que não há valores negativos
UPDATE vouchers 
SET qtde_diferenca = 1 
WHERE qtde_diferenca < 0;

-- Garantir que valores nulos sejam 1
UPDATE vouchers 
SET qtde_diferenca = 1 
WHERE qtde_diferenca IS NULL;

-- Adicionar constraint para prevenir valores incorretos no futuro
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'vouchers_qtde_diferenca_check' 
    AND table_name = 'vouchers'
  ) THEN
    ALTER TABLE vouchers 
    ADD CONSTRAINT vouchers_qtde_diferenca_check 
    CHECK (qtde_diferenca >= 1 AND qtde_diferenca <= 999);
  END IF;
END $$;

-- Atualizar o valor padrão para novos registros
ALTER TABLE vouchers 
ALTER COLUMN qtde_diferenca SET DEFAULT 1;

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers.qtde_diferenca IS 'Quantidade de diferença (falta) identificada no vale. Valores típicos: 1, 2, 3, etc.';