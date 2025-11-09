import React, { useState, useEffect } from 'react';
import { Operator } from '../types';

interface OperatorSelectionModalProps {
  isOpen: boolean;
  orderId: string;
  operators: Operator[];
  onConfirm: (operator: Operator) => void;
  onCancel: () => void;
}

export const OperatorSelectionModal: React.FC<OperatorSelectionModalProps> = ({ isOpen, orderId, operators, onConfirm, onCancel }) => {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedOperatorId(null); // Reset selection when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const selectedOperator = operators.find(op => op.id === selectedOperatorId);
    if (selectedOperator) {
      onConfirm(selectedOperator);
    }
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all duration-300 animate-fade-in-scale">
        <h2 id="modal-title" className="text-lg font-bold text-white">
          Asignar Preparador
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Selecciona un preparador para el pedido <strong className="text-cyan-400">{orderId}</strong>.
        </p>

        <div className="mt-4 max-h-60 overflow-y-auto pr-2 space-y-2">
            {operators.map(op => (
                <label 
                    key={op.id}
                    className={`flex items-center p-3 rounded-md cursor-pointer transition-colors duration-200 border-2 ${selectedOperatorId === op.id ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-700 border-transparent hover:bg-gray-600'}`}
                >
                    <input
                        type="radio"
                        name="preparer-selection"
                        value={op.id}
                        checked={selectedOperatorId === op.id}
                        onChange={() => setSelectedOperatorId(op.id)}
                        className="h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500"
                    />
                    <span className="ml-3 text-sm font-medium text-white">{op.name}</span>
                </label>
            ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            disabled={!selectedOperatorId}
            className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Confirmar Asignación
          </button>
        </div>
      </div>
    </div>
  );
};