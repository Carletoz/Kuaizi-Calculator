export interface ScanResult {
  description: string;
  hsCategoryId: string;
  dimensionsCm: { l: number; w: number; h: number };
  weightKg: number;
}

const HS_CATEGORIES_CONTEXT = `textiles: Textiles y confecciones
footwear: Calzado
ceramics: Cerámica y porcelana
electronics: Electrónicos y accesorios
toys: Juguetes y artículos de juego
furniture: Muebles y accesorios del hogar
machinery: Maquinaria y equipos industriales
hardware: Herramientas y ferretería
plastics: Plásticos y manufacturas
cosmetics: Cosméticos y cuidado personal
supplements: Suplementos alimenticios
food: Alimentos procesados
steel: Acero y productos metálicos
sporting: Artículos deportivos
packaging: Materiales de embalaje
lighting: Iluminación y electricidad
bags: Bolsos y marroquinería
stationery: Papelería y artículos de oficina
chemicals: Químicos e insumos industriales
other: Otros`;

const SCAN_PROMPT = `You are an import logistics assistant. Analyze the product in this image.

Return ONLY a JSON object with this exact structure:
{
  "description": "<product description in Spanish, max 80 chars>",
  "hsCategoryId": "<one of the IDs listed below>",
  "dimensionsCm": { "l": <number>, "w": <number>, "h": <number> },
  "weightKg": <number>
}

Available hsCategoryId values — pick the best match:
${HS_CATEGORIES_CONTEXT}

Estimate dimensions and weight using typical values for this product type if not clearly visible. All numbers must be positive.`;

export async function analyzeProductImage(base64: string, mimeType: string): Promise<ScanResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('VITE_OPENAI_API_KEY no está configurado en el archivo .env');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' },
            },
            { type: 'text', text: SCAN_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Error ${response.status} de OpenAI`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Respuesta vacía de OpenAI');

  const parsed = JSON.parse(content) as ScanResult;
  if (!parsed.description || !parsed.hsCategoryId || !parsed.dimensionsCm || !parsed.weightKg) {
    throw new Error('Respuesta incompleta — intentá con otra foto');
  }

  return parsed;
}
