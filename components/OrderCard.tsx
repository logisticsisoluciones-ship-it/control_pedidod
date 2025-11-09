import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { formatDateTime, calculateDuration } from '../utils/timeUtils';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PauseIcon } from './icons/PauseIcon';

interface OrderCardProps {
  order: Order;
  onChangePendingStatus?: (orderId: string, status: 'por_preparar' | 'pendiente') => void;
}

interface StatusBadgeProps {
    order: Order;
    isOverdue: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ order, isOverdue }) => {
  if (order.endTime) {
    return (
      <div className="flex items-center text-sm text-green-400 bg-green-900/50 px-2 py-1 rounded-full">
        <CheckCircleIcon className="w-4 h-4 mr-1" />
        <span>Completado</span>
      </div>
    );
  }
  if (order.startTime) {
    return (
      <div className="flex items-center text-sm text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-full animate-pulse">
        <ClockIcon className="w-4 h-4 mr-1" />
        <span>En Proceso</span>
      </div>
    );
  }
  
  const isPendingWithIssue = order.pendingStatus === 'pendiente';
  
  if (isOverdue) {
    return (
      <div className="flex items-center text-sm text-red-400 bg-red-900/50 px-2 py-1 rounded-full">
        <PauseIcon className="w-4 h-4 mr-1" />
        <span>
          {isPendingWithIssue ? 'Pendiente' : 'Por Preparar'} (Retrasado)
        </span>
      </div>
    );
  }

  if (isPendingWithIssue) {
     return (
      <div className="flex items-center text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
        <PauseIcon className="w-4 h-4 mr-1" />
        <span>Pendiente</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-blue-400 bg-blue-900/50 px-2 py-1 rounded-full">
      <PauseIcon className="w-4 h-4 mr-1" />
      <span>Por Preparar</span>
    </div>
  );
};


export const OrderCard: React.FC<OrderCardProps> = ({ order, onChangePendingStatus }) => {
  const isPending = !order.startTime && !order.endTime;
  const isInProcess = !!order.startTime && !order.endTime;
  const isCompleted = !!order.endTime;
  
  const [isOverdue, setIsOverdue] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<string>('');

  useEffect(() => {
    if (isPending) {
      const checkOverdue = () => {
        const timeDiff = new Date().getTime() - new Date(order.creationTime).getTime();
        const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
        
        if (timeDiff > twentyFourHoursInMillis) {
          setIsOverdue(true);
        } else {
          setIsOverdue(false);
        }
      };

      checkOverdue();
      const intervalId = setInterval(checkOverdue, 60000); // Check every minute

      return () => clearInterval(intervalId);
    }
  }, [order.creationTime, isPending]);

  useEffect(() => {
    if (isInProcess) {
      const intervalId = setInterval(() => {
        setElapsedTime(calculateDuration(order.startTime, new Date().toISOString()));
      }, 1000);

      // Set initial value immediately
      setElapsedTime(calculateDuration(order.startTime, new Date().toISOString()));

      return () => clearInterval(intervalId);
    }
  }, [isInProcess, order.startTime]);

  const getBorderColor = () => {
    if (isOverdue) return 'border-red-500';
    if (isCompleted) return 'border-green-500';
    if (isInProcess) return 'border-yellow-500';
    if (order.pendingStatus === 'pendiente') return 'border-gray-500';
    return 'border-blue-500'; // Por Preparar
  };
  
  const cardClasses = [
    'bg-gray-800',
    'rounded-lg',
    'shadow-md',
    'p-4',
    'border-l-4',
    'transition-colors',
    'duration-500',
    getBorderColor(),
    isOverdue ? 'animate-pulse-border-red' : '',
  ].join(' ');

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-white break-all">Pedido: {order.id}</h3>
        <StatusBadge order={order} isOverdue={isOverdue} />
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-300">
        <div className="flex items-center">
          <span className="font-semibold w-24">Creado:</span>
          <span>{formatDateTime(order.creationTime)}</span>
        </div>
        
        {isInProcess && (
          <>
            <div className="flex items-center">
              <span className="font-semibold w-24">Inicio Prep:</span>
              <span>{formatDateTime(order.startTime!)}</span>
            </div>
            <div className="pt-2 border-t border-gray-700 mt-2 space-y-2">
                <div className="flex items-center">
                <span className="font-semibold text-cyan-400 w-24">T. Espera:</span>
                <span className="font-bold text-cyan-400">
                    {calculateDuration(order.creationTime, order.startTime)}
                </span>
                </div>
                 <div className="flex items-center">
                    <span className="font-semibold text-yellow-400 w-24">T. en Proceso:</span>
                    <span className="font-bold text-yellow-400">
                        {elapsedTime}
                    </span>
                </div>
            </div>
          </>
        )}
        
        {isCompleted && (
           <>
            <div className="flex items-center">
              <span className="font-semibold w-24">Inicio Prep:</span>
              <span>{formatDateTime(order.startTime!)}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-24">Fin Prep:</span>
              <span>{formatDateTime(order.endTime!)}</span>
            </div>
            <div className="pt-2 border-t border-gray-700 mt-2 space-y-2">
               <div className="flex items-center">
                <span className="font-semibold text-cyan-400 w-24">T. Espera:</span>
                <span className="font-bold text-cyan-400">
                  {calculateDuration(order.creationTime, order.startTime)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-cyan-400 w-24">T. Preparación:</span>
                <span className="font-bold text-cyan-400">
                  {calculateDuration(order.startTime, order.endTime)}
                </span>
              </div>
            </div>
           </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-3">
        {isPending && onChangePendingStatus && (
            <div>
                {order.pendingStatus === 'pendiente' ? (
                    <button
                        onClick={() => onChangePendingStatus(order.id, 'por_preparar')}
                        className="w-full text-center px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 bg-cyan-600 text-white hover:bg-cyan-500"
                    >
                        Mover a 'Por Preparar'
                    </button>
                ) : (
                    <button
                        onClick={() => onChangePendingStatus(order.id, 'pendiente')}
                        className="w-full text-center px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 bg-gray-600 text-white hover:bg-gray-500"
                    >
                        Mover a 'Pendiente' (con incidencia)
                    </button>
                )}
            </div>
        )}
        <div className="text-xs text-gray-400">
          <p>Preparador: <span className="font-medium text-gray-300">{order.operator?.name || 'No asignado'}</span></p>
        </div>
      </div>

    </div>
  );
};