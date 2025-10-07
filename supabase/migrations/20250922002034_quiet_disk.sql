/*
  # Simplificar estrutura da tabela vouchers

  1. Mudanças na Tabela
    - Manter apenas colunas essenciais da planilha
    - Ajustar tipos de dados conforme necessário
    - Manter chave única `coditen_mapa`
    - Manter conexão com funcionários via `promax_unico`

  2. Segurança
    - Manter RLS habilitado
    - Manter políticas existentes
*/

-- Verificar se a coluna coditen_mapa existe e é única
DO $$
BEGIN
  -- Verificar se a constraint única existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'vouchers' 
    AND constraint_name = 'vouchers_coditen_mapa_unique'
    AND constraint_type = 'UNIQUE'
  ) THEN
    -- Adicionar constraint única se não existir
    ALTER TABLE vouchers ADD CONSTRAINT vouchers_coditen_mapa_unique UNIQUE (coditen_mapa);
  END IF;
END $$;

-- Verificar se o índice existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'vouchers' 
    AND indexname = 'idx_vouchers_coditen_mapa'
  ) THEN
    CREATE INDEX idx_vouchers_coditen_mapa ON vouchers (coditen_mapa);
  END IF;
END $$;

-- Adicionar comentários para documentar a estrutura
COMMENT ON COLUMN vouchers.coditen_mapa IS 'Chave única formada pela combinação de código do item + mapa. Não duplica e identifica unicamente cada vale.';
COMMENT ON COLUMN vouchers.promax_unico IS 'Chave que conecta com o colaborador na tabela employees';
COMMENT ON COLUMN vouchers.data IS 'Data do vale no formato texto';
COMMENT ON COLUMN vouchers.mapa IS 'Código do mapa';
COMMENT ON COLUMN vouchers.item IS 'Código/descrição do item';
COMMENT ON COLUMN vouchers.quantidade IS 'Quantidade numérica do vale';
COMMENT ON COLUMN vouchers.valor IS 'Valor monetário do vale';
COMMENT ON COLUMN vouchers.acao_transportadora IS 'Status do vale: Sem ação, Justificado, Processado';