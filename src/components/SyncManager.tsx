import { useState } from 'react';
import { idbService } from '../services/indexedDB';
import { supabaseService } from '../services/supabase';

interface SyncManagerProps {
  isOnline: boolean;
  onSync: () => void;
}

export function SyncManager({ isOnline, onSync }: SyncManagerProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      const clientes = await idbService.getClientes();
      const vendas = await idbService.getVendas();
      const categorias = await idbService.getCategorias();
      const nichos = await idbService.getNichos();
      const sabores = await idbService.getSabores();

      await supabaseService.syncClientes(clientes);
      await supabaseService.syncVendas(vendas);
      await supabaseService.syncCategorias(categorias);
      await supabaseService.syncNichos(nichos);
      await supabaseService.syncSabores(sabores);

      onSync();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-sm text-white/70">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      {isOnline && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isSyncing
              ? 'bg-yellow-500/40 text-yellow-300 cursor-not-allowed'
              : 'bg-green-500/40 hover:bg-green-500/60 text-green-300'
          }`}
        >
          {isSyncing ? '⏳ Sincronizando...' : 'Sincronizar'}
        </button>
      )}
    </div>
  );
}
