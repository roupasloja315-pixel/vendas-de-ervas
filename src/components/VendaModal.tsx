import { useState, useEffect } from 'react';
import { Venda, SaborErva, Cliente } from '../types';
import { supabase } from '../services/supabase';

interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venda: Venda) => void;
  clientes: Cliente[];
  vendaEditando?: Venda;
}

export function VendaModal({ isOpen, onClose, onSave, clientes, vendaEditando }: VendaModalProps) {
  const [formData, setFormData] = useState<Venda>({
    cliente_id: '',
    sabores: [],
    quantidade: 0,
    dia_conferencia: '',
    observacoes: ''
  });

  const [sabores, setSabores] = useState<SaborErva[]>([]);
  const [novoSabor, setNovoSabor] = useState('');
  const [showNovoSabor, setShowNovoSabor] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      carregarSabores();
      if (vendaEditando) {
        setFormData(vendaEditando);
      }
    }
  }, [isOpen, vendaEditando]);

  const carregarSabores = async () => {
    const { data } = await supabase.from('sabores').select('*');
    if (data) setSabores(data);
  };

  const adicionarSabor = async () => {
    if (!novoSabor.trim()) return;
    const { data, error } = await supabase
      .from('sabores')
      .insert([{ nome: novoSabor }])
      .select();

    if (!error && data) {
      setSabores([...sabores, data[0]]);
      setNovoSabor('');
      setShowNovoSabor(false);
    }
  };

  const toggleSabor = (nomeSabor: string) => {
    setFormData({
      ...formData,
      sabores: formData.sabores.includes(nomeSabor)
        ? formData.sabores.filter(s => s !== nomeSabor)
        : [...formData.sabores, nomeSabor]
    });
  };

  const handleSave = async () => {
    if (!formData.cliente_id || formData.sabores.length === 0 || formData.quantidade <= 0 || !formData.dia_conferencia) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      if (vendaEditando?.id) {
        const { error } = await supabase
          .from('vendas')
          .update(formData)
          .eq('id', vendaEditando.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vendas')
          .insert([formData]);

        if (error) throw error;
      }

      onSave(formData);
      setFormData({
        cliente_id: '',
        sabores: [],
        quantidade: 0,
        dia_conferencia: '',
        observacoes: ''
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar venda');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
      <div className="bg-[#1a2e1a] rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-8 w-[95vw] sm:w-full max-w-md border border-green-500/20 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex-1">
            {vendaEditando ? 'Editar Venda' : 'Nova Venda'}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl flex-shrink-0 ml-2">✕</button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-white/70 text-xs sm:text-sm">Cliente *</label>
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">Selecione um cliente...</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>{cli.nome_empresa}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/70 text-xs sm:text-sm mb-2 block">Sabores da Erva * (Múltipla Seleção)</label>
            <div className="bg-black/20 border border-green-500/30 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {sabores.map(sabor => (
                <label key={sabor.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sabores.includes(sabor.nome)}
                    onChange={() => toggleSabor(sabor.nome)}
                    className="w-4 h-4"
                  />
                  <span className="text-white/80 text-sm">{sabor.nome}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowNovoSabor(!showNovoSabor)}
              className="mt-2 w-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 rounded-lg px-3 py-2 text-green-400 text-sm"
            >
              + Adicionar Sabor
            </button>
            {showNovoSabor && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nome do sabor"
                  value={novoSabor}
                  onChange={(e) => setNovoSabor(e.target.value)}
                  className="flex-1 bg-black/20 border border-green-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={adicionarSabor}
                  className="bg-green-500/40 hover:bg-green-500/60 rounded-lg px-3 py-2 text-white text-sm flex-shrink-0"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-white/70 text-xs sm:text-sm">Quantidade (kg) *</label>
            <input
              type="number"
              placeholder="0"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs sm:text-sm">Data para conferência *</label>
            <input
              type="date"
              value={formData.dia_conferencia}
              onChange={(e) => setFormData({ ...formData, dia_conferencia: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-green-500"
            />
            {formData.dia_conferencia && (
              <p className="text-white/60 text-xs mt-1">
                Data: {new Date(formData.dia_conferencia).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <div>
            <label className="text-white/70 text-xs sm:text-sm">Observações</label>
            <textarea
              placeholder="Adicione observações..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-none focus:border-green-500 resize-none h-20"
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm hover:bg-black/30"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-2 bg-green-500/40 hover:bg-green-500/60 disabled:opacity-50 rounded-lg text-white text-sm font-semibold"
            >
              {loading ? 'Salvando...' : vendaEditando ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
