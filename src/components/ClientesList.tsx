import { Cliente } from '../types';

interface ClientesListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: string) => void;
}

export function ClientesList({ clientes, onEdit, onDelete }: ClientesListProps) {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Nenhum cliente cadastrado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clientes.map(cliente => (
        <div
          key={cliente.id}
          className="bg-[#162316] border border-green-500/20 rounded-lg p-5 hover:border-green-500/40 transition-colors"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-green-400">{cliente.nome_empresa}</h3>
              <p className="text-white/70 text-sm">Responsável: {cliente.nome_responsavel}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                cliente.status === 'Prospecto'
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'bg-green-500/20 text-green-300'
              }`}>
                {cliente.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-white/50">Telefone</p>
              <p className="text-white">{cliente.telefone || '-'}</p>
            </div>
            <div>
              <p className="text-white/50">Categoria</p>
              <p className="text-white">{cliente.categoria}</p>
            </div>
            <div>
              <p className="text-white/50">Nicho</p>
              <p className="text-white">{cliente.nicho}</p>
            </div>
            <div>
              <p className="text-white/50">Status de Sync</p>
              <p className="text-white">{cliente.sync_status === 'pending' ? '⏳ Pendente' : '✓ Sincronizado'}</p>
            </div>
          </div>

          {cliente.observacoes && (
            <div className="mb-4 bg-black/20 rounded p-3 border border-white/5">
              <p className="text-white/70 text-sm">{cliente.observacoes}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(cliente)}
              className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded px-3 py-2 text-blue-300 font-medium transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => cliente.id && onDelete(cliente.id)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded px-3 py-2 text-red-300 font-medium transition-colors"
            >
              Deletar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
