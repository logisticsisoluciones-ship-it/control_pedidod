
import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import * as firebaseService from '../services/firebaseService';

const ORDERS_COLLECTION = 'orders';

const sortOrders = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    const getStateValue = (order: Order) => {
      if (order.startTime && !order.endTime) return 4; // En Proceso
      if (!order.startTime && !order.endTime) {
        if (order.pendingStatus === 'pendiente') return 2; // Pendiente (con incidencia)
        return 3; // Por Preparar
      }
      return 1; // Completado
    };

    const stateA = getStateValue(a);
    const stateB = getStateValue(b);

    if (stateA !== stateB) {
      return stateB - stateA;
    }

    // Within the same state, sort by time descending
    if (stateA === 4) return new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime();
    if (stateA === 3 || stateA === 2) return new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime();
    if (a.endTime && b.endTime) return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
    return 0;
  });
};

interface UseOrdersProps {
  onFatalError?: (message: string) => void;
}

export const useOrders = ({ onFatalError }: UseOrdersProps = {}) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = firebaseService.listenToCollection<Order>(ORDERS_COLLECTION, (fetchedOrders) => {
            setOrders(sortOrders(fetchedOrders));
            if (isLoading) {
                setIsLoading(false);
            }
        }, (error) => {
            console.error("Error listening to orders collection:", error);
            if (onFatalError) {
              onFatalError("No se pudo conectar a la base de datos de pedidos. Por favor, verifica tu configuración de Firebase.");
            } else {
              alert("No se pudo conectar a la base de datos de pedidos.");
            }
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [isLoading, onFatalError]);

    const addOrder = useCallback(async (order: Order) => {
        try {
            await firebaseService.save(ORDERS_COLLECTION, order);
            // State will be updated by the listener, no need to setOrders here
        } catch (error) {
            console.error("Error adding order to Firebase", error);
            alert("No se pudo guardar el pedido.");
        }
    }, []);

    const updateOrder = useCallback(async (updatedOrder: Order) => {
        try {
            await firebaseService.save(ORDERS_COLLECTION, updatedOrder);
            // State will be updated by the listener
        } catch (error) {
            console.error("Error updating order in Firebase", error);
            alert("No se pudo actualizar el pedido.");
        }
    }, []);
    
    const clearCompleted = useCallback(async () => {
        try {
            await firebaseService.clearCompletedOrders();
            // State will be updated by the listener
        } catch (error) {
            console.error("Error clearing completed orders in Firebase", error);
            alert("No se pudo limpiar el historial.");
        }
    }, []);

    return { orders, isLoading, addOrder, updateOrder, clearCompleted };
};