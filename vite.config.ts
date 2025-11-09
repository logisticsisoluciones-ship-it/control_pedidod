import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno basadas en el modo actual.
  // Esto asegura que la API_KEY se recoja correctamente
  // desde archivos .env (durante desarrollo local) o desde variables de entorno del sistema (en Netlify).
  // Fix: Cast process to any to resolve TypeScript error regarding 'cwd' property.
  // Es importante cargar las variables con prefijo VITE_ para que Vite las maneje correctamente.
  const env = loadEnv(mode, (process as any).cwd(), 'VITE_'); // <<--- CAMBIO AQUÍ: Especificar prefijo 'VITE_'

  return {
    plugins: [react()],
    define: {
      // Expone VITE_API_KEY como process.env.API_KEY, siguiendo estrictamente las guías de Google GenAI.
      // Esto permite que el SDK de Gemini acceda a la clave como process.env.API_KEY.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY), // <<--- CAMBIO AQUÍ: Usar env.VITE_API_KEY
    },
    // Si necesitas configurar una base para tu despliegue (ej. si está en una subcarpeta),
    // puedes añadirla aquí. Por ahora, asumimos que se despliega en la raíz.
    // base: '/', 
  };
});