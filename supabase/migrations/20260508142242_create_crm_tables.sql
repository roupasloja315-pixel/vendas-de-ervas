/*
  # Criar tabelas do Tereré CRM

  1. Novas Tabelas
    - `clientes` - Armazena informações dos clientes
    - `vendas` - Armazena informações das vendas realizadas
    - `categorias` - Categorias personalizadas de clientes
    - `nichos` - Nichos de empresas personalizados
    - `sabores` - Sabores de erva disponíveis

  2. Segurança
    - RLS habilitado para todas as tabelas
    - Políticas para permitir acesso público aos dados (já que é um sistema offline-first)

  3. Notas
    - Todas as tabelas incluem campos de sincronização (sync_status)
    - Timestamps para rastreamento de criação e atualização
*/

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  sync_status text DEFAULT 'synced',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de nichos
CREATE TABLE IF NOT EXISTS nichos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  sync_status text DEFAULT 'synced',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de sabores
CREATE TABLE IF NOT EXISTS sabores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  sync_status text DEFAULT 'synced',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa text NOT NULL,
  nome_responsavel text NOT NULL,
  telefone text,
  categoria text NOT NULL,
  nicho text NOT NULL,
  status text DEFAULT 'Prospecto',
  observacoes text DEFAULT '',
  sync_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  sabores text[] DEFAULT '{}',
  quantidade float NOT NULL,
  dia_conferencia text NOT NULL,
  observacoes text DEFAULT '',
  sync_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE nichos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sabores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para leitura pública
CREATE POLICY "Permitir leitura pública de categorias"
  ON categorias FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de categorias"
  ON categorias FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir leitura pública de nichos"
  ON nichos FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de nichos"
  ON nichos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir leitura pública de sabores"
  ON sabores FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de sabores"
  ON sabores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir leitura pública de clientes"
  ON clientes FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de clientes"
  ON clientes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de clientes"
  ON clientes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de clientes"
  ON clientes FOR DELETE
  USING (true);

CREATE POLICY "Permitir leitura pública de vendas"
  ON vendas FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção pública de vendas"
  ON vendas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de vendas"
  ON vendas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de vendas"
  ON vendas FOR DELETE
  USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_categoria ON clientes(categoria);
CREATE INDEX IF NOT EXISTS idx_clientes_nicho ON clientes(nicho);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON vendas(created_at);
