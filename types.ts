
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
  category: 'utility' | 'subscription' | 'medical' | 'tax' | 'phone' | 'other';
  history: PaymentRecord[];
  aiAnalysis?: string; // AI's preliminary judgment
  assistanceStatus?: 'none' | 'requested' | 'resolved'; // Help status
  /** Tax bill: tax year, e.g. "2024" */
  taxYear?: string;
  /** Tax bill: form type, e.g. "1040", "Estimated" */
  formType?: string;
  /** Utility/electric bill fields (API: Period→period, Total_Usage→totalUsageKwh, Amount→amount, User_ID→accountNo) */
  /** Billing period, e.g. "2024-01" */
  period?: string;
  /** Total usage (KWh) */
  totalUsageKwh?: number;
  /** Account number (User_ID on bill) */
  accountNo?: string;
  /** Utility usage: normal or abnormal (auto-set when current vs history exceeds threshold) */
  usageStatus?: 'normal' | 'abnormal';
  /** Human-readable reason when usageStatus is abnormal (e.g. "4x higher than usual; heater or AC may have been left on") */
  abnormalReason?: string;
  /** Phone/telecom bill: plan name, e.g. "Unlimited" */
  planName?: string;
  /** Phone/telecom bill: minutes used this period */
  minutesUsed?: number;
  /** Phone/telecom bill: data used (GB) this period */
  dataUsedGb?: number;
}

/** Alert pushed to Care Circle (e.g. energy anomaly) */
export interface CareCircleAlert {
  id: string;
  type: 'energy_anomaly';
  billId: string;
  billTitle: string;
  message: string;
  createdAt: string;
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
  phone: string;
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
  name: string;
  dosage: string; // e.g. "10mg", "1 tablet"
  frequency: string; // e.g. "three times daily", "every 8 hours"
  times: string[]; // e.g. ["08:00", "14:00", "20:00"]
  instructions?: string; // e.g. "with food", "with water"
  startDate: string;
  endDate?: string;
  expiryDate?: string; // YYYY-MM-DD
  imageUrl?: string;
  source?: 'prescription' | 'discharge_summary' | 'manual';
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
}

export interface MedicationReminder {
  medicationId: string;
  time: string; // e.g. "08:00"
  isActive: boolean;
  lastTaken?: string;
  nextReminder?: string;
}

/** 发给看护人确认的药品条目 */
export interface MedicationConfirmItem {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions?: string;
  duration?: string;
  effectIntro?: string;
  takeWithMeal?: 'before' | 'after' | 'with' | 'empty';
}

/** 看护人收到的药品确认请求 */
export interface MedicationConfirmRequest {
  requestId?: string;
  contactId: string;
  contactName: string;
  senderName?: string;
  summary: string;
  imageDataUrl?: string | null;
  medications: MedicationConfirmItem[];
  sentAt?: string;
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
