
import { GoogleGenAI, Type } from "@google/genai";
import { EbookSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUPPORTED_MULTIMODAL_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/markdown',
  'text/csv'
];

const prepareParts = (prompt: string, sources?: EbookSource[]) => {
  const parts: any[] = [{ text: prompt }];

  if (sources && sources.length > 0) {
    sources.forEach(source => {
      if (source.isBinary && SUPPORTED_MULTIMODAL_TYPES.includes(source.mimeType)) {
        parts.push({
          inlineData: {
            data: source.content.split(',')[1] || source.content,
            mimeType: source.mimeType
          }
        });
      } else {
        parts.push({ text: `\nCONTEÚDO DA FONTE [${source.name}]:\n${source.content}\n` });
      }
    });
  }

  return parts;
};

export const geminiService = {
  async generateStructure(topic: string, type: string, sources?: EbookSource[], style?: string, formatting?: string) {
    const prompt = `Crie uma estrutura detalhada para um(a) ${type} sobre o tema: "${topic}". 
    Estilo Literário Solicitado: ${style || 'Narrativo'}.
    Formatação Sugerida: ${formatting || 'Clássica'}.
    Analise todas as fontes de referência anexadas para extrair fatos e dados reais.
    Responda em Português. Forneça um título atraente e uma lista de capítulos. 
    Se o estilo for 'Acadêmico', use títulos técnicos. Se for 'Suspense', use títulos misteriosos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: prepareParts(prompt, sources) }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING }
                },
                required: ["title"]
              }
            }
          },
          required: ["title", "chapters"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async generateChapterContent(topic: string, chapterTitle: string, sources?: EbookSource[], style?: string, formatting?: string, author?: string) {
    const prompt = `Escreva o conteúdo para o capítulo "${chapterTitle}" de uma obra sobre "${topic}". 
    Autor da Obra: ${author || 'Anônimo'}.
    Estilo de Escrita: ${style || 'Narrativo'}.
    Formatação: ${formatting || 'Clássica'}.
    
    Diretrizes:
    1. Utilize os dados das fontes anexadas como base factual.
    2. Se o estilo for 'Acadêmico', utilize citações e tom formal.
    3. Se for 'Suspense', crie ganchos (cliffhangers).
    4. Siga as regras de formatação ${formatting}.
    
    Responda em Português do Brasil com formatação Markdown elegante.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: prepareParts(prompt, sources) }],
    });
    return response.text;
  },

  async generateReferences(topic: string, sources?: EbookSource[]) {
    const prompt = `Aja como um pesquisador sênior.
    Com base nas fontes enviadas para a obra sobre "${topic}", gere uma seção de "Referências e Fontes Consultadas".
    Formate em Markdown seguindo padrões profissionais de bibliografia.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: prepareParts(prompt, sources) }],
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text;
  },

  async reviseContent(text: string, instructions: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Aja como um editor sênior. Instruções: ${instructions}. Texto: ${text}`,
      config: { thinkingConfig: { thinkingBudget: 2000 } }
    });
    return response.text;
  },

  async generateCover(topic: string, title: string, style?: string) {
    const prompt = `High-end professional ${style || ''} style book cover illustration for "${title}" about "${topic}". 
    Do NOT include any text or typography on the image. 
    Cinematic lighting, artistic masterpiece, 4k resolution.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  },

  async generateChapterImage(chapterTitle: string, topic: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Artistic illustration for "${chapterTitle}" in a book about "${topic}". No text.` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  }
};
