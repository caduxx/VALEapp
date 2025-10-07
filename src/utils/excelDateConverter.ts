/**
 * Utilitários para conversão de datas do Excel
 */

/**
 * Converte número serial do Excel para data JavaScript
 * Excel conta dias desde 01/01/1900, mas tem um bug: considera 1900 como ano bissexto
 * @param serialNumber - Número serial do Excel (ex: 45917)
 * @returns Date object
 */
export const excelSerialToDate = (serialNumber: number): Date => {
  // Excel epoch: 30/12/1899 (conforme especificado)
  const excelEpoch = new Date(1899, 11, 30); // 30/12/1899
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  
  // Fórmula: data final = 30/12/1899 + número de dias
  const resultDate = new Date(excelEpoch.getTime() + serialNumber * millisecondsPerDay);
  
  return resultDate;
};

/**
 * Extrai número serial de uma string malformada do Excel
 * @param dateString - String como "01/01/45917" ou "45917"
 * @returns Número serial extraído
 */
export const extractSerialFromString = (dateString: string): number | null => {
  if (!dateString) return null;
  
  // Se já é um número, retorna diretamente
  const directNumber = parseInt(dateString);
  if (!isNaN(directNumber) && directNumber > 40000 && directNumber < 50000) {
    return directNumber;
  }
  
  // Procura por padrão "XX/XX/NNNNN" onde NNNNN é o serial
  const match = dateString.match(/\d{1,2}\/\d{1,2}\/(\d{5})/);
  if (match) {
    const serial = parseInt(match[1]);
    if (!isNaN(serial) && serial > 40000 && serial < 50000) {
      return serial;
    }
  }
  
  // Procura por qualquer número de 5 dígitos na string
  const serialMatch = dateString.match(/(\d{5})/);
  if (serialMatch) {
    const serial = parseInt(serialMatch[1]);
    if (serial > 40000 && serial < 50000) {
      return serial;
    }
  }
  
  return null;
};

/**
 * Converte string de data do Excel para formato ISO (YYYY-MM-DD)
 * @param excelDateString - String como "01/01/45917"
 * @returns String no formato ISO ou null se inválida
 */
export const convertExcelDateToISO = (excelDateString: string): string | null => {
  console.log('🔄 Convertendo data do Excel:', excelDateString);
  
  // Primeiro, tenta extrair o número serial
  const serialNumber = extractSerialFromString(excelDateString);
  
  if (!serialNumber) {
    console.warn('⚠️ Não foi possível extrair número serial de:', excelDateString);
    return null;
  }
  
  console.log('📊 Número serial extraído:', serialNumber);
  
  // Converte serial para data
  const date = excelSerialToDate(serialNumber);
  
  // Formata para ISO (YYYY-MM-DD)
  const isoDate = date.toISOString().split('T')[0];
  
  console.log('✅ Data convertida:', {
    original: excelDateString,
    serial: serialNumber,
    converted: isoDate,
    readable: date.toLocaleDateString('pt-BR')
  });
  
  return isoDate;
};

/**
 * Valida se uma string contém um número serial válido do Excel
 * @param dateString - String a ser validada
 * @returns boolean
 */
export const isValidExcelDateString = (dateString: string): boolean => {
  const serial = extractSerialFromString(dateString);
  return serial !== null && serial > 40000 && serial < 50000;
};

/**
 * Converte data ISO de volta para formato brasileiro para exibição
 * @param isoDate - Data no formato YYYY-MM-DD
 * @returns String no formato DD/MM/YYYY
 */
export const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) return 'Data inválida';
  
  try {
    // Se já está no formato ISO (YYYY-MM-DD)
    if (isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Fallback para outros formatos
    const date = new Date(isoDate + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR');
    }
    
    return 'Data inválida';
  } catch (error) {
    console.error('Erro ao formatar data para exibição:', error);
    return 'Data inválida';
  }
};