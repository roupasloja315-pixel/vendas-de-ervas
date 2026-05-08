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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2">
      <div className="bg-[#1a2e1a] rounded-xl p-3 w-[90vw] max-w-sm border border-green-500/20 max-h-[88vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white">
            {vendaEditando ? 'Editar Venda' : 'Nova Venda'}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl leading-none w-6 h-6 flex items-center justify-center">✕</button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-white/70 text-xs">Cliente *</label>
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500"
            >
              <option value="">Selecione...</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>{cli.nome_empresa}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/70 text-xs mb-1 block">Sabores *</label>
            <div className="bg-black/20 border border-green-500/30 rounded p-2 max-h-24 overflow-y-auto space-y-1">
              {sabores.map(sabor => (
                <label key={sabor.id} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sabores.includes(sabor.nome)}
                    onChange={() => toggleSabor(sabor.nome)}
                    className="w-3 h-3"
                  />
                  <span className="text-white/80 text-xs">{sabor.nome}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowNovoSabor(!showNovoSabor)}
              className="mt-1 w-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 rounded px-2 py-1 text-green-400 text-xs"
            >
              + Sabor
            </button>
            {showNovoSabor && (
              <div className="flex gap-1 mt-1">
                <input
                  type="text"
                  placeholder="Nome"
                  value={novoSabor}
                  onChange={(e) => setNovoSabor(e.target.value)}
                  className="flex-1 bg-black/20 border border-green-500/30 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={adicionarSabor}
                  className="bg-green-500/40 hover:bg-green-500/60 rounded px-2 py-1 text-white text-xs flex-shrink-0"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-white/70 text-xs">Quantidade (kg) *</label>
            <input
              type="number"
              placeholder="0"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) })}
              className="w-full bg-white text-black border border-green-500/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs">Data *</label>
            <input
              type="date"
              value={formData.dia_conferencia}
              onChange={(e) => setFormData({ ...formData, dia_conferencia: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs">Observações</label>
            <textarea
              placeholder="Obs..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded px-2 py-1 text-xs focus:outline-none focus:border-green-500 resize-none h-10"
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
