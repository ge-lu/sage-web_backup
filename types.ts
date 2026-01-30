
import React from 'react';

export enum AppMode {
  // Auth Flows
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',

  // Main App
  DASHBOARD = 'DASHBOARD', // Home
  MATE = 'MATE',           // Security & Health Status (Formerly SHIELDS)
  FAMILY_CONNECTIONS = 'FAMILY_CONNECTIONS', // New Family Page
  PLAN = 'PLAN',           // History & Logistics
  PROFILE = 'PROFILE',     // Settings & Account
  SETTINGS = 'SETTINGS',   // New Settings View
  ALL_ACTIVITY = 'ALL_ACTIVITY', // Full History View

  // Overlays / Full Screen Modes
  OMNIBUS = 'OMNIBUS',     // Camera Scanning
  GUARDIAN_ALERT = 'GUARDIAN_ALERT', // Red Screen
  CHAT = 'CHAT',           // Soul Companion / Master Router Interface
  RIDE_REQUEST = 'RIDE_REQUEST', // Uber Interface
  SHOPPING_RESULT = 'SHOPPING_RESULT', // Logistics Manager Result
  RIDE_DETAIL = 'RIDE_DETAIL', // Smart Ride Detail Page
}

export enum ScanMode {
  DOCUMENT = 'DOCUMENT',
  MEDICATION = 'MEDICATION',
}

// Added Expressions
export type AuraEmotion =
  | 'NEUTRAL' | 'LISTENING' | 'THINKING' // Utility
  | 'HAPPY' | 'SAD' | 'ANGRY' | 'FEAR' | 'SURPRISE' | 'DISGUST' // 6 Basic
  | 'SURPRISED_JOY' | 'ANGRY_SAD' | 'HATE' | 'PAIN' | 'SATISFACTION' // Compounds 1-5
  | 'CONTEMPLATION' | 'CONTEMPT' | 'REGRET' | 'CONFUSION' | 'EXPECTATION' // Compounds 6-10
  | 'ANNOYANCE' | 'CONTENT' | 'MELANCHOLY' | 'UNEASE' | 'MILD_SURPRISE'; // Low Intensity

export interface HistoryItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'scam' | 'order' | 'scan' | 'health' | 'ride' | 'chat';
  amount?: string;
  status?: 'blocked' | 'completed' | 'pending';
  isImportant?: boolean;
  chatMessages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  agentType?: 'ROUTER' | 'MEDICARE' | 'SAFETY' | 'LIFE' | 'SOUL';
  text: string;
  timestamp: Date;
  action?: 'SHOW_UBER' | 'SHOW_BILL_ANALYSIS' | 'TRIGGER_SAFETY' | 'NAVIGATE_DASHBOARD' | 'NAVIGATE_MATE' | 'NAVIGATE_PLAN' | 'NAVIGATE_PROFILE';
}

export interface ShoppingOption {
  id: string;
  vendor: 'Walmart' | 'Amazon' | 'Instacart';
  logo: React.FC<any>;
  price: string;
  deliveryTime: string;
  distance?: string;
  tag?: string; // e.g., "Best Price"
  tagColor?: string;
  theme: {
    bg: string;
    border: string;
    text: string;
    button: string;
  };
  isAffiliate: boolean;
}

export interface TaskCard {
  id: string;
  type: 'SMART_MEDS' | 'BILL_SAFE' | 'BILL_RISK' | 'ROUTINE';
  title: string;
  subtitle: string;
  detail?: string;
  time?: string;
  completed: boolean;
  image?: string; // For meds or bill context
  verifiedBy?: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  time: string;
  imageUrl: string;
  likes: number;
}

export interface Room {
  id: string;
  name: string;
  imageUrl: string;
  isAll?: boolean;
  isNew?: boolean;
  isGroupGrid?: boolean;
  groupImages?: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  avatarUrl: string;
}

// --- CareLink Types ---
export type ViewType = 'ai' | 'care' | 'circle' | 'me' | 'robot' | 'contact';

export interface Contact {
  id: string;
  name: string;
  avatarSeed: string;
  status: 'active' | 'inactive';
  isOnline: boolean;
  color: string;
  role?: 'caregiver' | 'family' | 'doctor';
}

export interface Task {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  icon: 'heart' | 'pill' | 'activity';
  status: 'pending' | 'completed';
  recurrence: 'daily' | 'weekly' | 'monthly' | 'none';
  reminderSettings: {
    snoozeEnabled: boolean;
    alertSound: 'chime' | 'bell' | 'silent';
  };
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'failed' | 'pending';
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid';
  category: 'utility' | 'subscription' | 'medical' | 'tax' | 'other';
  history: PaymentRecord[];
  aiAnalysis?: string; // AI's preliminary judgment
  assistanceStatus?: 'none' | 'requested' | 'resolved'; // Help status
  /** 税务账单：税年，如 "2024" */
  taxYear?: string;
  /** 税务账单：表单项，如 "1040", "Estimated" */
  formType?: string;
}

export interface SecurityEvent {
  id: string;
  type: 'sms_scam' | 'call_spam' | 'image_scam';
  source: string;
  content?: string;
  timestamp: string;
  status: 'blocked' | 'warning' | 'safe';
  riskScore?: number;
  aiAnalysis?: string; // AI's preliminary judgment
  assistanceStatus?: 'none' | 'requested';
}

export interface CommerceItem {
  id: string;
  type: 'purchase_suggestion' | 'payment_record';
  title: string;
  amount: number;
  merchant: string;
  status: 'pending_approval' | 'completed' | 'shipped';
  image?: string;
  date: string;
}

export interface RideSession {
  id: string;
  provider: 'Uber' | 'Lyft';
  driver: string;
  driverRating: number;
  car: string;
  plate: string;
  pickup: string;
  dropoff: string;
  status: 'arriving' | 'in_ride' | 'completed';
  eta: string;
  mapImage?: string;
}

// --- Auth Types ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  avatarSeed?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarSeed?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// --- Medication Types ---
export interface Medication {
  id: string;
  name: string; // 药物名称
  dosage: string; // 剂量，如 "10mg", "1片"
  frequency: string; // 频率，如 "每日3次", "每8小时一次"
  times: string[]; // 具体服药时间，如 ["08:00", "14:00", "20:00"]
  instructions?: string; // 服用说明，如 "饭后服用", "随水服用"
  startDate: string; // 开始日期
  endDate?: string; // 结束日期（可选）
  expiryDate?: string; // 有效期/过期日期 (YYYY-MM-DD format)
  imageUrl?: string; // 处方单图片 URL
  source?: 'prescription' | 'discharge_summary' | 'manual'; // 来源
  createdAt: string; // 创建时间
  status: 'active' | 'completed' | 'paused'; // 状态
}

export interface MedicationReminder {
  medicationId: string;
  time: string; // 提醒时间，如 "08:00"
  isActive: boolean; // 是否激活
  lastTaken?: string; // 上次服药时间
  nextReminder?: string; // 下次提醒时间
}

// --- Family Member Update Types ---
export type AlertLevel = 'CRITICAL' | 'FAIR' | 'NORMAL';

export interface FamilyMemberUpdate {
  id: string;
  name: string;
  relation: string;
  location: string;
  weatherTitle: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  message: string;
  imageUrl: string;
  alertLevel: AlertLevel;
  actionType: 'warmup' | 'voice' | 'none';
}
