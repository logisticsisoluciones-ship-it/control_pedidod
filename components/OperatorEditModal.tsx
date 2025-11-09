
import React, { useState, useEffect } from 'react';
import { Operator } from '../types';

interface OperatorEditModalProps {
  isOpen: boolean;
  operator: Operator | null;
  onSave: (operator: Operator) => void;
  onCancel: () => void;
}

export const OperatorEditModal: React.FC<OperatorEditModalProps> = ({
  isOpen,
  operator,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (operator) {
      setName(operator.name);
      setError('');
    }
  }, [operator]);

  if (!isOpen || !operator) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    onSave({ ...operator, name: name.trim() });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in-scale"
      aria-labelledby="modal-title-edit-op"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all duration-300">
        <h2 id="modal-title-edit-op" className="text-lg font-bold text-white">
          Editar Preparador
        </h2>
        
        <div className="mt-4 space-y-4">
            <div>
                <label htmlFor="edit-operator-id" className="block text-sm font-medium text-gray-400">Cédula de Identidad (no editable)</label>
                <input
                    type="text"
                    id="edit-operator-id"
                    value={operator.id}
                    disabled
                    className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-400 sm:text-sm cursor-not-allowed"
                />
            </div>
            <div>
                <label htmlFor="edit-operator-name" className="block text-sm font-medium text-gray-300">Nombre Completo</label>
                <input
                    type="text"
                    id="edit-operator-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
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
            onClick={handleSave}
            type="button"
            className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};