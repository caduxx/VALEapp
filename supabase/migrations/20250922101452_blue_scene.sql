/*
  # Adicionar coluna coditen à tabela vouchers

  1. Nova Coluna
    - `coditen` (text) - Código numérico do item da planilha
  
  2. Atualização
    - A chave única `coditen_mapa` agora será formada por coditen + "_" + mapa
    - Isso resolve duplicatas quando o mesmo item aparece em mapas diferentes
*/

-- Adicionar coluna coditen se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'coditen'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN coditen text;
  END IF;
END $$;

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers.coditen IS 'Código numérico do item da planilha (usado para formar chave única coditen_mapa)';