
import React from 'react';

type FilterStatus = 'all' | 'pending' | 'to_be_prepared' | 'ongoing' | 'completed';

interface FilterControlsProps {
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
}

const filterOptions: { status: FilterStatus; label: string }[] = [
  { status: 'all', label: 'Todos' },
  { status: 'to_be_prepared', label: 'Por Preparar' },
  { status: 'ongoing', label: 'En Proceso' },
  { status: 'pending', label: 'Pendientes' },
  { status: 'completed', label: 'Completados' },
];

export const FilterControls: React.FC<FilterControlsProps> = ({ filterStatus, onFilterChange }) => {
  return (
    <div className="flex justify-center space-x-2 sm:space-x-4 mb-8">
      {filterOptions.map(({ status, label }) => {
        const isActive = filterStatus === status;
        return (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
              isActive
                ? 'bg-cyan-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};