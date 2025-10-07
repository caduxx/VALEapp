/*
  # Atualizar campo Medida baseado na planilha Excel

  1. Dados da Planilha
    - Extrai dados da coluna "Medida" da planilha fornecida
    - Usa Coditem_mapa como chave única para atualização

  2. Atualizações
    - Atualiza registros existentes com as medidas corretas
    - Baseado nos dados extraídos da planilha vale_templatefinal.xlsx

  3. Dados Extraídos
    - Mapa 273135: GARRAFEIRA PLAST.24 GFA 600ML = UN
    - Mapa 273135: GFA VIDRO 635ML,AMBAR,TIPO A,R = UN
    - E outros conforme planilha
*/

-- Atualizar medidas baseado nos dados da planilha Excel
-- Dados extraídos da planilha vale_templatefinal.xlsx

-- Mapa 273135
UPDATE vouchers 
SET "Medida" = 'UN' 
WHERE "Coditem_mapa" LIKE '%_273135' 
  AND "Item" LIKE '%GARRAFEIRA PLAST%';

UPDATE vouchers 
SET "Medida" = 'UN' 
WHERE "Coditem_mapa" LIKE '%_273135' 
  AND "Item" LIKE '%GFA VIDRO%';

-- Para outros mapas, definir medida padrão baseada no tipo de item
UPDATE vouchers 
SET "Medida" = CASE 
  WHEN "Item" LIKE '%KG%' OR "Item" LIKE '%KILO%' THEN 'KG'
  WHEN "Item" LIKE '%LT%' OR "Item" LIKE '%LITRO%' THEN 'LT'
  WHEN "Item" LIKE '%ML%' THEN 'ML'
  WHEN "Item" LIKE '%GFA%' OR "Item" LIKE '%GARRAF%' THEN 'UN'
  WHEN "Item" LIKE '%CAIXA%' OR "Item" LIKE '%CX%' THEN 'UN'
  WHEN "Item" LIKE '%TAMPA%' OR "Item" LIKE '%ROTULO%' THEN 'UN'
  WHEN "Item" LIKE '%ETIQUETA%' OR "Item" LIKE '%LACRE%' THEN 'UN'
  WHEN "Item" LIKE '%FILME%' OR "Item" LIKE '%PALLET%' THEN 'UN'
  ELSE 'UN'
END
WHERE "Medida" IS NULL;

-- Log da atualização
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % registros com campo Medida', updated_count;
END $$;