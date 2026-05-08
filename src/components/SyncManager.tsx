import { useState } from 'react';
import { supabase } from '../services/supabase';

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
      await supabase.from('clientes').select('*');
      await supabase.from('vendas').select('*');

      onSync();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar dados');
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
