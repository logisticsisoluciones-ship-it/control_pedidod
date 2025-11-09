
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
    }, (error) => {
        console.error("Error listening to operators collection:", error);
        if (onFatalError) {
          onFatalError("No se pudo conectar a la base de datos de preparadores. Por favor, verifica tu configuración de Firebase.");
        } else {
          alert("No se pudo conectar a la base de datos de preparadores.");
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isLoading, onFatalError]);

  const addOperator = useCallback(async (operator: Operator) => {
    if (operators.some(op => op.id === operator.id)) {
        alert(`El preparador con la cédula ${operator.id} ya existe.`);
        return;
    }

    try {
        await firebaseService.save(OPERATORS_COLLECTION, operator);
        // State will be updated by the listener
    } catch (error) {
        console.error("Error saving operator to Firebase", error);
        alert("No se pudo guardar el preparador.");
    }
  }, [operators]);

  const updateOperator = useCallback(async (operator: Operator) => {
    try {
      await firebaseService.save(OPERATORS_COLLECTION, operator);
      // State will be updated by the listener
    } catch (error) {
      console.error("Error updating operator in Firebase", error);
      alert("No se pudo actualizar el preparador.");
    }
  }, []);

  const removeOperator = useCallback(async (operatorId: string) => {
    try {
        await firebaseService.remove(OPERATORS_COLLECTION, operatorId);
        // State will be updated by the listener
    } catch (error) {
        console.error("Error removing operator from Firebase", error);
        alert("No se pudo eliminar el preparador.");
    }
  }, []);

  return { operators, isLoading, addOperator, updateOperator, removeOperator };
};