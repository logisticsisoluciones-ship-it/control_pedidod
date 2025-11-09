
import React from 'react';

interface InitialActionModalProps {
  isOpen: boolean;
  orderId: string;
  onAssign: () => void;
  onSetPendingStatus: (status: 'por_preparar' | 'pendiente') => void;
  onCancel: () => void;
}

export const InitialActionModal: React.FC<InitialActionModalProps> = ({ 
  isOpen, 
  orderId, 
  onAssign, 
  onSetPendingStatus,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      aria-labelledby="modal-title-initial"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all duration-300 animate-fade-in-scale">
        <h2 id="modal-title-initial" className="text-lg font-bold text-white">
          Nuevo Pedido Detectado
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          ¿Qué deseas hacer con el pedido <strong className="text-cyan-400">{orderId}</strong>?
        </p>

        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={() => onSetPendingStatus('por_preparar')}
            type="button"
            className="w-full px-4 py-3 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800"
          >
            Marcar como Por Preparar
          </button>
          <button
            onClick={onAssign}
            type="button"
            className="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
          >
            Asignar Preparador Ahora
          </button>
           <button
            onClick={() => onSetPendingStatus('pendiente')}
            type="button"
            className="w-full px-4 py-3 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"
          >
            Marcar como Pendiente (con incidencia)
          </button>
        </div>

        <div className="mt-4 text-center">
            <button
                onClick={onCancel}
                type="button"
                className="px-4 py-2 text-gray-400 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none"
            >
                Cancelar
            </button>
        </div>
      </div>
    </div>
  );
};