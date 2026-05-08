export interface Cliente {
  id?: string;
  nome_empresa: string;
  nome_responsavel: string;
  telefone: string;
  categoria: string;
  nicho: string;
  status: 'Prospecto' | 'Fechado';
  observacoes: string;
  sync_status?: 'pending' | 'synced';
  created_at?: string;
  updated_at?: string;
}

export interface Venda {
  id?: string;
  cliente_id: string;
  sabores: string[];
  quantidade: number;
  dia_conferencia: string;
  observacoes: string;
  sync_status?: 'pending' | 'synced';
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id?: string;
  nome: string;
  sync_status?: 'pending' | 'synced';
  created_at?: string;
}

export interface Nicho {
  id?: string;
  nome: string;
  sync_status?: 'pending' | 'synced';
  created_at?: string;
}

export interface SaborErva {
  id?: string;
  nome: string;
  sync_status?: 'pending' | 'synced';
  created_at?: string;
}
