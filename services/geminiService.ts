import { GoogleGenAI } from "@google/genai";

// Custom error for a missing API key is removed as per new API key selection flow.
// The app will now proactively manage API key selection and rely on GoogleGenAI's errors.

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const extractOrderNumberFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    // Adhering to @google/genai coding guidelines, API key must be accessed via process.env.API_KEY.
    const API_KEY = process.env.API_KEY; 
    
    console.log("Gemini API_KEY (first few chars):", API_KEY ? API_KEY.substring(0, 5) + '...' : 'undefined/empty');

    // If API_KEY is still not found or is the string "undefined", throw an error early.
    if (!API_KEY || API_KEY === 'undefined') {
      throw new Error("GEMINI_API_KEY_MISSING: La clave de API de Gemini no está configurada. Por favor, asegúrate de haberla seleccionado o configurado."); // Custom error code
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY }); 
    const model = 'gemini-2.5-flash';
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const prompt = `Analiza esta imagen de un documento. Encuentra el número de pedido. Suele estar etiquetado como 'Nº Pedido', 'Pedido', 'Order #', o similar. Devuelve ÚNICAMENTE el número de pedido como texto plano, sin ninguna explicación adicional. Si no se encuentra un número de pedido claro, devuelve la palabra 'NOT_FOUND'.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }, imagePart] },
    });
    
    const text = response.text.trim();

    if (!text || text === 'NOT_FOUND') {
        throw new Error("No se pudo encontrar un número de pedido en la imagen.");
    }

    return text;

  } catch (error: any) {
    console.error("Error en la llamada a Gemini API:", error);
    if (error.message && (error.message.includes('API key not valid') || error.message.includes('PERMISSION_DENIED'))) {
        throw new Error("GEMINI_API_KEY_INVALID: La clave de API de Gemini no es válida o ha caducado. Por favor, selecciona una nueva.");
    }
     if (error.message && error.message.includes('not found')) { // Vercel might throw this for env vars
        throw new Error("GEMINI_AUTH_ERROR: La clave de API no se encontró en el entorno. Asegúrate de que VITE_API_KEY esté configurada en Vercel.");
    }
    if (error.message && error.message.includes('GEMINI_API_KEY_MISSING')) {
        throw error; // Re-throw the custom error to be caught by the App component
    }
    // Generic error for other issues (network, etc.)
    throw new Error("No se pudo comunicar con el servicio de IA para analizar la imagen.");
  }
};