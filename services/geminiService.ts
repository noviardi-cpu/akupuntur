
import { GoogleGenAI, Type } from "@google/genai";
import { Language, ScoredSyndrome } from '../types';

const getSystemInstruction = (language: Language, cdssAnalysis?: ScoredSyndrome[]) => {
  return `Anda adalah Pakar Senior TCM (Giovanni Maciocia). 
Tugas: Memberikan diagnosis instan dalam JSON.
WAJIB: Berikan 10-12 titik akupunktur.
PENTING: Pisahkan analisis menjadi BEN (Akar) dan BIAO (Cabang).

Bahasa: ${language}.
Format JSON:
{
  "conversationalResponse": "1 kalimat penjelasan singkat.",
  "diagnosis": {
    "patternId": "Nama Sindrom (Pinyin - English)",
    "explanation": "Ringkasan kasus.",
    "differentiation": {
      "ben": [{"label": "Akar Masalah", "value": "Misal: Defisiensi Yin Ginjal Kronis"}],
      "biao": [{"label": "Manifestasi Akut", "value": "Misal: Naiknya Yang Hati (Pusing/Nyeri)"}]
    },
    "recommendedPoints": [{"code": "Kode", "description": "Fungsi"}],
    "wuxingElement": "Wood/Fire/Earth/Metal/Water",
    "lifestyleAdvice": "Saran praktis",
    "herbal_recommendation": {"formula_name": "Nama Formula", "chief": ["Herbal1", "Herbal2"]}
  }
}`;
};

/**
 * Ekstraksi teks umum dari gambar menggunakan Gemini Vision
 */
export const performVisionOCR = async (base64Image: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const [mimeTypePrefix, base64Data] = base64Image.split(';base64,');
    const mimeType = mimeTypePrefix ? mimeTypePrefix.split(':')[1] : "image/jpeg";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Baca dan ekstrak semua teks medis, keluhan, dan hasil observasi dari gambar ini (bisa berupa catatan dokter atau hasil lab). Kembalikan dalam bentuk narasi paragraf Bahasa Indonesia yang rapi agar bisa dianalisis oleh sistem TCM. Jangan gunakan format JSON, cukup teks mentah yang bersih." },
          { inlineData: { mimeType, data: base64Data } }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Vision OCR Error:", error);
    throw error;
  }
};

export const performSmartOCR = async (base64Image: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const [mimeTypePrefix, base64Data] = base64Image.split(';base64,');
    const mimeType = mimeTypePrefix ? mimeTypePrefix.split(':')[1] : "image/jpeg";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Ekstrak informasi medis dari gambar ini (bisa berupa catatan tangan, hasil lab, atau foto klinis). Kembalikan data dalam format JSON murni: { patientName: string, age: string, sex: 'male'|'female', complaint: string, symptoms: string, tongueObservation: string, pulseObservation: string }. Jika tidak ada data, isi string kosong. Gunakan Bahasa Indonesia." },
          { inlineData: { mimeType, data: base64Data } }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
};

export const sendMessageToGeminiStream = async (
  message: string,
  image: string | undefined,
  history: any[],
  language: Language,
  isPregnant: boolean,
  cdssAnalysis?: ScoredSyndrome[],
  onChunk?: (text: string) => void
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: getSystemInstruction(language, cdssAnalysis),
        responseMimeType: "application/json",
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const cleanText = response.text.trim();
    if (onChunk) onChunk(cleanText);
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Critical Error:", error);
    throw error;
  }
};
