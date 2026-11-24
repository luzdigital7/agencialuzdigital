// Tiempos (segundos) medidos sobre public/voz2/voz.mp3
export type Sentence = { start: number; end: number; text: string; hl: string[] };

export const SENTENCES: Sentence[] = [
  { start: 0.0, end: 3.59, text: "Tu Instagram puede estar perdiendo clientes por tres errores.", hl: ["perdiendo", "clientes", "tres"] },
  { start: 3.86, end: 6.21, text: "Y te enseño a encontrarlos en tres pasos.", hl: ["tres", "pasos"] },
  { start: 6.61, end: 8.18, text: "Primero, revisa tu bio.", hl: ["bio"] },
  { start: 8.49, end: 12.5, text: "Si termina en un número y no en una acción, nadie sabe qué hacer.", hl: ["número", "acción"] },
  { start: 12.98, end: 14.6, text: "Segundo, mira tu feed.", hl: ["feed"] },
  { start: 14.92, end: 18.54, text: "Si todo habla de lo mismo, solo atraes a un tipo de cliente.", hl: ["mismo", "solo"] },
  { start: 19.11, end: 20.8, text: "Tercero, traza el camino.", hl: ["camino"] },
  { start: 21.1, end: 26.09, text: "Del seguidor al cliente tiene que haber una ruta clara: bio, destacados y WhatsApp.", hl: ["ruta", "WhatsApp"] },
  { start: 26.7, end: 29.7, text: "¿No quieres hacerlo solo? Te hacemos la auditoría completa.", hl: ["solo", "auditoría"] },
  { start: 29.91, end: 33.99, text: "Matriz FODA, propuesta de contenido, Reels y plan de 30 días.", hl: ["FODA", "contenido", "Reels", "30"] },
  { start: 34.43, end: 37.41, text: "Vale US$ 75, y hoy es gratis.", hl: ["75", "gratis"] },
  { start: 37.61, end: 40.99, text: "Comenta AUDITORÍA y te escribimos para analizar tu Instagram.", hl: ["AUDITORÍA"] },
];

export const TOTAL = 44.0;
