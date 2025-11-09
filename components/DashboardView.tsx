import React, { useState, useMemo } from 'react';
import { Order, Operator } from '../types';
import { calculateDuration } from '../utils/timeUtils';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';

interface DashboardViewProps {
  orders: Order[];
  operators: Operator[];
}

const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className="mt-2 text-2xl font-bold text-cyan-400">{value}</p>
    </div>
);

const toISODateString = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export const DashboardView: React.FC<DashboardViewProps> = ({ orders, operators }) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const [startDate, setStartDate] = useState<string>(toISODateString(sevenDaysAgo));
    const [endDate, setEndDate] = useState<string>(toISODateString(today));
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = order.endTime ? new Date(order.endTime) : new Date(order.creationTime);
            const orderTime = orderDate.getTime();
            
            if (startDate) {
                const filterStartTime = new Date(startDate).getTime();
                if (orderTime < filterStartTime) return false;
            }
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                const filterEndTime = endOfDay.getTime();
                if (orderTime > filterEndTime) return false;
            }
            return true;
        });
    }, [orders, startDate, endDate]);

    const stats = useMemo(() => {
        const completedFilteredOrders = filteredOrders.filter(o => !!o.endTime);
        const totalCompletedOrders = completedFilteredOrders.length;
        
        if (totalCompletedOrders === 0) {
            // Still calculate pie chart data even if no orders are completed
            const statusCounts = filteredOrders.reduce((acc, order) => {
                if (order.endTime) acc.completed += 1;
                else if (order.startTime) acc.inProcess += 1;
                else if (order.pendingStatus === 'pendiente') acc.pending += 1;
                else acc.toBePrepared += 1;
                return acc;
            }, { completed: 0, inProcess: 0, toBePrepared: 0, pending: 0 });

             const pieChartData = [
                { label: 'Completados', value: statusCounts.completed, color: 'bg-green-500' },
                { label: 'En Proceso', value: statusCounts.inProcess, color: 'bg-yellow-500' },
                { label: 'Por Preparar', value: statusCounts.toBePrepared, color: 'bg-blue-500' },
                { label: 'Pendientes', value: statusCounts.pending, color: 'bg-gray-500' },
            ].filter(item => item.value > 0);

            return {
                totalCompletedOrders: '0',
                avgWaitTime: 'N/A',
                avgPrepTime: 'N/A',
                ordersByDay: [],
                ordersByOperator: [],
                pieChartData,
                operatorPerformance: [],
            };
        }

        const totalWaitTime = completedFilteredOrders.reduce((acc, order) => {
            if (!order.startTime) return acc;
            return acc + (new Date(order.startTime).getTime() - new Date(order.creationTime).getTime());
        }, 0);

        const totalPrepTime = completedFilteredOrders.reduce((acc, order) => {
            if (!order.startTime || !order.endTime) return acc;
            return acc + (new Date(order.endTime).getTime() - new Date(order.startTime).getTime());
        }, 0);
        
        const avgWaitTime = calculateDuration(null, new Date(totalWaitTime / totalCompletedOrders).toISOString());
        const avgPrepTime = calculateDuration(null, new Date(totalPrepTime / totalCompletedOrders).toISOString());
        
        const ordersByDayMap = new Map<string, number>();
        completedFilteredOrders.forEach(order => {
            const day = new Date(order.endTime!).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            ordersByDayMap.set(day, (ordersByDayMap.get(day) || 0) + 1);
        });
        const ordersByDay = Array.from(ordersByDayMap, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label, 'es-ES'));

        const ordersByOperatorMap = new Map<string, number>();
        completedFilteredOrders.forEach(order => {
            const operatorName = order.operator?.name || 'No asignado';
            ordersByOperatorMap.set(operatorName, (ordersByOperatorMap.get(operatorName) || 0) + 1);
        });
        const ordersByOperator = Array.from(ordersByOperatorMap, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
        
        const statusCounts = filteredOrders.reduce((acc, order) => {
            if (order.endTime) acc.completed += 1;
            else if (order.startTime) acc.inProcess += 1;
            else if (order.pendingStatus === 'pendiente') acc.pending += 1;
            else acc.toBePrepared += 1;
            return acc;
        }, { completed: 0, inProcess: 0, toBePrepared: 0, pending: 0 });

        const pieChartData = [
            { label: 'Completados', value: statusCounts.completed, color: 'bg-green-500' },
            { label: 'En Proceso', value: statusCounts.inProcess, color: 'bg-yellow-500' },
            { label: 'Por Preparar', value: statusCounts.toBePrepared, color: 'bg-blue-500' },
            { label: 'Pendientes', value: statusCounts.pending, color: 'bg-gray-500' },
        ].filter(item => item.value > 0);

        const operatorPerformance = operators.map(operator => {
            const operatorOrders = completedFilteredOrders.filter(
                order => order.operator?.id === operator.id
            );

            if (operatorOrders.length === 0) return null;

            const totalPrep = operatorOrders.reduce((acc, order) => acc + (new Date(order.endTime!).getTime() - new Date(order.startTime!).getTime()), 0);

            return {
                id: operator.id,
                name: operator.name,
                totalOrders: operatorOrders.length,
                avgPrepTime: calculateDuration(null, new Date(totalPrep / operatorOrders.length).toISOString()),
            };
        }).filter(Boolean).sort((a, b) => b!.totalOrders - a!.totalOrders) as { id: string; name: string; totalOrders: number; avgPrepTime: string }[];

        return { 
            totalCompletedOrders: totalCompletedOrders.toString(), 
            avgWaitTime, 
            avgPrepTime, 
            ordersByDay, 
            ordersByOperator,
            pieChartData,
            operatorPerformance,
        };
    }, [filteredOrders, operators]);

    return (
        <div className="animate-fade-in-scale space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-200 self-start sm:self-center">Dashboard</h2>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg flex flex-wrap items-end gap-4">
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="start-date-dash" className="block text-xs font-medium text-gray-400 mb-1">Desde</label>
                    <input
                        type="date"
                        id="start-date-dash"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-gray-700 text-gray-300 text-sm rounded-md border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 py-2 px-3"
                    />
                </div>
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="end-date-dash" className="block text-xs font-medium text-gray-400 mb-1">Hasta</label>
                    <input
                        type="date"
                        id="end-date-dash"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-gray-700 text-gray-300 text-sm rounded-md border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 py-2 px-3"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Pedidos Completados" value={stats.totalCompletedOrders} />
                <StatCard title="T. Medio Espera" value={stats.avgWaitTime} />
                <StatCard title="T. Medio Preparación" value={stats.avgPrepTime} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{minHeight: '350px'}}>
                <PieChart title="Estado de Pedidos" data={stats.pieChartData} />
                <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full flex flex-col">
                    <h3 className="text-md font-semibold text-white mb-4">Rendimiento por Preparador</h3>
                    <div className="flex-grow overflow-y-auto">
                        {stats.operatorPerformance.length > 0 ? (
                            <table className="min-w-full">
                                <thead className="sticky top-0 bg-gray-800 z-10">
                                    <tr>
                                        <th className="py-2 pr-2 text-left text-xs font-medium text-gray-400 uppercase">Preparador</th>
                                        <th className="py-2 px-2 text-center text-xs font-medium text-gray-400 uppercase">Pedidos</th>
                                        <th className="py-2 pl-2 text-right text-xs font-medium text-gray-400 uppercase">T. Prep. Medio</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {stats.operatorPerformance.map(op => (
                                        <tr key={op.id}>
                                            <td className="py-3 pr-2 text-sm font-medium text-white truncate" title={op.name}>{op.name}</td>
                                            <td className="py-3 px-2 text-sm text-center text-gray-300">{op.totalOrders}</td>
                                            <td className="py-3 pl-2 text-sm font-semibold text-right text-cyan-400">{op.avgPrepTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                No hay datos de rendimiento.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-80">
                <BarChart title="Pedidos Completados por Día" data={stats.ordersByDay} color="cyan" />
                <BarChart title="Pedidos Completados por Preparador" data={stats.ordersByOperator} color="yellow" />
            </div>
        </div>
    );
};