import { useState, useEffect } from 'react';
import { Cliente, Categoria, Nicho } from '../types';
import { idbService } from '../services/indexedDB';

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
    const cats = await idbService.getCategorias();
    setCategorias(cats);
  };

  const carregarNichos = async () => {
    const nic = await idbService.getNichos();
    setNichos(nic);
  };

  const adicionarCategoria = async () => {
    if (novaCategoria.trim()) {
      const id = await idbService.addCategoria({ nome: novaCategoria });
      setCategorias([...categorias, { id, nome: novaCategoria }]);
      setFormData({ ...formData, categoria: novaCategoria });
      setNovaCategoria('');
      setShowNovaCategoria(false);
    }
  };

  const adicionarNicho = async () => {
    if (novoNicho.trim()) {
      const id = await idbService.addNicho({ nome: novoNicho });
      setNichos([...nichos, { id, nome: novoNicho }]);
      setFormData({ ...formData, nicho: novoNicho });
      setNovoNicho('');
      setShowNovoNicho(false);
    }
  };

  const handleSave = async () => {
    if (formData.nome_empresa && formData.nome_responsavel && formData.categoria && formData.nicho) {
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
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-[#1a2e1a] rounded-3xl p-5 md:p-8 max-w-md w-full border border-green-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">✕</button>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="text-white/70 text-xs md:text-sm">Nome da Empresa *</label>
            <input
              type="text"
              placeholder="Ex: Mercado do João"
              value={formData.nome_empresa}
              onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded-lg px-3 md:px-4 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs md:text-sm">Nome do Responsável *</label>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              value={formData.nome_responsavel}
              onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded-lg px-3 md:px-4 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs md:text-sm">Telefone</label>
            <input
              type="tel"
              placeholder="(67) 99999-9999"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded-lg px-3 md:px-4 py-2 text-white text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="text-white/70 text-xs md:text-sm">Categoria *</label>
            <div className="flex gap-2">
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="flex-1 bg-black/20 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              >
                <option value="">Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNovaCategoria(!showNovaCategoria)}
                className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 rounded-lg px-3 py-2 text-green-400"
              >
                +
              </button>
            </div>
            {showNovaCategoria && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Nova categoria"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className="flex-1 bg-black/20 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={adicionarCategoria}
                  className="bg-green-500/40 hover:bg-green-500/60 rounded-lg px-4 py-2 text-white"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-white/70 text-xs md:text-sm">Nicho de Empresa *</label>
            <div className="flex gap-2">
              <select
                value={formData.nicho}
                onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                className="flex-1 bg-black/20 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              >
                <option value="">Selecione...</option>
                {nichos.map(nicho => (
                  <option key={nicho.id} value={nicho.nome}>{nicho.nome}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNovoNicho(!showNovoNicho)}
                className="bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 rounded-lg px-3 py-2 text-green-400"
              >
                +
              </button>
            </div>
            {showNovoNicho && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Novo nicho"
                  value={novoNicho}
                  onChange={(e) => setNovoNicho(e.target.value)}
                  className="flex-1 bg-black/20 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={adicionarNicho}
                  className="bg-green-500/40 hover:bg-green-500/60 rounded-lg px-4 py-2 text-white"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-white/70 text-xs md:text-sm">Status</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, status: 'Prospecto' })}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  formData.status === 'Prospecto'
                    ? 'bg-sky-500 text-white'
                    : 'bg-black/20 text-white/50 border border-white/10'
                }`}
              >
                Prospecto
              </button>
              <button
                onClick={() => setFormData({ ...formData, status: 'Fechado' })}
                className={`flex-1 py-2 rounded-lg transition-colors ${
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
            <label className="text-white/70 text-xs md:text-sm">Observações</label>
            <textarea
              placeholder="Adicione observações..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full bg-black/20 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 resize-none h-24"
            />
          </div>

          <div className="flex gap-2 md:gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-black/20 border border-white/10 rounded-lg text-white text-sm hover:bg-black/30"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-green-500/40 hover:bg-green-500/60 rounded-lg text-white text-sm font-semibold"
            >
              {clienteEditando ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
