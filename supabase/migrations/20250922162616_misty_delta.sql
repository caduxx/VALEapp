/*
  # Corrigir qtde_diferenca com valores exatos da planilha Excel

  Baseado na análise detalhada da planilha fornecida:
  
  1. MAPA 273135 - GARRAFEIRA PLAST.24 GFA 600ML → qtde_diferenca = 1
  2. MAPA 273135 - GFA VIDRO 635ML,AMBAR,TIPO A,R → qtde_diferenca = 2
  
  Valores extraídos diretamente da coluna "Qtde Diferença" da planilha Excel.
*/

-- Atualizar GARRAFEIRA PLAST.24 GFA 600ML no mapa 273135
UPDATE vouchers 
SET qtde_diferenca = 1
WHERE mapa = '273135' 
  AND item ILIKE '%GARRAFEIRA PLAST%GFA 600ML%';

-- Atualizar GFA VIDRO 635ML,AMBAR,TIPO A,R no mapa 273135  
UPDATE vouchers 
SET qtde_diferenca = 2
WHERE mapa = '273135' 
  AND item ILIKE '%GFA VIDRO 635ML%AMBAR%TIPO A%R%';

-- Verificar as atualizações
SELECT 
  mapa,
  item,
  qtde_diferenca,
  'Valor correto da planilha Excel' as observacao
FROM vouchers 
WHERE mapa = '273135'
ORDER BY item;