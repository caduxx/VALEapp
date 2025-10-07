/*
  # Renomear coluna qtde_saida para qtde_diferenca

  1. Alterações na Tabela
    - Renomear coluna `qtde_saida` para `qtde_diferenca` na tabela `vouchers`
    - Manter todos os dados existentes
    - Atualizar comentário da coluna para refletir o novo significado

  2. Justificativa
    - A coluna representa a quantidade de diferença (falta) e não quantidade de saída
    - Melhor semântica para o contexto de vales/justificativas
    - Alinhamento com a interface do usuário
*/

-- Renomear a coluna qtde_saida para qtde_diferenca
ALTER TABLE vouchers 
RENAME COLUMN qtde_saida TO qtde_diferenca;

-- Atualizar o comentário da coluna para refletir o novo significado
COMMENT ON COLUMN vouchers.qtde_diferenca IS 'Quantidade de diferença (falta) identificada no vale';