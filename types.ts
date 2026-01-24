
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

  // Overlays / Full Screen Modes
  OMNIBUS = 'OMNIBUS',     // Camera Scanning
  GUARDIAN_ALERT = 'GUARDIAN_ALERT', // Red Screen
  CHAT = 'CHAT',           // Soul Companion / Master Router Interface
  RIDE_REQUEST = 'RIDE_REQUEST', // Uber Interface
  SHOPPING_RESULT = 'SHOPPING_RESULT', // Logistics Manager Result
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
  category: 'utility' | 'subscription' | 'medical' | 'other';
  history: PaymentRecord[];
  aiAnalysis?: string; // AI's preliminary judgment
  assistanceStatus?: 'none' | 'requested' | 'resolved'; // Help status
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
