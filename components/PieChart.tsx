import React from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string; // e.g., 'bg-cyan-500'
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
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

  const total = data.reduce((acc, item) => acc + item.value, 0);

  const colorMap: { [key: string]: string } = {
    'bg-green-500': '#22c55e',
    'bg-yellow-500': '#eab308',
    'bg-blue-500': '#3b82f6',
    'bg-gray-500': '#6b7280',
  };

  const conicGradientString = data
    .reduce(
      (acc, item) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0;
        acc.currentPercentage += percentage;
        const colorHex = colorMap[item.color] || '#6b7280';
        acc.segments.push(
          `${colorHex} ${acc.currentPercentage - percentage}% ${
            acc.currentPercentage
          }%`
        );
        return acc;
      },
      { segments: [] as string[], currentPercentage: 0 }
    )
    .segments.join(', ');

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-md font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow flex flex-col sm:flex-row items-center justify-center gap-6">
        <div
          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full"
          style={{ background: `conic-gradient(${conicGradientString})` }}
          role="img"
          aria-label={`Gráfico de torta: ${title}`}
        >
          <div className="absolute inset-2 sm:inset-3 bg-gray-800 rounded-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-white">{total}</span>
              <span className="block text-xs text-gray-400">Total</span>
            </div>
          </div>
        </div>

        <ul className="w-full max-w-xs space-y-2 text-sm">
          {data.map((item) => (
            <li key={item.label} className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></span>
              <span className="text-gray-300 flex-1">{item.label}</span>
              <span className="font-semibold text-white w-20 text-right">
                {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
