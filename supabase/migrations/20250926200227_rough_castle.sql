/*
  # Create vales_justificados table

  1. New Tables
    - `vales_justificados`
      - Same structure as vouchers table
      - Will store all justified vouchers permanently
      - Includes all original voucher data plus justification info

  2. Security
    - Enable RLS on `vales_justificados` table
    - Add policies for public access (same as vouchers)

  3. Purpose
    - Transform vouchers into temporary table (refreshed on each import)
    - Store justified vouchers permanently in vales_justificados
*/

-- Create vales_justificados table with same structure as vouchers
CREATE TABLE IF NOT EXISTS vales_justificados (
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
  "Qtde_Diferença" integer NOT NULL DEFAULT 1,
  "Avulsa3" text,
  "Valor" numeric(10,2) DEFAULT 0.00,
  "Conferente" text,
  "Coditem_mapa" text NOT NULL,
  "Promax_unico" text NOT NULL,
  justification_type text,
  observations text,
  justified_at timestamptz,
  acao_transportadora text NOT NULL DEFAULT 'Justificado',
  created_at timestamptz DEFAULT now(),
  "Medida" text,
  
  -- Original voucher data
  original_voucher_id uuid,
  justified_by_user text,
  moved_to_permanent_at timestamptz DEFAULT now()
);

-- Add unique constraint on Coditem_mapa
ALTER TABLE vales_justificados ADD CONSTRAINT vales_justificados_coditem_mapa_key UNIQUE ("Coditem_mapa");

-- Add check constraint for Qtde_Diferença
ALTER TABLE vales_justificados ADD CONSTRAINT vales_justificados_qtde_diferenca_check 
  CHECK (("Qtde_Diferença" >= -9999 AND "Qtde_Diferença" <= 9999));

-- Enable RLS
ALTER TABLE vales_justificados ENABLE ROW LEVEL SECURITY;

-- Create policies (same as vouchers table)
CREATE POLICY "Allow public read access to vales_justificados"
  ON vales_justificados
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to vales_justificados"
  ON vales_justificados
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to vales_justificados"
  ON vales_justificados
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vales_justificados_coditem_mapa ON vales_justificados ("Coditem_mapa");
CREATE INDEX IF NOT EXISTS idx_vales_justificados_promax_unico ON vales_justificados ("Promax_unico");
CREATE INDEX IF NOT EXISTS idx_vales_justificados_mapa ON vales_justificados ("Mapa");
CREATE INDEX IF NOT EXISTS idx_vales_justificados_justified_at ON vales_justificados (justified_at);
CREATE INDEX IF NOT EXISTS idx_vales_justificados_moved_at ON vales_justificados (moved_to_permanent_at);