
import React, { useState, useMemo } from 'react';
import { Order, Operator } from '../types';
import { formatDateTime, calculateDuration } from '../utils/timeUtils';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ConfirmationModal } from './ConfirmationModal';

const SortIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9M3 12h9m-9 4h13M17 4v16m0 0l-4-4m4 4l4-4" />
    </svg>
);

interface HistoryViewProps {
  orders: Order[];
  operators: Operator[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ orders, operators, onClearHistory }) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const filteredAndSortedOrders = useMemo(() => {
    const operatorFiltered =
      selectedOperatorId === 'all'
        ? orders
        : orders.filter(order => order.operator?.id === selectedOperatorId);

    const dateFiltered = operatorFiltered.filter(order => {
        if (!order.endTime) return false;
        const orderEndTime = new Date(order.endTime).getTime();

        if (startDate) {
            const [year, month, day] = startDate.split('-').map(Number);
            const filterStartTime = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
            if (orderEndTime < filterStartTime) return false;
        }
        if (endDate) {
            const [year, month, day] = endDate.split('-').map(Number);
            const filterEndTime = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
            if (orderEndTime > filterEndTime) return false;
        }
        return true;
    });

    return [...dateFiltered].sort((a, b) => {
      const timeA = a.endTime ? new Date(a.endTime).getTime() : 0;
      const timeB = b.endTime ? new Date(b.endTime).getTime() : 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [orders, sortOrder, selectedOperatorId, startDate, endDate]);

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const handleExportCSV = () => {
    const headers = ['ID Pedido', 'Creación', 'Inicio Preparación', 'Fin Preparación', 'T. Espera', 'T. Preparación', 'ID Preparador', 'Nombre Preparador'];
    
    const rows = filteredAndSortedOrders.map(order => [
      `"${order.id}"`,
      `"${formatDateTime(order.creationTime)}"`,
      order.startTime ? `"${formatDateTime(order.startTime)}"` : 'N/A',
      order.endTime ? `"${formatDateTime(order.endTime)}"` : 'N/A',
      `"${calculateDuration(order.creationTime, order.startTime)}"`,
      `"${calculateDuration(order.startTime, order.endTime)}"`,
      order.operator ? `"${order.operator.id}"` : 'N/A',
      order.operator ? `"${order.operator.name}"` : 'N/A',
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const timestamp = new Date().toISOString().slice(0,10);
    link.setAttribute("download", `historial_pedidos_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleConfirmDelete = () => {
    onClearHistory();
    setShowConfirmModal(false);
  };


  if (orders.length === 0 && !startDate && !endDate && selectedOperatorId === 'all') {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>No hay pedidos completados en el historial.</p>
        <p className="mt-2 text-sm">Los pedidos finalizados aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-scale">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-200 self-start sm:self-center">Historial de Pedidos</h2>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                  onClick={handleExportCSV}
                  disabled={filteredAndSortedOrders.length === 0}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-300 bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Exportar CSV</span>
              </button>
              <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={orders.length === 0}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-300 bg-red-800 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <TrashIcon className="w-4 h-4" />
                  <span>Eliminar Todo</span>
              </button>
            </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg mb-6 flex flex-wrap items-end gap-4">
            <div className="flex-grow min-w-[150px]">
                <label htmlFor="start-date" className="block text-xs font-medium text-gray-400 mb-1">Desde</label>
                <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-700 text-gray-300 text-sm rounded-md border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 py-2 px-3"
                    aria-label="Fecha de inicio"
                />
            </div>
            <div className="flex-grow min-w-[150px]">
                <label htmlFor="end-date" className="block text-xs font-medium text-gray-400 mb-1">Hasta</label>
                <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-700 text-gray-300 text-sm rounded-md border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 py-2 px-3"
                    aria-label="Fecha de fin"
                />
            </div>
            <div className="flex-grow min-w-[180px]">
                <label htmlFor="operator-filter" className="block text-xs font-medium text-gray-400 mb-1">Preparador</label>
                <select
                    id="operator-filter"
                    value={selectedOperatorId}
                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                    className="w-full bg-gray-700 text-gray-300 text-sm rounded-md border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 py-2 px-3"
                >
                    <option value="all">Todos los Preparadores</option>
                    {operators.map(op => (
                        <option key={op.id} value={op.id}>{op.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex-shrink-0">
                <button
                    onClick={toggleSortOrder}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                >
                    <SortIcon className="w-4 h-4" />
                    <span>({sortOrder === 'desc' ? 'Recientes' : 'Antiguos'})</span>
                </button>
            </div>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID Pedido</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">T. Espera</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">T. Preparación</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Preparador</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {filteredAndSortedOrders.length > 0 ? (
                    filteredAndSortedOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-700/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-cyan-400">{calculateDuration(order.creationTime, order.startTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-cyan-400">{calculateDuration(order.startTime, order.endTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.endTime ? formatDateTime(order.endTime) : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.operator?.name || 'N/A'}</td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-500">
                            No se encontraron pedidos para los filtros seleccionados.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar todo el historial de pedidos completados? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-700 hover:bg-red-600 focus:ring-red-500"
      />
    </div>
  );
};