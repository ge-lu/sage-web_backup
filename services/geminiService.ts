
import { GoogleGenAI, Type } from "@google/genai";
import { AuraEmotion } from "../types";

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

// --- TYPE DEFINITIONS ---

export type AnalysisType = 'DOCUMENT' | 'PRODUCT' | 'SCAM' | 'GENERAL' | 'APPLIANCE' | 'FOOD' | 'TOOL' | 'QR_CODE' | 'UNKNOWN';
export type RiskLevel = 'SAFE' | 'CAUTION' | 'DANGER';

export interface ScanResult {
    type: AnalysisType;
    title: string;
    summary: string;
    // For Shopping
    products?: {
        vendor: string;
        price: string;
        delivery: string;
        recommended: boolean;
    }[];
    // For Safety (Scam Analyzer)
    riskLevel?: RiskLevel;
    riskScore?: number; // 0-100
    category?: string;
    details?: string[];
    actionAdvice?: string;
    // For Appliance Guide
    overlayIndicators?: {
        x: number; // % from left
        y: number; // % from top
        label: string;
        direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    }[];
    // For Food
    nutrition?: {
        calories: number;
        sugar: string;
        protein: string;
        warning?: string;
    };
    // For QR
    qrData?: string;
}

export interface ChatResponse {
    reply: string;
    emotion: AuraEmotion;
    action?: string;
}

// --- CORE AGENT FUNCTIONS ---

export const chatWithAura = async (message: string, history: {role: string, text: string}[]): Promise<ChatResponse> => {
    try {
        const ai = getClient();
        
        // Optimized prompt for speed
        const systemInstruction = `
            You are Aura, an AI for seniors.
            Goals: Clear, concise, warm responses.
            Emotions: HAPPY, SAD, ANGRY, FEAR, SURPRISE, DISGUST, THINKING, NEUTRAL.
            
            Output strictly JSON:
            { "reply": "string", "emotion": "enum", "action": "optional_string" }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Switched to Flash for speed
            contents: [
                ...history.map(h => ({
                    role: h.role === 'agent' ? 'model' : 'user',
                    parts: [{ text: h.text }]
                })),
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reply: { type: Type.STRING },
                        emotion: { type: Type.STRING },
                        action: { type: Type.STRING }
                    },
                    required: ['reply', 'emotion']
                }
            }
        });

        const data = JSON.parse(response.text || '{}');
        return {
            reply: data.reply || "I'm here for you.",
            emotion: (data.emotion as AuraEmotion) || 'NEUTRAL',
            action: data.action
        };

    } catch (error) {
        console.error("Chat Error:", error);
        return {
            reply: "I'm having a little trouble connecting right now, but I'm still here with you.",
            emotion: 'SAD'
        };
    }
};

export const analyzeVisualContext = async (base64Image: string): Promise<ScanResult> => {
    try {
        const ai = getClient();
        
        // 1. Classification
        const classificationPrompt = `
            Classify image for seniors: DOCUMENT, PRODUCT, SCAM, APPLIANCE, FOOD, TOOL, QR_CODE, GENERAL.
            Return ONLY category name.
        `;

        const classifier = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: classificationPrompt }
                ]
            }
        });

        const category = (classifier.text?.trim().toUpperCase() || 'UNKNOWN') as AnalysisType;
        console.log("Detected Category:", category);

        // 2. Route to Agent
        if (category.includes('DOCUMENT')) return await runBureaucracyFighter(base64Image);
        if (category.includes('PRODUCT')) return await runLogisticsManager(base64Image);
        if (category.includes('SCAM')) return await runInvisibleGuardian(base64Image);
        if (category.includes('APPLIANCE')) return await runApplianceGuide(base64Image);
        if (category.includes('QR_CODE')) return await runQRCodeReader(base64Image);
        
        return await runGeneralInterpreter(base64Image);

    } catch (error) {
        console.error("Vision Error:", error);
        return { type: 'UNKNOWN', title: 'Connection Error', summary: "I couldn't reach the vision server. Please check your connection." };
    }
};

// 🔮 General Interpreter
const runGeneralInterpreter = async (image: string): Promise<ScanResult> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: image } },
                { text: `Identify object. Warmly describe in 1 sentence for a senior. Format: JSON {title, summary}.` }
            ]
        },
        config: { responseMimeType: 'application/json' }
    });
    
    const data = JSON.parse(response.text || '{}');
    return {
        type: 'GENERAL',
        title: data.title || "I see something",
        summary: data.summary || "I see the image. What would you like to do?"
    };
};

// ⚔️ Bureaucracy Fighter
const runBureaucracyFighter = async (image: string): Promise<ScanResult> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: image } },
                { text: `Identify document. Explain simply for senior. Format: JSON {title, summary}.` }
            ]
        },
        config: { responseMimeType: 'application/json' }
    });
    
    const data = JSON.parse(response.text || '{}');
    return {
        type: 'DOCUMENT',
        title: data.title || "Document",
        summary: data.summary || "I read the document."
    };
};

// 🚚 Logistics Manager (Visual Shop)
const runLogisticsManager = async (image: string): Promise<ScanResult> => {
    // Mock data for speed in demo, normally triggers API
    return {
        type: 'PRODUCT',
        title: "Tide Original Liquid",
        summary: "I found this item. Left is faster, Right is cheaper.",
        products: [
            { "vendor": "Walmart", "price": "$4.97", "delivery": "Today by 6 PM", "recommended": true },
            { "vendor": "Amazon", "price": "$3.85", "delivery": "Tomorrow", "recommended": false }
        ]
    };
};

// 🛠️ Appliance Guide (AR Help)
const runApplianceGuide = async (image: string): Promise<ScanResult> => {
    return {
        type: 'APPLIANCE',
        title: "Coffee Maker",
        summary: "I see your coffee maker. Here is how to brew a cup.",
        overlayIndicators: [
            { x: 20, y: 30, label: "Power Button", direction: 'DOWN' },
            { x: 50, y: 60, label: "Filter Basket", direction: 'UP' },
            { x: 80, y: 40, label: "Water Tank", direction: 'LEFT' }
        ]
    };
};

// 📱 QR Code Reader (Mock)
const runQRCodeReader = async (image: string): Promise<ScanResult> => {
    return {
        type: 'QR_CODE',
        title: "Restaurant Menu",
        summary: "I've scanned the QR code. It opens a menu. Opening now...",
        qrData: "https://www.google.com"
    };
};

// 🛡️ Invisible Guardian (Scam Shield)
const runInvisibleGuardian = async (image: string): Promise<ScanResult> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: image } },
                { text: `Analyze for scam. JSON {title, summary, riskLevel (SAFE/CAUTION/DANGER), riskScore, category, details[], actionAdvice}.` }
            ]
        },
        config: { responseMimeType: 'application/json' }
    });

    const data = JSON.parse(response.text || '{}');
    return {
        type: 'SCAM',
        title: data.title,
        summary: data.summary,
        riskLevel: data.riskLevel,
        riskScore: data.riskScore,
        category: data.category,
        details: data.details,
        actionAdvice: data.actionAdvice
    };
};
