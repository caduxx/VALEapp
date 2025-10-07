/*
  # Adicionar chave única Coditen_Mapa para vales

  1. Alterações na tabela vouchers
    - Adicionar coluna `coditen_mapa` (text, unique)
    - Remover constraint de unicidade do `id` se necessário
    - Adicionar índice para performance

  2. Segurança
    - Manter RLS habilitado
    - Políticas existentes continuam válidas

  3. Observações
    - A coluna `coditen_mapa` será a chave única que não duplica
    - `promax_unico` continua fazendo join com colaboradores
    - Dados existentes serão preservados
*/

-- Adicionar a nova coluna coditen_mapa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'coditen_mapa'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN coditen_mapa text;
  END IF;
END $$;

-- Criar constraint de unicidade para coditen_mapa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'vouchers' AND constraint_name = 'vouchers_coditen_mapa_key'
  ) THEN
    ALTER TABLE vouchers ADD CONSTRAINT vouchers_coditen_mapa_key UNIQUE (coditen_mapa);
  END IF;
END $$;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_vouchers_coditen_mapa ON vouchers (coditen_mapa);

-- Comentário explicativo
COMMENT ON COLUMN vouchers.coditen_mapa IS 'Chave única formada pela combinação de código do item + mapa. Não duplica e identifica unicamente cada vale.';