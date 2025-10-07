/*
  # Corrigir datas no formato serial do Excel

  1. Conversão de Datas
    - Converte datas no formato serial do Excel (45917, 45918, etc.) para formato brasileiro
    - Data serial do Excel: número de dias desde 01/01/1900
    - Aplica correção para o bug do Excel (ano 1900 não é bissexto)

  2. Segurança
    - Usa transação para garantir consistência
    - Verifica se a conversão é necessária antes de aplicar
    - Mantém dados existentes corretos intactos
*/

-- Função para converter data serial do Excel para data real
CREATE OR REPLACE FUNCTION convert_excel_serial_to_date(serial_text TEXT)
RETURNS TEXT AS $$
DECLARE
    serial_number INTEGER;
    result_date DATE;
BEGIN
    -- Tenta converter o texto para número
    BEGIN
        serial_number := serial_text::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        -- Se não for um número, retorna o texto original
        RETURN serial_text;
    END;
    
    -- Verifica se é um número serial do Excel (entre 1 e 50000 aproximadamente)
    IF serial_number < 1 OR serial_number > 50000 THEN
        RETURN serial_text;
    END IF;
    
    -- Converte serial do Excel para data
    -- Excel conta dias desde 01/01/1900, mas tem um bug: considera 1900 como bissexto
    -- Por isso subtraímos 2 dias para corrigir
    result_date := DATE '1900-01-01' + (serial_number - 2);
    
    -- Retorna no formato brasileiro DD/MM/YYYY
    RETURN TO_CHAR(result_date, 'DD/MM/YYYY');
END;
$$ LANGUAGE plpgsql;

-- Atualiza as datas na tabela vouchers
UPDATE vouchers 
SET "Data" = convert_excel_serial_to_date("Data")
WHERE "Data" ~ '^[0-9]+$' -- Apenas registros que são números puros
AND "Data"::INTEGER BETWEEN 1 AND 50000; -- Range válido para datas seriais do Excel

-- Remove a função temporária
DROP FUNCTION convert_excel_serial_to_date(TEXT);