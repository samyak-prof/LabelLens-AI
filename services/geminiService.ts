import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScanResult } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CACHE_PREFIX = "lbl_cache_v3_";

interface CacheEntry {
  timestamp: number;
  data: ScanResult;
}

const resultSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    purity_score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100. If fresh fruit, rate based on nutritional density and freshness.",
    },
    verdict_title: {
      type: Type.STRING,
      description: "Short punchy title.",
    },
    verdict_color: {
      type: Type.STRING,
      description: "Hex color code.",
    },
    summary: {
      type: Type.STRING,
      description: "Summary of health impact.",
    },
    additives_found: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of additives or 'None' for fresh food.",
    },
    nutrients_highlight: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of key nutrients WITH AMOUNTS (e.g. '12g Protein', '250 kcal', '15g Fat'). Do NOT use generic terms like 'High in fat'.",
    },
    warning_level: {
      type: Type.STRING,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      description: "Overall health warning level.",
    },
    consistency_warning: {
      type: Type.STRING,
      description: "If Front and Back images show DIFFERENT products, describe the mismatch here. Else null.",
      nullable: true
    },
    freshness_analysis: {
      type: Type.STRING,
      description: "For fresh produce: Estimated age (e.g. '3 days old') and 'Eat By' recommendation. Null for packaged food.",
      nullable: true
    },
    items_detected: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of all distinct items identified in the images.",
    }
  },
  required: ["purity_score", "verdict_title", "verdict_color", "summary", "additives_found", "nutrients_highlight", "warning_level"],
};

// Advanced hashing for caching (uses primary image)
const getMediaSignature = (base64: string): string => {
  if (base64.length < 5000) return `${CACHE_PREFIX}full_${base64}`;
  const len = base64.length;
  const s1 = base64.slice(0, 50);
  const s2 = base64.slice(Math.floor(len * 0.25), Math.floor(len * 0.25) + 50);
  const s3 = base64.slice(Math.floor(len * 0.5), Math.floor(len * 0.5) + 50);
  const s5 = base64.slice(-50);
  return `${CACHE_PREFIX}${len}_${s1}_${s2}_${s3}_${s5}`;
};

const pruneCache = (): void => {
  try {
    const entries: { key: string; timestamp: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const val = localStorage.getItem(key);
          if (val) entries.push({ key, timestamp: JSON.parse(val).timestamp || 0 });
        } catch (e) { entries.push({ key, timestamp: 0 }); }
      }
    }
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const removeCount = Math.max(1, Math.floor(entries.length * 0.2));
    entries.slice(0, removeCount).forEach(e => localStorage.removeItem(e.key));
  } catch (e) {
    try { localStorage.clear(); } catch(err) {}
  }
};

const saveToCache = (key: string, data: ScanResult): void => {
  const entry: CacheEntry = { timestamp: Date.now(), data };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    pruneCache();
    try { localStorage.setItem(key, JSON.stringify(entry)); } catch (err) {}
  }
};

export const getHistory = (): ScanResult[] => {
  const history: ScanResult[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            const res = parsed.timestamp && parsed.data ? parsed.data : parsed;
            if (res.verdict_title) history.push({ ...res, timestamp: parsed.timestamp || Date.now() });
          } catch (e) {}
        }
      }
    }
    return history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (e) { return []; }
};

/**
 * Main Analysis Function
 * Handles Image (Front/Back) and Video
 */
export const analyzeMedia = async (
  base64Data: string, 
  mimeType: string, 
  frontImageBase64?: string | null
): Promise<ScanResult> => {
  
  // Use the primary (Back/Label) image for the cache key
  const cacheKey = getMediaSignature(base64Data + (frontImageBase64 ? '_dual' : ''));
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const result = parsed.timestamp && parsed.data ? parsed.data : parsed;
      saveToCache(cacheKey, result); // refresh
      return { ...result, isCached: true };
    } catch (e) { localStorage.removeItem(cacheKey); }
  }

  // Use Gemini 2.5 Flash for robust multi-modal comparison and reasoning
  const modelName = 'gemini-2.5-flash';
  
  console.log(`Analyzing with ${modelName}. Dual Image Mode: ${!!frontImageBase64}`);

  const parts: any[] = [];
  
  // 1. Add Front Image (Optional Context)
  if (frontImageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: frontImageBase64 } });
    parts.push({ text: "IMAGE 1: FRONT OF PRODUCT / VISUAL CONTEXT" });
  }

  // 2. Add Back Image / Main Media (Required)
  parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
  parts.push({ text: frontImageBase64 ? "IMAGE 2: BACK OF PRODUCT / NUTRITION LABEL" : "MEDIA TO ANALYZE" });

  const prompt = `
    You are a Senior Clinical Nutrition Auditor. Perform a rigorous forensic analysis.

    CRITICAL CONSISTENCY CHECK (Primary Objective):
    - You are provided with TWO images if available:
      1. IMAGE 1 (Front/Product Look)
      2. IMAGE 2 (Back/Label)
    - You MUST compare them. 
    - SCENARIO: If Image 1 is Fresh Fruits (Apple, Banana) and Image 2 is a Packaged Snack (Chips, Chocolate, Drink), this is a MAJOR MISMATCH.
    - ACTION: In 'consistency_warning', write exactly: "MISMATCH: Front image shows [Object A], but Label shows [Object B]."
    - If they match, keep 'consistency_warning' null.

    TASK:
    1. Identify the food item(s).
    2. FRESHNESS ENGINE: If raw produce (fruit/veg) is visible, estimate its visual freshness (e.g. "Overripe", "Peak Freshness") and provide an 'Eat By' window in 'freshness_analysis'.
       - For mixed items (e.g., fruit bowl), list status for EACH item detected.
    3. NUTRITION (STRICT): 
       - Extract SPECIFIC NUMBERS. Do NOT use generic text like "High in calories".
       - If a label is visible, OCR the exact values (e.g. "150 kcal", "12g Fat", "20g Sugar").
       - If no label (loose food like Pizza, Fruit), ESTIMATE values per serving (e.g. "Approx 280 kcal", "12g Protein").
       - Populate 'nutrients_highlight' with these precise strings.
    4. SCORE: Calculate Purity Score (0-100).
       - Fresh Fruit/Veg = High Score (80-100).
       - Processed Food = Score based on ingredients.
    5. Non-Food Check: If no food is found, return 0 score and 'Unrecognized'.

    Return JSON matching the schema.
  `;

  parts.push({ text: prompt });

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: resultSchema,
    temperature: 0, // Strict determinism
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config,
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text) as ScanResult;

    if (result.verdict_title.toLowerCase() === 'unrecognized') {
      result.purity_score = 0;
    }

    result.mimeType = mimeType;
    saveToCache(cacheKey, result);
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
