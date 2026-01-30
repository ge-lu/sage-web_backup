export type PlanType = 'yearly' | 'monthly';

export interface PlanConfig {
  id: PlanType;
  title: string;
  currency: string;
  amount: string;
  subDescription: string;
  marketingTag?: string; // e.g. "Save $40"
  footerText: string; // e.g. "$16.58/mo"
  isBestValue?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  stars: number;
}
