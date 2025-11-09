import React, { useState, useEffect, useCallback } from 'react';
import { Operator } from '../types';
import * as firebaseService from '../services/firebaseService';

const OPERATORS_COLLECTION = 'operators';

interface UseOperatorsProps {
  onFatalError?: (message: string) => void;
}

export const useOperators = ({ onFatalError }: UseOperatorsProps = {}) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.listenToCollection<Operator>(OPERATORS_COLLECTION, (fetchedOperators) => {
      setOperators(fetchedOperators.sort((a,b) => a.name.localeCompare(b.name)));
      if (isLoading) {
          setIsLoading(false);
      }
    }, (error: any) => {
        console.error("Error listening to operators collection:", error);
        if (onFatalError) {
          if (error.code === 'permission-denied') {
            onFatalError("Error de Permiso: La aplicación no tiene permiso para leer la base de datos de preparadores. Por favor, verifica las reglas de seguridad de Firestore.");
          } else {
            onFatalError("No se pudo conectar a la base de datos de preparadores. Por favor, verifica tu configuración de Firebase.");
          }
        } else {
          alert("No se pudo conectar a la base de datos de preparadores.");
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isLoading, onFatalError]);

  const addOperator = useCallback(async (operator: Operator) => {
    try {
      await firebaseService.save(OPERATORS_COLLECTION, operator);
    } catch (error) {
      console.error("Error adding operator", error);
      alert("No se pudo añadir el preparador.");
    }
  }, []);

  const updateOperator = useCallback(async (operator: Operator) => {
    try {
      await firebaseService.save(OPERATORS_COLLECTION, operator);
    } catch (error) {
      console.error("Error updating operator", error);
      alert("No se pudo actualizar el preparador.");
    }
  }, []);

  const removeOperator = useCallback(async (operatorId: string) => {
    try {
      await firebaseService.remove(OPERATORS_COLLECTION, operatorId);
    } catch (error) {
      console.error("Error removing operator", error);
      alert("No se pudo eliminar el preparador.");
    }
  }, []);

  return { operators, isLoading, addOperator, updateOperator, removeOperator };
};
