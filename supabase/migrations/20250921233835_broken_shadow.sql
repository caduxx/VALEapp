/*
  # Ajustar políticas RLS para permitir operações do sistema

  1. Políticas para employees
    - Permitir inserção de novos funcionários
    - Permitir leitura para autenticação
  
  2. Políticas para vouchers  
    - Permitir inserção de novos vales
    - Permitir leitura e atualização pelos funcionários
*/

-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Admins can manage employees" ON employees;
DROP POLICY IF EXISTS "Employees can read own data" ON employees;
DROP POLICY IF EXISTS "Admins can manage vouchers" ON vouchers;
DROP POLICY IF EXISTS "Vouchers can be read by owner" ON vouchers;
DROP POLICY IF EXISTS "Vouchers can be updated by owner" ON vouchers;

-- Políticas mais permissivas para employees
CREATE POLICY "Allow public read access to employees"
  ON employees
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to employees"
  ON employees
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to employees"
  ON employees
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas mais permissivas para vouchers
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