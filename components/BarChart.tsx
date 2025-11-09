import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  color: 'cyan' | 'yellow';
}

const colorClasses = {
  cyan: 'bg-cyan-500',
  yellow: 'bg-yellow-500',
};

export const BarChart: React.FC<BarChartProps> = ({ data, title, color }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
        <h3 className="text-md font-semibold text-white mb-4">{title}</h3>
        <div className="flex-grow flex items-center justify-center text-gray-500 text-sm">
          No hay datos disponibles.
        </div>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(item => item.value), 1); // Avoid division by zero

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-md font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow flex items-end justify-around space-x-2">
        {data.map(item => (
          <div key={item.label} className="flex flex-col items-center flex-1 text-center">
            <div className="text-sm font-bold text-white mb-1">{item.value}</div>
            <div
              className={`w-full rounded-t-md ${colorClasses[color]} transition-all duration-500`}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              title={`${item.label}: ${item.value}`}
            ></div>
            <div className="mt-2 text-xs text-gray-400 truncate w-full">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};