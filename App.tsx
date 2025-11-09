import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Order, Operator } from './types';
import { useOrders } from './hooks/useOrders';
import { useOperators } from './hooks/useOperators';
import { extractOrderNumberFromImage } from './services/geminiService';
import { Header } from './components/Header';
import { OrderList } from './components/OrderList';
import { OrderProcessor } from './components/OrderProcessor';
import { FilterControls } from './components/FilterControls';
import { HistoryView } from './components/HistoryView';
import { OperatorManagementView } from './components/OperatorManagementView';
import { OperatorSelectionModal } from './components/OperatorSelectionModal';
import { InitialActionModal } from './components/InitialActionModal';
import { DashboardView } from './components/DashboardView';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

type FilterStatus = 'all' | 'pending' | 'to_be_prepared' | 'ongoing' | 'completed';
type View = 'orders' | 'dashboard' | 'history' | 'operators';

const FullScreenLoader: React.FC = () => (
  <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
    <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg text-gray-300">Cargando datos...</p>
  </div>
);


const App: React.FC = () => {
  const [appWideError, setAppWideError] = useState<string | null>(null);
  const [hasApiKeySelected, setHasApiKeySelected] = useState(true); // Optimistically assume key is present

  const handleFatalError = useCallback((message: string) => {
    setAppWideError(message);
  }, []);

  const { orders, isLoading: ordersLoading, addOrder, updateOrder, clearCompleted } = useOrders({ onFatalError: handleFatalError });
  const { operators, isLoading: operatorsLoading, addOperator, updateOperator, removeOperator } = useOperators({ onFatalError: handleFatalError });
  
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null); // For non-fatal, transient errors
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [view, setView] = useState<View>('orders');
  
  const [pendingOrderInfo, setPendingOrderInfo] = useState<{ id: string, isNewOrder: boolean } | null>(null);

  // Effect to check API key status on component mount, primarily for AI Studio environment
  useEffect(() => {
    const checkApiKeyStatus = async () => {
      // This check is primarily for the AI Studio environment to proactively prompt for a key.
      // For other environments, we optimistically assume a key is present and let API call
      // failures trigger the setup screen.
      if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const isSelected = await window.aistudio.hasSelectedApiKey();
        if (!isSelected) {
          setHasApiKeySelected(false);
          // No error message is needed here; the dedicated UI for key selection is sufficient.
        } else {
          setHasApiKeySelected(true); // Ensure it's true if already selected
          setAppWideError(null); // Clear any previous API key errors
        }
      } else {
        // In a hosted environment, we rely solely on process.env.API_KEY being injected externally.
        // We do NOT attempt to read it here directly in the frontend component's useEffect,
        // as it might not be fully initialized or visible to frontend JS at this exact moment.
        // Instead, we optimistically assume it will be available when `geminiService` calls it.
        // The `geminiService` will throw an error if it's truly missing,
        // and the error handling in `handleImageScan` will then prompt the user
        // to configure the environment variable.
        setHasApiKeySelected(true); // Default to true, let the API call logic determine if the key is bad
        setAppWideError(null); // Clear any previous API key errors
      }
    };
    checkApiKeyStatus();
  }, []); // Run only once on mount.

  const handleImageScan = useCallback(async (file: File) => {
    console.log("--- handleImageScan iniciado ---");
    console.log("Estado actual de hasApiKeySelected:", hasApiKeySelected);
    console.log("Número de operadores cargados:", operators.length);
    console.log("Vista actual:", view);

    if (!hasApiKeySelected) { 
      console.log("handleImageScan: API Key not selected. Aborting scan.");
      // The user should be seeing the key selection screen, so just prevent the action.
      return;
    }

    if (operators.length === 0 && view !== 'operators') { // Only redirect if not already in the operators view.
        console.warn("handleImageScan: No hay preparadores definidos. Redirigiendo a la pestaña 'Preparadores'.");
        setError("No hay preparadores definidos. Vaya a la pestaña 'Preparadores' para agregar uno primero.");
        setView('operators');
        return;
    }
    
    setIsProcessingImage(true);
    setAppWideError(null); // Clear app-wide errors on new attempt
    setError(null); // Clear transient errors
    try {
      console.log("handleImageScan: Convirtiendo imagen a Base64...");
      const base64Image = await fileToBase64(file);
      console.log("handleImageScan: Llamando a Gemini API para extraer número de pedido...");
      const orderId = await extractOrderNumberFromImage(base64Image, file.type);
      console.log("handleImageScan: Número de pedido extraído por Gemini:", orderId);
      
      const sanitizedId = orderId.trim().replace(/[^a-zA-Z0-9-]/g, '');
      console.log("handleImageScan: ID de pedido sanitizado:", sanitizedId);
      
      const validIdRegex = /^[a-zA-Z0-9-]+$/;
      if (!sanitizedId) {
        throw new Error("El ID del pedido extraído de la imagen está vacío.");
      }
      if (!validIdRegex.test(sanitizedId)) {
        throw new Error(`El ID de pedido '${sanitizedId}' no es válido. Solo se permiten letras, números y guiones.`);
      }

      const existingOrder = orders.find(o => o.id === sanitizedId);
      console.log("handleImageScan: Pedido existente encontrado:", existingOrder);

      if (!existingOrder) {
        console.log("handleImageScan: Pedido NUEVO detectado. Estableciendo pendingOrderInfo para InitialActionModal.");
        setPendingOrderInfo({ id: sanitizedId, isNewOrder: true });
      } else if (existingOrder.startTime === null) {
        console.log("handleImageScan: Pedido existente sin iniciar. Estableciendo pendingOrderInfo para OperatorSelectionModal.");
        setPendingOrderInfo({ id: sanitizedId, isNewOrder: false });
      } else if (existingOrder.endTime === null) {
        console.log("handleImageScan: Pedido existente en proceso. Marcando como finalizado.");
        updateOrder({ ...existingOrder, endTime: new Date().toISOString() });
      } else {
        console.warn("handleImageScan: Pedido existente ya finalizado.");
        setError(`El pedido ${sanitizedId} ya fue finalizado.`);
      }

    } catch (e: any) { // Catch any error thrown
        console.error("handleImageScan: Error durante el escaneo de imagen:", e);
        let errorMessage = "Ocurrió un error inesperado al procesar la imagen.";

        if (e instanceof Error) {
            errorMessage = e.message;
            // Check for specific API key related errors from geminiService.ts
            if (errorMessage.startsWith("GEMINI_API_KEY_MISSING:") || 
                errorMessage.startsWith("GEMINI_API_KEY_INVALID:") ||
                errorMessage.startsWith("GEMINI_AUTH_ERROR:")) {
                
                console.error("handleImageScan: Error de API Key. Reiniciando selección/configuración.");
                setHasApiKeySelected(false); // Reset to prompt re-selection/configuration
                
                const isAiStudio = typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function';

                if (isAiStudio) {
                    setAppWideError(
                        "Se produjo un error con tu clave de API de Gemini. Por favor, vuelve a seleccionar una clave válida."
                    );
                } else {
                    setAppWideError(
                      "Se requiere una clave de API de Gemini válida. " +
                      "Por favor, asegúrate de haberla configurado correctamente en tu entorno de hosting " +
                      "(como la variable de entorno `VITE_API_KEY` en Netlify) y vuelve a desplegar la aplicación."
                    );
                }

                setIsProcessingImage(false); 
                return; 
            }
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
        setError(errorMessage); // Set as a transient error for other issues
    } finally {
      setIsProcessingImage(false);
      console.log("--- handleImageScan finalizado ---");
    }
  }, [orders, operators, view, updateOrder, hasApiKeySelected, addOrder]);
  
  const handleChangePendingStatus = (orderId: string, status: 'por_preparar' | 'pendiente') => {
    const orderToChange = orders.find(o => o.id === orderId);
    if (orderToChange && !orderToChange.startTime) {
        updateOrder({ ...orderToChange, pendingStatus: status });
    }
  };

  const handleSetPendingStatus = (status: 'por_preparar' | 'pendiente') => {
    if (!pendingOrderInfo) return;
    const newOrder: Order = {
      id: pendingOrderInfo.id,
      creationTime: new Date().toISOString(),
      startTime: null,
      endTime: null,
      operator: null,
      pendingStatus: status,
    };
    addOrder(newOrder);
    setPendingOrderInfo(null);
  };

  const handleStartAssignment = () => {
    setPendingOrderInfo(info => info ? { ...info, isNewOrder: false } : null);
  };


  const handleOperatorSelectionConfirm = (selectedOperator: Operator) => {
    if (!pendingOrderInfo) return;
    const { id } = pendingOrderInfo;

    const existingOrder = orders.find(o => o.id === id);

    if (existingOrder) { 
      updateOrder({ ...existingOrder, operator: selectedOperator, startTime: new Date().toISOString() });
    } else { 
      const now = new Date().toISOString();
      const newOrder: Order = {
        id: id,
        creationTime: now,
        startTime: now,
        endTime: null,
        operator: selectedOperator,
      };
      addOrder(newOrder);
    }

    setPendingOrderInfo(null);
  };

  const handleModalCancel = () => {
    setPendingOrderInfo(null);
  };

  const handleClearHistory = () => {
    clearCompleted();
  };

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'to_be_prepared') {
      return orders.filter(o => o.startTime === null && o.pendingStatus !== 'pendiente');
    }
    if (filterStatus === 'pending') {
      return orders.filter(o => o.startTime === null && o.pendingStatus === 'pendiente');
    }
    if (filterStatus === 'ongoing') {
      return orders.filter(o => o.startTime !== null && o.endTime === null);
    }
    if (filterStatus === 'completed') {
      return orders.filter(o => o.endTime !== null);
    }
    return orders;
  }, [orders, filterStatus]);

  const completedOrders = useMemo(() => {
    return orders.filter(o => o.endTime !== null);
  }, [orders]);
  
  // Show full screen loader if data is loading (Firebase related)
  if (ordersLoading || operatorsLoading) {
    return <FullScreenLoader />;
  }

  const renderContent = () => {
    switch (view) {
      case 'orders':
        return (
          <>
            <FilterControls filterStatus={filterStatus} onFilterChange={setFilterStatus} />
            <OrderList orders={filteredOrders} filterStatus={filterStatus} onChangePendingStatus={handleChangePendingStatus} />
          </>
        );
      case 'dashboard':
        return <DashboardView orders={orders} operators={operators} />;
      case 'history':
        return <HistoryView 
                  orders={completedOrders} 
                  operators={operators} 
                  onClearHistory={handleClearHistory} 
               />;
      case 'operators':
        return <OperatorManagementView 
                  operators={operators}
                  onAddOperator={addOperator}
                  onUpdateOperator={updateOperator}
                  onRemoveOperator={removeOperator}
               />;
      default:
        return null;
    }
  }

  // Render API Key selection UI if not selected
  const isAiStudio = typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function';
  if (!hasApiKeySelected) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-4 z-50 animate-fade-in-scale">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Clave de API de Gemini Requerida</h2>
        
        {isAiStudio ? (
          <>
            <p className="text-gray-300 text-center mb-8 max-w-md">
              Para usar la función de escaneo de pedidos, por favor, selecciona tu clave de API de Gemini.
              Esta aplicación se conecta a la IA de Gemini para procesar las imágenes.
            </p>
            <button
              onClick={async () => {
                try {
                  await window.aistudio.openSelectKey();
                  // Optimistically set to true. If the key is bad, the next API call will fail and bring the user back here.
                  setHasApiKeySelected(true);
                  setAppWideError(null);
                } catch (e) {
                  console.error("Error opening API key selection:", e);
                  setAppWideError("No se pudo abrir el diálogo de selección de clave.");
                }
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50"
            >
              Seleccionar Clave de API de Gemini
            </button>
          </>
        ) : (
           <div className="max-w-2xl w-full">
            <p className="text-gray-300 text-center mb-6">
                Esta aplicación requiere una clave de API de Gemini para funcionar. Parece que no se ha configurado ninguna.
            </p>
            <div className="bg-gray-800 p-6 rounded-lg border border-yellow-600/50 text-yellow-200 w-full animate-pulse-border-red">
                <strong className="font-bold text-lg text-yellow-300">¡Atención! Acción Requerida:</strong>
                <p className="mt-4 text-sm text-gray-300">
                    Para que la aplicación funcione en tu entorno de hosting (como Netlify o Vercel), debes configurar una variable de entorno llamada <code className="bg-gray-900 px-1 py-0.5 rounded text-yellow-300 font-bold">VITE_API_KEY</code>. {/* Updated message */}
                    El valor de esta variable debe ser tu clave de API de Gemini.
                </p>
                 <p className="mt-3 text-sm text-gray-300">
                    Después de añadir o actualizar la variable de entorno en tu proveedor de hosting, **necesitarás volver a desplegar la aplicación** para que los cambios surtan efecto.
                </p>
            </div>
          </div>
        )}

        <p className="mt-8 text-sm text-gray-500 text-center max-w-md">
          Necesitarás una clave de API de Gemini. Puedes encontrar más información en la 
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:underline ml-1"
          >
            documentación de facturación
          </a>.
        </p>
        {appWideError && (
             <div 
                className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mt-8 animate-fade-in-scale max-w-2xl w-full" 
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{appWideError}</span>
              </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header 
        currentView={view} 
        onViewChange={setView} 
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {appWideError && !appWideError.includes("clave de API") ? ( // Only show non-api errors here
          <div 
            className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6 animate-fade-in-scale" 
            role="alert"
          >
            <strong className="font-bold">Error Crítico: </strong>
            <span className="block sm:inline">{appWideError}</span>
          </div>
        ) : (
          <>
            {error && (
              <div 
                className="bg-red-800/60 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6 animate-fade-in-scale" 
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  aria-label="Cerrar"
                >
                  <span className="text-2xl" aria-hidden="true">&times;</span>
                </button>
              </div>
            )}
            {renderContent()}
            <OrderProcessor onImageScan={handleImageScan} isLoading={isProcessingImage} />
          </>
        )}
      </main>
      
      {pendingOrderInfo && pendingOrderInfo.isNewOrder && (
          <InitialActionModal 
            isOpen={true}
            orderId={pendingOrderInfo.id}
            onAssign={handleStartAssignment}
            onSetPendingStatus={handleSetPendingStatus}
            onCancel={handleModalCancel}
          />
      )}

      {pendingOrderInfo && !pendingOrderInfo.isNewOrder && (
        <OperatorSelectionModal
          isOpen={true}
          orderId={pendingOrderInfo.id}
          operators={operators}
          onConfirm={handleOperatorSelectionConfirm}
          onCancel={handleModalCancel}
        />
      )}

    </div>
  );
};

export default App;