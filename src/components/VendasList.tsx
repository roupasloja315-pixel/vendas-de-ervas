import { Venda, Cliente } from '../types';

interface VendasListProps {
  vendas: Venda[];
  clientes: Cliente[];
  onEdit: (venda: Venda) => void;
  onDelete: (id: string) => void;
}

export function VendasList({ vendas, clientes, onEdit, onDelete }: VendasListProps) {
  const getClienteNome = (clienteId: string) => {
    return clientes.find(c => c.id === clienteId)?.nome_empresa || 'Cliente não encontrado';
  };

  if (vendas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Nenhuma venda registrada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vendas.map(venda => (
        <div
          key={venda.id}
          className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-black">{getClienteNome(venda.cliente_id)}</h3>
              <p className="text-gray-600 text-sm">Venda realizada</p>
            </div>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {venda.sync_status === 'pending' ? '⏳ Pendente' : '✓ Sincronizado'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 bg-gray-50 rounded p-3">
            <div>
              <p className="text-gray-600 font-medium">Sabores</p>
              <p className="text-black">{venda.sabores.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Quantidade</p>
              <p className="text-black">{venda.quantidade} kg</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Conferência</p>
              <p className="text-black">Dia {venda.dia_conferencia}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Data</p>
              <p className="text-black">{new Date(venda.created_at || '').toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {venda.observacoes && (
            <div className="mb-4 bg-gray-100 rounded p-3 border border-gray-200">
              <p className="text-gray-700 text-sm">{venda.observacoes}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(venda)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 rounded px-3 py-2 text-white font-medium transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => venda.id && onDelete(venda.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 rounded px-3 py-2 text-white font-medium transition-colors"
            >
              Deletar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
