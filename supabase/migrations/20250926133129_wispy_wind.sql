/*
  # Reset vouchers table completely
  
  1. Drop and recreate vouchers table
  2. Clean structure with proper constraints
  3. Reset for correct import logic
*/

-- Drop existing table completely
DROP TABLE IF EXISTS vouchers CASCADE;

-- Recreate vouchers table with correct structure
CREATE TABLE vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "Mapa" text NOT NULL,
  "Data" text NOT NULL,
  cod_cli text,
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
  "Qtde_Diferença" integer DEFAULT 1 NOT NULL,
  "Avulsa3" text,
  "Valor" numeric(10,2) DEFAULT 0.00,
  "Conferente" text,
  "Coditem_mapa" text NOT NULL UNIQUE,
  "Promax_unico" text NOT NULL,
  justification_type text,
  observations text,
  justified_at timestamptz,
  acao_transportadora text DEFAULT 'Sem ação' NOT NULL,
  created_at timestamptz DEFAULT now(),
  "Medida" text
);

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create indexes
CREATE INDEX idx_vouchers_mapa ON vouchers ("Mapa");
CREATE INDEX idx_vouchers_promax_unico ON vouchers ("Promax_unico");
CREATE INDEX idx_vouchers_coditem_mapa ON vouchers ("Coditem_mapa");
CREATE INDEX idx_vouchers_acao_transportadora ON vouchers (acao_transportadora);
CREATE INDEX idx_vouchers_justified_at ON vouchers (justified_at);

-- Add constraint for Qtde_Diferença
ALTER TABLE vouchers ADD CONSTRAINT vouchers_qtde_diferenca_check 
  CHECK ("Qtde_Diferença" >= -9999 AND "Qtde_Diferença" <= 9999);