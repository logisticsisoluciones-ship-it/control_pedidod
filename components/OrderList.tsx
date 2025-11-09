import React from 'react';
import { Order } from '../types';
import { OrderCard } from './OrderCard';

type FilterStatus = 'all' | 'pending' | 'to_be_prepared' | 'ongoing' | 'completed';

interface OrderListProps {
  orders: Order[];
  filterStatus: FilterStatus;
  onChangePendingStatus: (orderId: string, status: 'por_preparar' | 'pendiente') => void;
}

const EmptyState: React.FC<{ filterStatus: FilterStatus }> = ({ filterStatus }) => {
  const messages = {
    all: {
      title: "No hay pedidos registrados.",
      subtitle: "Usa el botón de la cámara para empezar."
    },
    to_be_prepared: {
      title: "No hay pedidos por preparar.",
      subtitle: "Los nuevos pedidos listos para preparar aparecerán aquí."
    },
    pending: {
      title: "No hay pedidos pendientes.",
      subtitle: "Los pedidos marcados con incidencias aparecerán aquí."
    },
    ongoing: {
      title: "No hay pedidos en proceso.",
      subtitle: "¡Buen trabajo! Estás al día."
    },
    completed: {
      title: "No hay pedidos completados.",
      subtitle: "Completa un pedido para verlo aquí."
    }
  };
  
  const { title, subtitle } = messages[filterStatus];

  return (
    <div className="text-center py-16 text-gray-500">
      <p>{title}</p>
      <p className="mt-2 text-sm">{subtitle}</p>
    </div>
  );
};

export const OrderList: React.FC<OrderListProps> = ({ orders, filterStatus, onChangePendingStatus }) => {

  if (orders.length === 0) {
    return <EmptyState filterStatus={filterStatus} />;
  }
  
  const ongoingOrders = orders.filter(o => o.startTime && !o.endTime);
  const toBePreparedOrders = orders.filter(o => !o.startTime && o.pendingStatus !== 'pendiente');
  const pendingOnHoldOrders = orders.filter(o => !o.startTime && o.pendingStatus === 'pendiente');
  const completedOrders = orders.filter(o => o.endTime);

  const shouldShowSection = (status: FilterStatus) => filterStatus === 'all' || filterStatus === status;


  return (
    <div className="space-y-8">
      {shouldShowSection('ongoing') && ongoingOrders.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-yellow-400 mb-4 px-1">En Proceso</h2>
          <div className="space-y-4">
            {ongoingOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </section>
      )}

      {shouldShowSection('to_be_prepared') && toBePreparedOrders.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-blue-400 mb-4 px-1">Por Preparar</h2>
          <div className="space-y-4">
            {toBePreparedOrders.map(order => <OrderCard key={order.id} order={order} onChangePendingStatus={onChangePendingStatus} />)}
          </div>
        </section>
      )}

      {shouldShowSection('pending') && pendingOnHoldOrders.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-400 mb-4 px-1">Pendientes (con incidencia)</h2>
          <div className="space-y-4">
            {pendingOnHoldOrders.map(order => <OrderCard key={order.id} order={order} onChangePendingStatus={onChangePendingStatus} />)}
          </div>
        </section>
      )}

      {shouldShowSection('completed') && completedOrders.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-green-400 mb-4 px-1">Completados</h2>
          <div className="space-y-4">
            {completedOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </section>
      )}
    </div>
  );
};