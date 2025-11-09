import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo actual (desarrollo/producción).
  // Es crucial cargar SOLO las variables con el prefijo 'VITE_' para que Vite las exponga de forma segura al frontend.
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    define: {
      // Expone la variable de entorno VITE_API_KEY como process.env.API_KEY en el código del cliente.
      // Esto sigue estrictamente las directrices de codificación de @google/genai, que requieren
      // que la clave de API se acceda a través de process.env.API_KEY.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
  };
});