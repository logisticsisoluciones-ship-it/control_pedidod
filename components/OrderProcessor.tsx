import React, { useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface OrderProcessorProps {
  onImageScan: (file: File) => void;
  isLoading: boolean;
}

export const OrderProcessor: React.FC<OrderProcessorProps> = ({ onImageScan, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageScan(file);
    }
     // Reset file input to allow re-selection of the same file
    if(event.target) {
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={handleButtonClick}
          disabled={isLoading}
          className="flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full text-white shadow-lg transform transition-transform duration-200 hover:scale-110 hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed"
          aria-label="Escanear Pedido"
        >
          {isLoading ? (
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <CameraIcon className="w-8 h-8" />
          )}
        </button>
      </div>
    </>
  );
};