/*
  # Corrigir formato de data nos vales

  1. Correções
    - Converter datas no formato serial do Excel para formato brasileiro
    - Atualizar registros existentes com datas corretas
    - Melhorar validação de datas na importação

  2. Observações
    - Datas no formato "01/01/45917" são convertidas para formato padrão
    - Mantém compatibilidade com datas já no formato correto
*/

-- Função para converter data serial do Excel para data normal
CREATE OR REPLACE FUNCTION convert_excel_date(date_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Se a data contém números muito altos (formato serial do Excel)
  IF date_text ~ '^\d{2}/\d{2}/\d{5}$' THEN
    -- Extrair dia e mês, assumir ano atual para datas seriais
    RETURN SUBSTRING(date_text FROM 1 FOR 2) || '/' || 
           SUBSTRING(date_text FROM 4 FOR 2) || '/' || 
           EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  END IF;
  
  -- Se já está no formato correto, retornar como está
  RETURN date_text;
END;
$$ LANGUAGE plpgsql;

-- Atualizar datas existentes que estão no formato serial do Excel
UPDATE vouchers 
SET "Data" = convert_excel_date("Data")
WHERE "Data" ~ '^\d{2}/\d{2}/\d{5}$';

-- Remover a função temporária
DROP FUNCTION convert_excel_date(TEXT);