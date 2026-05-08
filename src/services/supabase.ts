import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Cliente, Venda, Categoria, Nicho, SaborErva } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const supabaseService = {
  async syncClientes(clientes: Cliente[]): Promise<void> {
    for (const cliente of clientes) {
      if (cliente.sync_status === 'pending') {
        if (cliente.id) {
          await supabase.from('clientes').upsert([cliente]);
        }
      }
    }
  },

  async syncVendas(vendas: Venda[]): Promise<void> {
    for (const venda of vendas) {
      if (venda.sync_status === 'pending') {
        if (venda.id) {
          await supabase.from('vendas').upsert([venda]);
        }
      }
    }
  },

  async syncCategorias(categorias: Categoria[]): Promise<void> {
    for (const categoria of categorias) {
      if (categoria.sync_status === 'pending') {
        if (categoria.id) {
          await supabase.from('categorias').upsert([categoria]);
        }
      }
    }
  },

  async syncNichos(nichos: Nicho[]): Promise<void> {
    for (const nicho of nichos) {
      if (nicho.sync_status === 'pending') {
        if (nicho.id) {
          await supabase.from('nichos').upsert([nicho]);
        }
      }
    }
  },

  async syncSabores(sabores: SaborErva[]): Promise<void> {
    for (const sabor of sabores) {
      if (sabor.sync_status === 'pending') {
        if (sabor.id) {
          await supabase.from('sabores').upsert([sabor]);
        }
      }
    }
  }
};
