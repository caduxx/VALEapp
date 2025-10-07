/*
  # Adicionar campo Medida na tabela vouchers

  1. Alterações na Tabela
    - Adiciona coluna `Medida` (text, nullable) na tabela `vouchers`
    - Permite valores nulos para compatibilidade com dados existentes

  2. Índices
    - Adiciona índice para otimizar consultas por medida

  3. Segurança
    - Mantém as políticas RLS existentes
*/

-- Adicionar coluna Medida na tabela vouchers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'Medida'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN "Medida" text;
  END IF;
END $$;

-- Adicionar índice para otimizar consultas por medida
CREATE INDEX IF NOT EXISTS idx_vouchers_medida ON vouchers ("Medida");

-- Comentário explicativo
COMMENT ON COLUMN vouchers."Medida" IS 'Unidade de medida do item (ex: KG, UN, LT, etc.)';