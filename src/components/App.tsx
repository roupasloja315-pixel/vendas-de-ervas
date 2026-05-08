import { useState, useEffect } from 'react';
import { Cliente, Venda } from '../types';
import { idbService } from '../services/indexedDB';
import { NovoClienteModal } from './NovoClienteModal';
import { VendaModal } from './VendaModal';
import { ClientesList } from './ClientesList';
import { VendasList } from './VendasList';
import { SyncManager } from './SyncManager';
import { RelatorioModal } from './RelatorioModal';

type Tab = 'clientes' | 'vendas' | 'relatorio';

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('clientes');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [showNovoClienteModal, setShowNovoClienteModal] = useState(false);
  const [showNovaVendaModal, setShowNovaVendaModal] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | undefined>();
  const [vendaEditando, setVendaEditando] = useState<Venda | undefined>();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    inicializar();
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);

  const inicializar = async () => {
    try {
      await idbService.init();
      carregarClientes();
      carregarVendas();
    } catch (error) {
      console.error('Erro ao inicializar:', error);
    }
  };

  const carregarClientes = async () => {
    const clientesIDB = await idbService.getClientes();
    setClientes(clientesIDB);
  };

  const carregarVendas = async () => {
    const vendasIDB = await idbService.getVendas();
    setVendas(vendasIDB);
  };

  const handleNovoCliente = async (cliente: Cliente) => {
    if (clienteEditando) {
      await idbService.updateCliente(cliente);
      setClienteEditando(undefined);
    } else {
      await idbService.addCliente(cliente);
    }
    carregarClientes();
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setShowNovoClienteModal(true);
  };

  const handleDeletarCliente = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      await idbService.deleteCliente(id);
      carregarClientes();
    }
  };

  const handleNovaVenda = async (venda: Venda) => {
    if (vendaEditando) {
      await idbService.updateVenda(venda);
      setVendaEditando(undefined);
    } else {
      await idbService.addVenda(venda);
    }
    carregarVendas();
  };

  const handleEditarVenda = (venda: Venda) => {
    setVendaEditando(venda);
    setShowNovaVendaModal(true);
  };

  const handleDeletarVenda = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta venda?')) {
      await idbService.deleteVenda(id);
      carregarVendas();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1a0f] via-[#162316] to-[#1a2e1a] text-white">
      <div className="w-full">
        <header className="bg-[#162316] border-b border-green-500/20 sticky top-0 z-40">
          <div className="px-4 md:px-6 py-4 flex justify-between items-center gap-2">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-green-400">Tereré CRM</h1>
              <p className="text-white/60 text-xs md:text-sm">Sistema de Vendas e Clientes</p>
            </div>
            <SyncManager isOnline={isOnline} onSync={async () => {
              carregarClientes();
              carregarVendas();
            }} />
          </div>

          <nav className="flex border-t border-green-500/20 overflow-x-auto">
            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex-1 py-3 px-3 md:px-4 text-center font-semibold text-xs md:text-base transition-colors whitespace-nowrap ${
                activeTab === 'clientes'
                  ? 'border-b-2 border-green-400 text-green-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('vendas')}
              className={`flex-1 py-3 px-3 md:px-4 text-center font-semibold text-xs md:text-base transition-colors whitespace-nowrap ${
                activeTab === 'vendas'
                  ? 'border-b-2 border-green-400 text-green-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Vendas
            </button>
            <button
              onClick={() => setActiveTab('relatorio')}
              className={`flex-1 py-3 px-3 md:px-4 text-center font-semibold text-xs md:text-base transition-colors whitespace-nowrap ${
                activeTab === 'relatorio'
                  ? 'border-b-2 border-green-400 text-green-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Relatórios
            </button>
          </nav>
        </header>

        <main className="p-4 md:p-6 max-w-7xl mx-auto w-full">
          {activeTab === 'clientes' && (
            <div>
              <button
                onClick={() => {
                  setClienteEditando(undefined);
                  setShowNovoClienteModal(true);
                }}
                className="mb-6 bg-green-500/40 hover:bg-green-500/60 rounded-lg px-4 md:px-6 py-2 text-sm md:text-base text-white font-semibold w-full md:w-auto"
              >
                + Novo Cliente
              </button>
              <ClientesList
                clientes={clientes}
                onEdit={handleEditarCliente}
                onDelete={handleDeletarCliente}
              />
            </div>
          )}

          {activeTab === 'vendas' && (
            <div>
              <button
                onClick={() => {
                  setVendaEditando(undefined);
                  setShowNovaVendaModal(true);
                }}
                className="mb-6 bg-green-500/40 hover:bg-green-500/60 rounded-lg px-4 md:px-6 py-2 text-sm md:text-base text-white font-semibold w-full md:w-auto"
              >
                + Nova Venda
              </button>
              <VendasList
                vendas={vendas}
                clientes={clientes}
                onEdit={handleEditarVenda}
                onDelete={handleDeletarVenda}
              />
            </div>
          )}

          {activeTab === 'relatorio' && (
            <RelatorioModal
              clientes={clientes}
              vendas={vendas}
            />
          )}
        </main>
      </div>

      <NovoClienteModal
        isOpen={showNovoClienteModal && !showNovaVendaModal}
        onClose={() => {
          setShowNovoClienteModal(false);
          setClienteEditando(undefined);
        }}
        onSave={handleNovoCliente}
        clienteEditando={clienteEditando}
      />

      <VendaModal
        isOpen={showNovaVendaModal && !showNovoClienteModal}
        onClose={() => {
          setShowNovaVendaModal(false);
          setVendaEditando(undefined);
        }}
        onSave={handleNovaVenda}
        clientes={clientes}
        vendaEditando={vendaEditando}
      />
    </div>
  );
}
