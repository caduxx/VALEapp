/*
  # Recriar tabela de vales baseada na planilha Excel

  1. Exclusão
    - Remove tabela atual de vouchers

  2. Nova Tabela vouchers
    - Campos exatos da planilha Excel conforme layout fornecido
    - Coditem_mapa como chave única
    - Promax_unico para identificação do colaborador
    - Campos adicionais para justificativas

  3. Segurança
    - Enable RLS
    - Políticas de acesso público
*/

-- Excluir tabela atual de vouchers
DROP TABLE IF EXISTS vouchers CASCADE;

-- Criar nova tabela vouchers baseada na estrutura da planilha Excel
CREATE TABLE vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campos exatos da planilha Excel (mantendo grafia original)
  "Mapa" text NOT NULL,
  "Data" text NOT NULL,
  "cod_cli" text,
  "Cliente" text,
  "Vale" text,
  "Emissão" text,
  "Item_TI" text,
  "Cód_Item" text,
  "Item" text NOT NULL,
  "UN" text,
  "Qtde_Saída" integer,
  "Avulsa" text,
  "Qtde_Retorno" integer,
  "Avulsa2" text,
  "Qtde_Diferença" integer NOT NULL DEFAULT 1,
  "Avulsa3" text,
  "Valor" numeric(10,2) DEFAULT 0.00,
  "Conferente" text,
  
  -- Chaves de identificação
  "Coditem_mapa" text UNIQUE NOT NULL, -- Chave única da planilha
  "Promax_unico" text NOT NULL, -- Identificação do colaborador
  
  -- Campos para justificativas (novos)
  justification_type text,
  observations text,
  justified_at timestamptz,
  acao_transportadora text DEFAULT 'Sem ação' NOT NULL,
  
  -- Campos de controle
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_vouchers_promax_unico ON vouchers ("Promax_unico");
CREATE INDEX idx_vouchers_coditem_mapa ON vouchers ("Coditem_mapa");
CREATE INDEX idx_vouchers_mapa ON vouchers ("Mapa");
CREATE INDEX idx_vouchers_acao_transportadora ON vouchers (acao_transportadora);
CREATE INDEX idx_vouchers_justified_at ON vouchers (justified_at);

-- Constraint para validar quantidade de diferença
ALTER TABLE vouchers ADD CONSTRAINT vouchers_qtde_diferenca_check 
  CHECK (("Qtde_Diferença" >= 1) AND ("Qtde_Diferença" <= 999));

-- Habilitar RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Allow public read access to vouchers"
  ON vouchers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to vouchers"
  ON vouchers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to vouchers"
  ON vouchers
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);