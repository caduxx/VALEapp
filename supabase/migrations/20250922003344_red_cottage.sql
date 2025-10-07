/*
# Atualizar estrutura de vales para nomes exatos da planilha

1. Modificações na tabela vouchers
  - Renomear colunas para corresponder exatamente à planilha
  - Ajustar tipos de dados conforme necessário
  - Manter chave única coditen_mapa

2. Estrutura final
  - promax_unico → mantém (corresponde a "Promax_unico")
  - data → mantém (corresponde a "Data")
  - mapa → mantém (corresponde a "Mapa")
  - item → mantém (corresponde a "Item")
  - quantidade → renomear para qtde_saida (corresponde a "Qtde Saída")
  - valor → mantém (corresponde a "Valor")
  - coditen_mapa → mantém como chave única
*/

-- Renomear coluna quantidade para qtde_saida se ela existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'quantidade'
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

-- Atualizar comentários das colunas
COMMENT ON COLUMN vouchers.promax_unico IS 'Código do funcionário (corresponde a "Promax_unico" na planilha)';
COMMENT ON COLUMN vouchers.data IS 'Data do vale (corresponde a "Data" na planilha)';
COMMENT ON COLUMN vouchers.mapa IS 'Código do mapa (corresponde a "Mapa" na planilha)';
COMMENT ON COLUMN vouchers.item IS 'Código do item (corresponde a "Item" na planilha)';
COMMENT ON COLUMN vouchers.qtde_saida IS 'Quantidade de saída (corresponde a "Qtde Saída" na planilha)';
COMMENT ON COLUMN vouchers.valor IS 'Valor monetário (corresponde a "Valor" na planilha)';
COMMENT ON COLUMN vouchers.coditen_mapa IS 'Chave única: item + "_" + mapa';