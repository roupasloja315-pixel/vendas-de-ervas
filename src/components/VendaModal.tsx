import { useState, useEffect } from 'react';
import { Venda, SaborErva, Cliente } from '../types';
import { idbService } from '../services/indexedDB';

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

  useEffect(() => {
    if (isOpen) {
      carregarSabores();
      if (vendaEditando) {
        setFormData(vendaEditando);
      }
    }
  }, [isOpen, vendaEditando]);

  const carregarSabores = async () => {
    const sabs = await idbService.getSabores();
    setSabores(sabs);
  };

  const adicionarSabor = async () => {
    if (novoSabor.trim()) {
      const id = await idbService.addSabor({ nome: novoSabor });
      setSabores([...sabores, { id, nome: novoSabor }]);
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
    if (formData.cliente_id && formData.sabores.length > 0 && formData.quantidade > 0 && formData.dia_conferencia) {
      onSave(formData);
      setFormData({
        cliente_id: '',
        sabores: [],
        quantidade: 0,
        dia_conferencia: '',
        observacoes: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-[#1a2e1a] rounded-3xl p-5 md:p-8 max-w-md w-full border border-green-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {vendaEditando ? 'Editar Venda' : 'Nova Venda'}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">✕</button>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="text-white/70 text-xs md:text-sm">Cliente *</label>
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-3 md:px-4 py-2 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">Selecione um cliente...</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id}>{cli.nome_empresa}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Sabores da Erva * (Múltipla Seleção)</label>
            <div className="bg-black/20 border border-green-500/30 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {sabores.map(sabor => (
                <label key={sabor.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sabores.includes(sabor.nome)}
                    onChange={() => toggleSabor(sabor.nome)}
                    className="w-4 h-4"
                  />
                  <span className="text-white/80">{sabor.nome}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowNovoSabor(!showNovoSabor)}
              className="mt-2 w-full bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 rounded-lg px-3 py-2 text-green-400"
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
                  className="flex-1 bg-black/20 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={adicionarSabor}
                  className="bg-green-500/40 hover:bg-green-500/60 rounded-lg px-4 py-2 text-white"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-white/70 text-sm">Quantidade (kg) *</label>
            <input
              type="number"
              placeholder="0"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: parseFloat(e.target.value) })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-3 md:px-4 py-2 text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm">Data para conferência *</label>
            <input
              type="date"
              value={formData.dia_conferencia}
              onChange={(e) => setFormData({ ...formData, dia_conferencia: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-3 md:px-4 py-2 text-sm focus:outline-none focus:border-green-500"
            />
            {formData.dia_conferencia && (
              <p className="text-white/60 text-xs mt-1">
                Próxima conferência: {new Date(formData.dia_conferencia).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <div>
            <label className="text-white/70 text-sm">Observações</label>
            <textarea
              placeholder="Adicione observações..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full bg-white text-black border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 resize-none h-20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-black/20 border border-white/10 rounded-lg text-white hover:bg-black/30"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-green-500/40 hover:bg-green-500/60 rounded-lg text-white font-semibold"
            >
              {vendaEditando ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
