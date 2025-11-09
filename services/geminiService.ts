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
    console.error("Error calling Gemini API:", error);

    // Provide specific error messages for common API key issues
    if (error.message && typeof error.message === 'string') {
      if (error.message.includes("API key must be a non-empty string") || error.message.includes("clave de API de Gemini no está configurada")) {
        // This is for the explicit check where API_KEY is empty.
        throw new Error("GEMINI_API_KEY_MISSING: La clave de API de Gemini no está configurada o es inválida.");
      }
      // This catches the specific Gemini API error response for an invalid key
      if (error.message.includes("API key not valid") || error.message.includes("INVALID_ARGUMENT")) {
        throw new Error("GEMINI_API_KEY_INVALID: La clave de API de Gemini no es válida. Por favor, configúrala correctamente.");
      }
      // This specific error message (from the guidelines) indicates a problem requiring key re-selection.
      if (error.message.includes("Requested entity was not found.")) {
        throw new Error("GEMINI_AUTH_ERROR: Error de autenticación o clave de API de Gemini inválida. Por favor, vuelve a seleccionar tu clave.");
      }
    }
    
    // Fallback for other errors
    throw new Error("Hubo un problema al analizar la imagen. Por favor, intente de nuevo.");
  }
};