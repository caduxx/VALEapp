/*
  # Atualizar qtde_diferenca com valores REAIS da planilha Excel

  1. Correções baseadas na planilha fornecida
    - Mapa 273135: GFA VIDRO → qtde_diferenca = 24 (valor real da planilha)
    - Mapa 273135: GARRAFEIRA → qtde_diferenca = 25 (valor real da planilha)
  
  2. Atualizações
    - Usar correspondência por mapa + item para identificar registros corretos
    - Aplicar valores EXATOS da coluna "Qtde Diferença" da planilha
*/

-- Atualizar GFA VIDRO no mapa 273135 para qtde_diferenca = 24
UPDATE vouchers 
SET qtde_diferenca = 24
WHERE mapa = '273135' 
  AND item ILIKE '%GFA VIDRO%635ML%AMBAR%';

-- Atualizar GARRAFEIRA no mapa 273135 para qtde_diferenca = 25  
UPDATE vouchers 
SET qtde_diferenca = 25
WHERE mapa = '273135' 
  AND item ILIKE '%GARRAFEIRA%';

-- Verificar as atualizações
SELECT 
  mapa,
  item,
  qtde_diferenca,
  'Atualizado com valores da planilha' as status
FROM vouchers 
WHERE mapa = '273135'
ORDER BY item;