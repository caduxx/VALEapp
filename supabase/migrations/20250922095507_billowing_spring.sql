/*
# Estrutura final da tabela vouchers baseada na planilha template

1. Colunas da planilha template:
   - Promax_unico (texto)
   - Data (texto)
   - Mapa (texto) 
   - Item (texto)
   - Qtde Saída (número inteiro)
   - Valor (número decimal)

2. Ajustes necessários:
   - Renomear quantidade para qtde_saida
   - Garantir que os tipos estão corretos
   - Manter chave única coditen_mapa
*/

-- Renomear coluna quantidade para qtde_saida se existir
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

-- Adicionar comentários para documentar a correspondência
COMMENT ON COLUMN vouchers.promax_unico IS 'Corresponde à coluna "Promax_unico" da planilha';
COMMENT ON COLUMN vouchers.data IS 'Corresponde à coluna "Data" da planilha';
COMMENT ON COLUMN vouchers.mapa IS 'Corresponde à coluna "Mapa" da planilha';
COMMENT ON COLUMN vouchers.item IS 'Corresponde à coluna "Item" da planilha';
COMMENT ON COLUMN vouchers.qtde_saida IS 'Corresponde à coluna "Qtde Saída" da planilha';
COMMENT ON COLUMN vouchers.valor IS 'Corresponde à coluna "Valor" da planilha';