import { useState, useRef } from 'react';
import { Cliente, Venda } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RelatorioModalProps {
  clientes: Cliente[];
  vendas: Venda[];
}

type FiltroCliente = 'todos' | 'prospecto' | 'fechado';
type FiltroVenda = 'todos' | 'com_vendas' | 'sem_vendas';

export function RelatorioModal({ clientes, vendas }: RelatorioModalProps) {
  const [filtroCliente, setFiltroCliente] = useState<FiltroCliente>('todos');
  const [filtroVenda, setFiltroVenda] = useState<FiltroVenda>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const relatorioRef = useRef<HTMLDivElement>(null);

  const clientesFiltrados = clientes.filter(c => {
    if (filtroCliente === 'prospecto') return c.status === 'Prospecto';
    if (filtroCliente === 'fechado') return c.status === 'Fechado';
    return true;
  });

  const vendaFiltradas = vendas.filter(v => {
    const dataVenda = new Date(v.created_at || '');
    if (dataInicio && dataVenda < new Date(dataInicio)) return false;
    if (dataFim && dataVenda > new Date(dataFim)) return false;
    return true;
  });

  const clientesComVendas = new Set(vendaFiltradas.map(v => v.cliente_id));
  const clientesComFiltro = filtroVenda === 'com_vendas'
    ? clientesFiltrados.filter(c => clientesComVendas.has(c.id || ''))
    : filtroVenda === 'sem_vendas'
    ? clientesFiltrados.filter(c => !clientesComVendas.has(c.id || ''))
    : clientesFiltrados;

  const totalVendas = vendaFiltradas.reduce((acc, v) => acc + v.quantidade, 0);
  const totalSabores = new Set(vendaFiltradas.flatMap(v => v.sabores)).size;

  const gerarPDF = async () => {
    if (!relatorioRef.current) return;

    try {
      const canvas = await html2canvas(relatorioRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPosition = 10;
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);

      let totalHeight = imgHeight + yPosition;
      while (totalHeight > pageHeight) {
        pdf.addPage();
        totalHeight -= pageHeight;
        pdf.addImage(imgData, 'PNG', 10, -totalHeight + 10, imgWidth, imgHeight);
      }

      const dataAtual = new Date().toLocaleDateString('pt-BR');
      pdf.save(`Relatorio_Terere_${dataAtual}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg p-4 md:p-6 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Gerar Relatório</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Status do Cliente</label>
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value as FiltroCliente)}
              className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-black text-sm"
            >
              <option value="todos">Todos os Status</option>
              <option value="prospecto">Prospectos</option>
              <option value="fechado">Clientes Fechados</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Vendas</label>
            <select
              value={filtroVenda}
              onChange={(e) => setFiltroVenda(e.target.value as FiltroVenda)}
              className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-black text-sm"
            >
              <option value="todos">Todos os Clientes</option>
              <option value="com_vendas">Apenas com Vendas</option>
              <option value="sem_vendas">Apenas sem Vendas</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-black text-sm"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-black text-sm"
            />
          </div>
        </div>

        <button
          onClick={gerarPDF}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors text-sm md:text-base"
        >
          Baixar Relatório em PDF
        </button>
      </div>

      <div ref={relatorioRef} className="bg-white p-6 md:p-8 rounded-lg shadow-lg print:shadow-none">
        <div className="text-center mb-8 border-b border-gray-300 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-black">RELATÓRIO TERERÉ CRM</h1>
          <p className="text-gray-600 mt-2">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-gray-600 text-sm font-medium">Total de Clientes</p>
            <p className="text-2xl font-bold text-blue-600">{clientesComFiltro.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-gray-600 text-sm font-medium">Total de Vendas</p>
            <p className="text-2xl font-bold text-green-600">{vendaFiltradas.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-gray-600 text-sm font-medium">Quantidade (kg)</p>
            <p className="text-2xl font-bold text-purple-600">{totalVendas.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-gray-600 text-sm font-medium">Tipos de Sabor</p>
            <p className="text-2xl font-bold text-orange-600">{totalSabores}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-black mb-4">Clientes ({clientesComFiltro.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-black font-semibold">Empresa</th>
                  <th className="px-4 py-2 text-left text-black font-semibold">Responsável</th>
                  <th className="px-4 py-2 text-left text-black font-semibold">Categoria</th>
                  <th className="px-4 py-2 text-left text-black font-semibold">Nicho</th>
                  <th className="px-4 py-2 text-left text-black font-semibold">Status</th>
                  <th className="px-4 py-2 text-left text-black font-semibold">Telefone</th>
                </tr>
              </thead>
              <tbody>
                {clientesComFiltro.map((cliente, idx) => (
                  <tr key={cliente.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2 text-black">{cliente.nome_empresa}</td>
                    <td className="px-4 py-2 text-black">{cliente.nome_responsavel}</td>
                    <td className="px-4 py-2 text-black">{cliente.categoria}</td>
                    <td className="px-4 py-2 text-black">{cliente.nicho}</td>
                    <td className="px-4 py-2 text-black">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cliente.status === 'Fechado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cliente.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-black">{cliente.telefone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {vendaFiltradas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-black mb-4">Vendas Realizadas ({vendaFiltradas.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-black font-semibold">Cliente</th>
                    <th className="px-4 py-2 text-left text-black font-semibold">Sabores</th>
                    <th className="px-4 py-2 text-left text-black font-semibold">Quantidade (kg)</th>
                    <th className="px-4 py-2 text-left text-black font-semibold">Data</th>
                    <th className="px-4 py-2 text-left text-black font-semibold">Conferência</th>
                  </tr>
                </thead>
                <tbody>
                  {vendaFiltradas.map((venda, idx) => {
                    const cliente = clientes.find(c => c.id === venda.cliente_id);
                    return (
                      <tr key={venda.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 text-black">{cliente?.nome_empresa || 'N/A'}</td>
                        <td className="px-4 py-2 text-black text-xs">{venda.sabores.join(', ')}</td>
                        <td className="px-4 py-2 text-black">{venda.quantidade}</td>
                        <td className="px-4 py-2 text-black">{new Date(venda.created_at || '').toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-2 text-black">{venda.dia_conferencia}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center text-gray-600 text-xs border-t border-gray-300 pt-4">
          <p>Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
          <p>© 2026 Tereré CRM - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
