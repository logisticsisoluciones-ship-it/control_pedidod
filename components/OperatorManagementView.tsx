import React, { useState } from 'react';
import { Operator } from '../types';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ConfirmationModal } from './ConfirmationModal';
import { OperatorEditModal } from './OperatorEditModal';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface OperatorManagementViewProps {
  operators: Operator[];
  onAddOperator: (operator: Operator) => void;
  onUpdateOperator: (operator: Operator) => void;
  onRemoveOperator: (operatorId: string) => void;
}

const AddOperatorForm: React.FC<{ onAddOperator: (operator: Operator) => void }> = ({ onAddOperator }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id.trim() || !name.trim()) {
            setError('Ambos campos son obligatorios.');
            return;
        }
        onAddOperator({ id: id.trim(), name: name.trim() });
        setId('');
        setName('');
        setError('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Añadir Nuevo Preparador</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="operator-id" className="block text-sm font-medium text-gray-300">Cédula de Identidad</label>
                    <input
                        type="text"
                        id="operator-id"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        placeholder="Ej: 12345678"
                    />
                </div>
                <div>
                    <label htmlFor="operator-name" className="block text-sm font-medium text-gray-300">Nombre Completo</label>
                    <input
                        type="text"
                        id="operator-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        placeholder="Ej: Juan Pérez"
                    />
                </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-4 text-right">
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800">
                    Añadir Preparador
                </button>
            </div>
        </form>
    );
};


export const OperatorManagementView: React.FC<OperatorManagementViewProps> = ({ operators, onAddOperator, onUpdateOperator, onRemoveOperator }) => {
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null);
  const [operatorToEdit, setOperatorToEdit] = useState<Operator | null>(null);

  const handleRemoveClick = (operator: Operator) => {
    setOperatorToDelete(operator);
  };

  const handleConfirmRemove = () => {
    if (operatorToDelete) {
      onRemoveOperator(operatorToDelete.id);
      setOperatorToDelete(null);
    }
  };

  const handleCancelRemove = () => {
    setOperatorToDelete(null);
  };
  
  const handleEditClick = (operator: Operator) => {
    setOperatorToEdit(operator);
  };

  const handleSaveEdit = (updatedOperator: Operator) => {
    onUpdateOperator(updatedOperator);
    setOperatorToEdit(null);
  };

  const handleCancelEdit = () => {
    setOperatorToEdit(null);
  };

  return (
    <div className="animate-fade-in-scale">
      <h2 className="text-xl font-semibold text-gray-200 mb-6">Gestión de Preparadores</h2>
      
      <AddOperatorForm onAddOperator={onAddOperator} />

      <div className="bg-gray-800 rounded-lg shadow-md">
        {operators.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {operators.map(op => (
              <li key={op.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50">
                <div>
                  <p className="font-medium text-white">{op.name}</p>
                  <p className="text-sm text-gray-400">ID: {op.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEditClick(op)}
                        className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800"
                        aria-label={`Editar a ${op.name}`}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleRemoveClick(op)}
                        className="p-2 bg-red-800 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800"
                        aria-label={`Eliminar a ${op.name}`}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>No hay preparadores registrados.</p>
            <p className="mt-2 text-sm">Usa el formulario de arriba para añadir el primero.</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!operatorToDelete}
        title="Confirmar Eliminación"
        message={
          <>
            ¿Estás seguro de que quieres eliminar al preparador{' '}
            <strong className="text-white">{operatorToDelete?.name}</strong>?
            Esta acción no se puede deshacer.
          </>
        }
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-700 hover:bg-red-600 focus:ring-red-500"
      />

      <OperatorEditModal 
        isOpen={!!operatorToEdit}
        operator={operatorToEdit}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};