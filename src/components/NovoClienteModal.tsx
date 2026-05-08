import { useState, useEffect } from 'react';
import { Cliente, Categoria, Nicho } from '../types';
import { supabase } from '../services/supabase';

interface NovoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  clienteEditando?: Cliente;
}

export function NovoClienteModal({ isOpen, onClose, onSave, clienteEditando }: NovoClienteModalProps) {
  const [formData, setFormData] = useState<Cliente>({
    nome_empresa: '',
    nome_responsavel: '',
    telefone: '',
    categoria: '',
    nicho: '',
    status: 'Prospecto',
    observacoes: ''
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoNicho, setNovoNicho] = useState('');
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);
  const [showNovoNicho, setShowNovoNicho] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarCategorias();
      carregarNichos();
      if (clienteEditando) {
        setFormData(clienteEditando);
      }
    }
  }, [isOpen, clienteEditando]);

  const carregarCategorias = async () => {
    const { data } = await supabase.from('categorias').select('*');
    if (data) setCategorias(data);
  };

  const carregarNichos = async () => {
    const { data } = await supabase.from('nichos').select('*');
    if (data) setNichos(data);
  };

  const adicionarCategoria = async () => {
    if (!novaCategoria.trim()) return;
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nome: novaCategoria }])
      .select();

    if (!error && data) {
      setCategorias([...categorias, data[0]]);
      setFormData({ ...formData, categoria: novaCategoria });
      setNovaCategoria('');
      setShowNovaCategoria(false);
    }
  };

  const adicionarNicho = async () => {
    if (!novoNicho.trim()) return;
    const { data, error } = await supabase
      .from('nichos')
      .insert([{ nome: novoNicho }])
      .select();

    if (!error && data) {
      setNichos([...nichos, data[0]]);
      setFormData({ ...formData, nicho: novoNicho });
      setNovoNicho('');
      setShowNovoNicho(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome_empresa || !formData.nome_responsavel || !formData.categoria || !formData.nicho) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      if (clienteEditando?.id) {
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', clienteEditando.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([formData]);

        if (error) throw error;
      }

      onSave(formData);
      setFormData({
        nome_empresa: '',
        nome_responsavel: '',
        telefone: '',
        categoria: '',
        nicho: '',
        status: 'Prospecto',
        observacoes: ''
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2">
      <div className="bg-[#1a2e1a] rounded-xl p-3 w-[90vw] max-w-sm border border-green-500/20 max-h-[88vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white">
            {clienteEditando ? 'Editar' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none w-6 h-6 flex items-center justify-center">✕</button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-white/70 text-xs">Empresa *</label>
            <input
              type="text"
              placeholder="Ex: Mercado"
              value={formData.nome_empresa}
              onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs">Responsável *</label>
            <input
              type="text"
              placeholder="Ex: João"
              value={formData.nome_responsavel}
              onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs">Telefone</label>
            <input
              type="tel"
              placeholder="(67) 99999-9999"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs">Categoria *</label>
            <div className="flex gap-1">
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="flex-1 bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
              >
                <option value="">Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNovaCategoria(!showNovaCategoria)}
                className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 rounded px-1.5 py-1 text-green-400 text-xs flex-shrink-0"
              >
                +
              </button>
            </div>
            {showNovaCategoria && (
              <div className="flex gap-1 mt-1">
                <input
                  type="text"
                  placeholder="Nova"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="flex-1 bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={adicionarCategoria}
                  className="bg-green-500/40 hover:bg-green-500/60 rounded px-2 py-1 text-white text-xs flex-shrink-0"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-white/70 text-xs">Nicho *</label>
            <div className="flex gap-1">
              <select
                value={formData.nicho}
                onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                className="flex-1 bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
              >
                <option value="">Selecione...</option>
                {nichos.map(nicho => (
                  <option key={nicho.id} value={nicho.nome}>{nicho.nome}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNovoNicho(!showNovoNicho)}
                className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 rounded px-1.5 py-1 text-green-400 text-xs flex-shrink-0"
              >
                +
              </button>
            </div>
            {showNovoNicho && (
              <div className="flex gap-1 mt-1">
                <input
                  type="text"
                  placeholder="Novo"
                  value={novoNicho}
                  onChange={(e) => setNovoNicho(e.target.value)}
                  className="flex-1 bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={adicionarNicho}
                  className="bg-green-500/40 hover:bg-green-500/60 rounded px-2 py-1 text-white text-xs flex-shrink-0"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-white/70 text-xs">Status</label>
            <div className="flex gap-1">
              <button
                onClick={() => setFormData({ ...formData, status: 'Prospecto' })}
                className={`flex-1 py-1 rounded text-xs font-medium ${
                  formData.status === 'Prospecto'
                    ? 'bg-sky-500 text-white'
                    : 'bg-black/20 text-white/50 border border-white/10'
                }`}
              >
                Prospecto
              </button>
              <button
                onClick={() => setFormData({ ...formData, status: 'Fechado' })}
                className={`flex-1 py-1 rounded text-xs font-medium ${
                  formData.status === 'Fechado'
                    ? 'bg-green-500 text-white'
                    : 'bg-black/20 text-white/50 border border-white/10'
                }`}
              >
                Fechado
              </button>
            </div>
          </div>

          <div>
            <label className="text-white/70 text-xs">Observações</label>
            <textarea
              placeholder="Observações..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500 resize-none h-12"
            />
          </div>

          <div className="flex gap-1 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-1 bg-black/20 border border-white/10 rounded text-white text-xs hover:bg-black/30"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-1 bg-green-500/40 hover:bg-green-500/60 disabled:opacity-50 rounded text-white text-xs font-semibold"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
