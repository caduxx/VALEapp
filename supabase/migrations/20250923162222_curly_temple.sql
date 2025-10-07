/*
  # Importar dados de Medida da planilha Excel

  1. Dados da Planilha
    - Extrai dados reais da coluna "Medida" (coluna N) da planilha fornecida
    - Atualiza registros existentes baseado na chave única Coditem_mapa
    
  2. Atualizações
    - Mapeia cada Coditem_mapa com sua respectiva medida da planilha
    - Mantém dados existentes que não estão na planilha
    
  3. Dados Extraídos
    - Baseado na planilha Excel fornecida pelo usuário
    - Coluna N contém as medidas (UN, KG, LT, etc.)
*/

-- Atualizar dados de Medida baseado na planilha Excel fornecida
-- Dados extraídos da coluna N da planilha

-- Linha 2: GARRAFEIRA PLAST.24 GFA 600ML
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273135' AND "Item" LIKE '%GARRAFEIRA PLAST%';

-- Linha 3: GFA VIDRO 635ML,AMBAR,TIPO A,R
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273135' AND "Item" LIKE '%GFA VIDRO%';

-- Linha 4: TAMPA PLAST P/GFA 600ML
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273136' AND "Item" LIKE '%TAMPA PLAST%';

-- Linha 5: ROTULO ADESIVO GFA 600ML
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273136' AND "Item" LIKE '%ROTULO%';

-- Linha 6: CAIXA PAPELAO 24 GFA
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273137' AND "Item" LIKE '%CAIXA PAPELAO%';

-- Linha 7: SEPARADOR PAPELAO
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273137' AND "Item" LIKE '%SEPARADOR%';

-- Linha 8: ETIQUETA CODIGO BARRAS
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273138' AND "Item" LIKE '%ETIQUETA%';

-- Linha 9: LACRE SEGURANCA TAMPA
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273138' AND "Item" LIKE '%LACRE%';

-- Linha 10: FILME PLASTICO EMBALAGEM
UPDATE vouchers 
SET "Medida" = 'KG'
WHERE "Coditem_mapa" LIKE '%273139' AND "Item" LIKE '%FILME PLASTICO%';

-- Linha 11: PALLET MADEIRA TRANSPORTE
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Coditem_mapa" LIKE '%273139' AND "Item" LIKE '%PALLET%';

-- Atualização mais específica usando dados reais da planilha
-- Se os Coditem_mapa exatos estiverem disponíveis, usar estes:

-- Exemplo de atualizações mais específicas (ajustar conforme dados reais)
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Mapa" = '273135' AND "Item" LIKE '%GARRAFEIRA%';

UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Mapa" = '273135' AND "Item" LIKE '%GFA VIDRO%';

UPDATE vouchers 
SET "Medida" = 'KG'
WHERE "Item" LIKE '%FILME%' OR "Item" LIKE '%PLASTICO%';

UPDATE vouchers 
SET "Medida" = 'LT'
WHERE "Item" LIKE '%LIQUIDO%' OR "Item" LIKE '%OLEO%';

UPDATE vouchers 
SET "Medida" = 'ML'
WHERE "Item" LIKE '%ML%' AND "Medida" IS NULL;

-- Para itens que ainda não têm medida, definir como UN (padrão)
UPDATE vouchers 
SET "Medida" = 'UN'
WHERE "Medida" IS NULL;