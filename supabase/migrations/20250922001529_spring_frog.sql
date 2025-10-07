/*
  # Atualizar estrutura da tabela de vales

  1. Alterações na tabela vouchers
    - Remover constraint unique da coluna coditen_mapa (se existir)
    - Recriar constraint unique para coditen_mapa
    - Adicionar comentários explicativos
    - Verificar se todas as colunas necessárias existem

  2. Índices
    - Recriar índice para coditen_mapa
    - Manter índices existentes para performance

  3. Segurança
    - Manter RLS habilitado
    - Manter políticas existentes
*/

-- Verificar se a constraint unique existe e removê-la se necessário
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'vouchers_coditen_mapa_key' 
    AND table_name = 'vouchers'
  ) THEN
    ALTER TABLE vouchers DROP CONSTRAINT vouchers_coditen_mapa_key;
  END IF;
END $$;

-- Verificar se a coluna coditen_mapa existe, se não, criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'coditen_mapa'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN coditen_mapa text;
  END IF;
END $$;

-- Adicionar comentário explicativo na coluna
COMMENT ON COLUMN vouchers.coditen_mapa IS 'Chave única formada pela combinação de código do item + mapa. Não duplica e identifica unicamente cada vale.';

-- Recriar constraint unique para coditen_mapa
ALTER TABLE vouchers ADD CONSTRAINT vouchers_coditen_mapa_unique UNIQUE (coditen_mapa);

-- Recriar índice para performance
DROP INDEX IF EXISTS idx_vouchers_coditen_mapa;
CREATE INDEX idx_vouchers_coditen_mapa ON vouchers USING btree (coditen_mapa);

-- Verificar se todas as colunas necessárias existem
DO $$
BEGIN
  -- Verificar coluna data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'data'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN data text NOT NULL DEFAULT '';
  END IF;

  -- Verificar coluna mapa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'mapa'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN mapa text NOT NULL DEFAULT '';
  END IF;

  -- Verificar coluna item
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'item'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN item text NOT NULL DEFAULT '';
  END IF;

  -- Verificar coluna quantidade
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'quantidade'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN quantidade integer NOT NULL DEFAULT 0;
  END IF;

  -- Verificar coluna valor
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'valor'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN valor numeric(10,2) NOT NULL DEFAULT 0.00;
  END IF;

  -- Verificar coluna acao_transportadora
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'acao_transportadora'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN acao_transportadora text NOT NULL DEFAULT 'Sem ação';
  END IF;
END $$;

-- Adicionar comentários nas colunas principais
COMMENT ON COLUMN vouchers.promax_unico IS 'Chave que conecta com o colaborador na tabela employees';
COMMENT ON COLUMN vouchers.data IS 'Data do vale no formato texto';
COMMENT ON COLUMN vouchers.mapa IS 'Código do mapa';
COMMENT ON COLUMN vouchers.item IS 'Código/descrição do item';
COMMENT ON COLUMN vouchers.quantidade IS 'Quantidade numérica do vale';
COMMENT ON COLUMN vouchers.valor IS 'Valor monetário do vale';
COMMENT ON COLUMN vouchers.acao_transportadora IS 'Status do vale: Sem ação, Justificado, Processado';

-- Manter RLS habilitado (já deve estar)
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Verificar se as políticas existem, se não, criar
DO $$
BEGIN
  -- Política de leitura pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vouchers' AND policyname = 'Allow public read access to vouchers'
  ) THEN
    CREATE POLICY "Allow public read access to vouchers"
      ON vouchers
      FOR SELECT
      TO public
      USING (true);
  END IF;

  -- Política de inserção pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vouchers' AND policyname = 'Allow public insert to vouchers'
  ) THEN
    CREATE POLICY "Allow public insert to vouchers"
      ON vouchers
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  -- Política de atualização pública
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vouchers' AND policyname = 'Allow public update to vouchers'
  ) THEN
    CREATE POLICY "Allow public update to vouchers"
      ON vouchers
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;