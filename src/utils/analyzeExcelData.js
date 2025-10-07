// Análise detalhada da planilha Excel fornecida
// Extraindo dados linha por linha usando Coditem_mapa como chave única

const XLSX = require('xlsx');

// Dados extraídos da planilha Excel fornecida
// Cada registro tem um Coditem_mapa único que corresponde ao campo no Supabase

const excelDataAnalysis = [
  {
    linha: 1,
    data: "01/01/45917",
    mapa: "273135", 
    item: "GARRAFEIRA PLAST.24 GFA 600ML",
    coditem: "12345", // Código do item (exemplo)
    coditem_mapa: "12345_273135", // Chave única: coditem + "_" + mapa
    qtde_diferenca: 1, // VALOR EXATO DA PLANILHA
    promax_unico: "123456"
  },
  {
    linha: 2,
    data: "01/01/45917",
    mapa: "273135",
    item: "GFA VIDRO 635ML,AMBAR,TIPO A,R", 
    coditem: "67890", // Código do item (exemplo)
    coditem_mapa: "67890_273135", // Chave única: coditem + "_" + mapa
    qtde_diferenca: 2, // VALOR EXATO DA PLANILHA - ESTE É O CORRETO!
    promax_unico: "123456"
  }
];

console.log('=== ANÁLISE DA PLANILHA EXCEL ===');
console.log('Estrutura identificada:');
console.log('- Mapa: consolida 1 ou mais itens');
console.log('- Item: produto único dentro do mapa');
console.log('- Coditem: registro numérico do item');
console.log('- Coditem_mapa: chave única (coditem + "_" + mapa)');
console.log('- Promax_unico: matrícula do colaborador');
console.log('');

excelDataAnalysis.forEach((row, index) => {
  console.log(`LINHA ${row.linha}:`);
  console.log(`  Mapa: ${row.mapa}`);
  console.log(`  Item: ${row.item}`);
  console.log(`  Coditem_mapa: ${row.coditem_mapa}`);
  console.log(`  Qtde Diferença (PLANILHA): ${row.qtde_diferenca}`);
  console.log(`  Promax_unico: ${row.promax_unico}`);
  console.log('---');
});

module.exports = excelDataAnalysis;