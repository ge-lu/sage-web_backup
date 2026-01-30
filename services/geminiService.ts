
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

export type AnalysisType = 'DOCUMENT' | 'PRODUCT' | 'SCAM' | 'GENERAL' | 'APPLIANCE' | 'FOOD' | 'TOOL' | 'QR_CODE' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'UNKNOWN';
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
    // For Prescription/Discharge Summary
    medications?: {
        name: string;
        dosage: string;
        frequency: string;
        times: string[];
        instructions?: string;
        duration?: string;
    }[];
}

export interface TaskSuggestion {
    title: string;
    subtitle: string;
    time: string;
    recurrence: 'daily' | 'weekly' | 'monthly' | 'none';
    type: 'medication' | 'appointment' | 'general';
}

export interface ChatResponse {
    reply: string;
    emotion: AuraEmotion;
    action?: string;
    taskSuggestion?: TaskSuggestion;
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
            
            If the user asks to set a reminder or create a task, set 'action' to 'create_task' and populate 'taskSuggestion'.
            For 'time', try to convert to ISO 8601 format if possible, or keep as clear text.
            
            Output strictly JSON:
            { 
                "reply": "string", 
                "emotion": "enum", 
                "action": "optional_string",
                "taskSuggestion": {
                    "title": "summary title",
                    "subtitle": "details",
                    "time": "ISO8601 time",
                    "recurrence": "daily|weekly|monthly|none",
                    "type": "medication|appointment|general"
                }
            }
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
                        action: { type: Type.STRING },
                        taskSuggestion: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                subtitle: { type: Type.STRING },
                                time: { type: Type.STRING },
                                recurrence: { type: Type.STRING },
                                type: { type: Type.STRING }
                            },
                            nullable: true
                        }
                    },
                    required: ['reply', 'emotion']
                }
            }
        });

        const data = JSON.parse(response.text || '{}');
        return {
            reply: data.reply || "I'm here for you.",
            emotion: (data.emotion as AuraEmotion) || 'NEUTRAL',
            action: data.action,
            taskSuggestion: data.taskSuggestion
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
            Classify image for seniors: PRESCRIPTION, DISCHARGE_SUMMARY, DOCUMENT, PRODUCT, SCAM, APPLIANCE, FOOD, TOOL, QR_CODE, GENERAL.
            Return ONLY category name.
            - PRESCRIPTION: prescription forms, medication lists from pharmacy
            - DISCHARGE_SUMMARY: hospital discharge papers with medications
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
        if (category.includes('PRESCRIPTION') || category.includes('DISCHARGE')) {
            return await runPrescriptionReader(base64Image);
        }
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

// 💊 Prescription/Discharge Summary Reader
const runPrescriptionReader = async (image: string): Promise<ScanResult> => {
    const ai = getClient();
    
    const prompt = `
        Analyze this prescription or discharge summary image. Extract all medication information.
        
        For each medication, extract:
        - name: medication name (e.g., "Lisinopril", "Aspirin")
        - dosage: dose amount (e.g., "10mg", "1 tablet", "5ml")
        - frequency: how often (e.g., "每日3次", "twice daily", "每8小时一次")
        - times: specific times in 24-hour format array (e.g., ["08:00", "14:00", "20:00"])
        - instructions: special instructions (e.g., "饭后服用", "with food", "随水服用")
        - duration: how long to take (e.g., "7 days", "until finished")
        
        Return JSON format:
        {
            "title": "处方单" or "出院小结",
            "summary": "Brief description",
            "medications": [
                {
                    "name": "string",
                    "dosage": "string",
                    "frequency": "string",
                    "times": ["HH:MM", ...],
                    "instructions": "string (optional)",
                    "duration": "string (optional)"
                }
            ]
        }
        
        If times are not explicitly stated, infer from frequency:
        - "每日3次" or "three times daily" -> ["08:00", "14:00", "20:00"]
        - "每日2次" or "twice daily" -> ["08:00", "20:00"]
        - "每日1次" or "once daily" -> ["08:00"]
        - "每8小时一次" or "every 8 hours" -> ["08:00", "16:00", "00:00"]
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: image } },
                    { text: prompt }
                ]
            },
            config: { 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        medications: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    dosage: { type: Type.STRING },
                                    frequency: { type: Type.STRING },
                                    times: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    instructions: { type: Type.STRING, nullable: true },
                                    duration: { type: Type.STRING, nullable: true }
                                },
                                required: ['name', 'dosage', 'frequency', 'times']
                            }
                        }
                    },
                    required: ['title', 'summary', 'medications']
                }
            }
        });

        const data = JSON.parse(response.text || '{}');
        
        // Determine if it's prescription or discharge summary
        const isDischarge = data.title?.includes('出院') || data.title?.includes('discharge') || 
                           data.summary?.includes('出院') || data.summary?.includes('discharge');
        
        return {
            type: isDischarge ? 'DISCHARGE_SUMMARY' : 'PRESCRIPTION',
            title: data.title || '处方单',
            summary: data.summary || `已识别到 ${data.medications?.length || 0} 种药物`,
            medications: data.medications || []
        };
    } catch (error) {
        console.error("Prescription parsing error:", error);
        return {
            type: 'PRESCRIPTION',
            title: '处方单识别',
            summary: '无法解析处方单，请确保图片清晰且包含完整的用药信息。',
            medications: []
        };
    }
};

// --- Family Member Care Advice ---
export const getCareAdvice = async (memberName: string, weather: string, temp: number): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `My family member ${memberName} is currently in ${weather} conditions with a temperature of ${temp}°C. Give me a short, warm, and practical piece of advice (max 2 sentences) on how I can care for them remotely.`,
        });
        return response.text || "Sending warm thoughts your way.";
    } catch (error) {
        console.error("Gemini advice error:", error);
        return "Take care and stay safe!";
    }
};
