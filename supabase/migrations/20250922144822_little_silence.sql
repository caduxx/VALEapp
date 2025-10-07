/*
  # Corrigir valores da coluna qtde_diferenca

  1. Problema identificado
    - Valores incorretos na coluna qtde_diferenca (71, 2160, etc.)
    - Deveriam ser valores pequenos (1, 2, 3) representando quantidade de diferença

  2. Correções
    - Resetar todos os valores para 1 (padrão para vales)
    - Manter constraint para valores entre 1-999
    - Definir valor padrão como 1

  3. Observações
    - Esta correção é baseada na análise da planilha fornecida
    - Valores de qtde_diferenca devem representar quantidades pequenas de falta
*/

-- Corrigir todos os valores existentes para 1 (valor padrão para vales)
UPDATE vouchers 
SET qtde_diferenca = 1 
WHERE qtde_diferenca IS NULL 
   OR qtde_diferenca < 1 
   OR qtde_diferenca > 10;

-- Garantir que o valor padrão seja 1
ALTER TABLE vouchers 
ALTER COLUMN qtde_diferenca SET DEFAULT 1;

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers.qtde_diferenca IS 'Quantidade de diferença (falta) identificada no vale. Valores típicos: 1, 2, 3, etc. Representa a quantidade de itens em falta.';