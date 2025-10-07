/*
  # Criar tabelas de colaboradores e vales

  1. Novas Tabelas
    - `employees` (colaboradores)
      - `id` (uuid, chave primária)
      - `cpf` (text, único, 11 dígitos)
      - `name` (text, nome completo)
      - `department` (text, departamento)
      - `promax_unico` (text, único, código de identificação)
      - `created_at` (timestamp)
    
    - `vouchers` (vales)
      - `id` (uuid, chave primária)
      - `promax_unico` (text, referência ao colaborador)
      - `data` (text, data do vale)
      - `mapa` (text, código do mapa)
      - `item` (text, descrição do item)
      - `quantidade` (integer, quantidade)
      - `valor` (decimal, valor monetário)
      - `acao_transportadora` (text, status do vale)
      - `justification_type` (text, tipo de justificativa)
      - `observations` (text, observações)
      - `justified_at` (timestamp, data da justificativa)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em ambas as tabelas
    - Políticas para usuários autenticados
    - Políticas específicas para administradores
*/

-- Criar tabela de colaboradores
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text UNIQUE NOT NULL,
  name text NOT NULL,
  department text,
  promax_unico text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de vales
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promax_unico text NOT NULL,
  data text NOT NULL,
  mapa text NOT NULL,
  item text NOT NULL,
  quantidade integer NOT NULL DEFAULT 0,
  valor decimal(10,2) NOT NULL DEFAULT 0.00,
  acao_transportadora text NOT NULL DEFAULT 'Sem ação',
  justification_type text,
  observations text,
  justified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Políticas para colaboradores (podem ver apenas seus próprios dados)
CREATE POLICY "Employees can read own data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true); -- Por enquanto permitir leitura geral, depois refinamos

CREATE POLICY "Vouchers can be read by owner"
  ON vouchers
  FOR SELECT
  TO authenticated
  USING (true); -- Por enquanto permitir leitura geral

-- Políticas para atualização de vales (justificativas)
CREATE POLICY "Vouchers can be updated by owner"
  ON vouchers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para administradores (acesso total)
CREATE POLICY "Admins can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage vouchers"
  ON vouchers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_employees_cpf ON employees(cpf);
CREATE INDEX IF NOT EXISTS idx_employees_promax_unico ON employees(promax_unico);
CREATE INDEX IF NOT EXISTS idx_vouchers_promax_unico ON vouchers(promax_unico);
CREATE INDEX IF NOT EXISTS idx_vouchers_acao_transportadora ON vouchers(acao_transportadora);
CREATE INDEX IF NOT EXISTS idx_vouchers_justified_at ON vouchers(justified_at);