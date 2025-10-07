/*
  # Corrigir estrutura da tabela vouchers

  1. Correções na tabela vouchers
    - Renomear coluna `quantidade` para `qtde_saida` se existir
    - Garantir que todas as colunas necessárias existem
    - Manter chave única `coditen_mapa`
    - Corrigir tipos de dados

  2. Segurança
    - Manter RLS habilitado
    - Manter políticas existentes
*/

-- Verificar e renomear coluna quantidade para qtde_saida se necessário
DO $$
BEGIN
  -- Verificar se a coluna quantidade existe e qtde_saida não existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vouchers' AND column_name = 'quantidade'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vouchers' AND column_name = 'qtde_saida'
  ) THEN
    ALTER TABLE vouchers RENAME COLUMN quantidade TO qtde_saida;
  END IF;
END $$;

-- Garantir que a coluna qtde_saida existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'qtde_saida'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN qtde_saida integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Garantir que todas as outras colunas necessárias existem
DO $$
BEGIN
  -- Coluna coditen_mapa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'coditen_mapa'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN coditen_mapa text;
  END IF;

  -- Coluna promax_unico
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'promax_unico'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN promax_unico text NOT NULL;
  END IF;

  -- Coluna data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'data'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN data text NOT NULL;
  END IF;

  -- Coluna mapa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'mapa'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN mapa text NOT NULL;
  END IF;

  -- Coluna item
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'item'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN item text NOT NULL;
  END IF;

  -- Coluna valor
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'valor'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN valor numeric(10,2) DEFAULT 0.00 NOT NULL;
  END IF;

  -- Coluna acao_transportadora
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'acao_transportadora'
  ) THEN
    ALTER TABLE vouchers ADD COLUMN acao_transportadora text DEFAULT 'Sem ação' NOT NULL;
  END IF;
END $$;

-- Garantir constraint unique na chave coditen_mapa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'vouchers' AND constraint_name = 'vouchers_coditen_mapa_unique'
  ) THEN
    ALTER TABLE vouchers ADD CONSTRAINT vouchers_coditen_mapa_unique UNIQUE (coditen_mapa);
  END IF;
END $$;

-- Recriar índices se necessário
DROP INDEX IF EXISTS idx_vouchers_coditen_mapa;
CREATE INDEX IF NOT EXISTS idx_vouchers_coditen_mapa ON vouchers (coditen_mapa);

DROP INDEX IF EXISTS idx_vouchers_promax_unico;
CREATE INDEX IF NOT EXISTS idx_vouchers_promax_unico ON vouchers (promax_unico);