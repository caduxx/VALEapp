/*
  # Fix Admin Permissions for Voucher Operations

  1. Security Updates
    - Allow DELETE operations on vouchers table
    - Allow INSERT operations on vales_justificados table
    - Ensure admin operations work without RLS restrictions

  2. Changes
    - Add policy for DELETE operations on vouchers
    - Add policy for INSERT operations on vales_justificados
    - Ensure public access for admin operations
*/

-- Garantir que a tabela vouchers permite DELETE para todos
DROP POLICY IF EXISTS "Allow public delete to vouchers" ON vouchers;
CREATE POLICY "Allow public delete to vouchers"
  ON vouchers
  FOR DELETE
  TO public
  USING (true);

-- Garantir que a tabela vales_justificados permite INSERT para todos
DROP POLICY IF EXISTS "Allow public insert to vales_justificados" ON vales_justificados;
CREATE POLICY "Allow public insert to vales_justificados"
  ON vales_justificados
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Garantir que a tabela vales_justificados permite SELECT para todos
DROP POLICY IF EXISTS "Allow public read access to vales_justificados" ON vales_justificados;
CREATE POLICY "Allow public read access to vales_justificados"
  ON vales_justificados
  FOR SELECT
  TO public
  USING (true);

-- Garantir que a tabela vales_justificados permite UPDATE para todos
DROP POLICY IF EXISTS "Allow public update to vales_justificados" ON vales_justificados;
CREATE POLICY "Allow public update to vales_justificados"
  ON vales_justificados
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Verificar se RLS está habilitado nas tabelas
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vales_justificados ENABLE ROW LEVEL SECURITY;