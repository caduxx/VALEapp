// Script para extrair dados da planilha Excel
const XLSX = require('xlsx');

// Dados extraídos da planilha fornecida
const excelData = [
  {
    data: "01/01/45917",
    mapa: "273135",
    item: "GARRAFEIRA PLAST.24 GFA 600ML",
    qtde_diferenca: 1 // Valor da planilha
  },
  {
    data: "01/01/45917", 
    mapa: "273135",
    item: "GFA VIDRO 635ML,AMBAR,TIPO A,R",
    qtde_diferenca: 2 // Valor correto da planilha (não 1 como estava no Supabase)
  }
];

console.log('Dados extraídos da planilha:');
excelData.forEach((row, index) => {
  console.log(`Linha ${index + 1}:`);
  console.log(`  Mapa: ${row.mapa}`);
  console.log(`  Item: ${row.item}`);
  console.log(`  Qtde Diferença: ${row.qtde_diferenca}`);
  console.log('---');
});

module.exports = excelData;