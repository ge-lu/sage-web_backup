# Aura AI Assistant - Product Requirement Document (PRD)

## 1. Product Overview
**Product Name:** Aura AI Assistant
**Version:** 1.0 (Development)
**Vision:** To provide an intelligent, compassionate, and protective digital companion for seniors ("Martha"), enabling them to live independently while staying safe, healthy, and connected to their families.
**Core Value:** Combines AI-driven security (anti-scam), health monitoring, and daily logistics management into a simple, voice-first interface designed specifically for elderly users.

## 2. User Personas
*   **Primary User (The Senior):** "Martha". Needs large text, high contrast, voice interactions, and simple navigation. Values independence but needs help with modern digital complexities (scams, bills, rides).
*   **Secondary User (The Helper/Family):** Monitors status, receives alerts, manages configuration remotely (implied via Family Connections).

## 3. Information Architecture
The application is structured around a "Bottom Navigation" layout with high-priority "Modes" that overlay the screen.

### 3.1 Main Navigation (Bottom Tabs)
1.  **Dashboard (Home):** The central hub for voice interaction and immediate status.
2.  **Mate (Shields/Security):** Health safeguards, digital security, and system diagnostics.
3.  **Family (Connections):** Social feed, family updates, and communication.
4.  **Plan (History):** Timeline of events, tasks, bills, and logistics.
5.  **Profile:** User settings and account management.

### 3.2 Global/Overlay Modes
*   **Omnibus Scan:** Camera interface for scanning documents/meds.
*   **Guardian Alert:** Emergency SOS interface.
*   **Chat Overlay:** AI conversation interface (Text/Voice).
*   **Ride Request:** Transport booking interface.

## 4. Functional Requirements

### 4.1 Authentication & Onboarding
*   **Login/Signup:** Secure entry points.
*   **Guest Mode:** Limited usage ("Free guest limit") with tracking for voice/scan operations to encourage signup.
*   **Onboarding Flow:** Introduction guide for new users.

### 4.2 Dashboard & Voice Assistant
*   **Voice-First Interaction:** Primary interaction method via microphone tap.
*   **Pending Tasks:** Display of immediate "To-Do" items (e.g., "Take Meds").
*   **Aura Avatar:** Emotional AI representation (Neutral, Thinking, Happy, etc.) to humanize the assistant.
*   **Quick Actions:** Shortcuts to Plan, Scan, Mate, and Settings.

### 4.3 Mate (Shields & Health)
*   **System Status:** A "Credit Score" style percentage (0-100%) indicating overall safety/health status.
*   **Guardian AI (Security):**
    *   Monitor and block spam calls/SMS.
    *   Identify "Known Spammers".
*   **Vitals Monitor (Health):**
    *   **Medication Tracker:** Interactive "Mark as Taken" for scheduled meds (e.g., Lisinopril).
    *   **Health Metrics:** Display steps and heart rate.
    *   **Daily Check:** Boolean status for "Medication Taken".
*   **Digital Identity:** Password strength and breach monitoring.
*   **System Scan:** Manual trigger to "run diagnostics" with visual progress animation.

### 4.4 Plan & Logistics
*   **Timeline/History:** A unified activity feed showing events (Order, Scan, Scam Blocked, Health).
*   **Task Management:**
    *   **Smart Meds:** Medication reminders with visual cues (pill images).
    *   **Bill Management:** AI analysis of bills ("Safe" vs "Risk/Scam").
    *   **Routine:** Hydration and daily habits.
*   **Commerce & Shopping:**
    *   **Price Comparison:** Compare prices across vendors (Walmart, Amazon, Instacart).
    *   **Shopping Suggestions:** Context-aware product recommendations.
*   **Ride Sharing:** Integrated Uber/Lyft booking flow with status tracking (Driver info, ETA, Map).

### 4.5 Utility Features
*   **Omnibus Scanner:**
    *   **Document Mode:** Scan bills or letters for AI analysis.
    *   **Medication Mode:** Scan pill bottles to identify meds.
*   **Guardian Alert (SOS):**
    *   Full-screen red alert state.
    *   Triggers emergency protocols (details TBD).
*   **Chat System:**
    *   Multi-modal input (Voice/Text).
    *   Context-aware AI agents (Router, Medicare, Safety, Life, Soul).
    *   History saving and sharing capabilities.

## 5. Non-Functional Requirements
*   **Accessibility:** High visual contrast, large touch targets, clear typography (Inter/Roboto).
*   **Haptic Feedback:** Vibration confirmation for interactions (Vibrate on touch).
*   **Responsiveness:** Fluid animations (Fade-in, Slide-in) to guide user focus without disorientation.
*   **Performance:** Fast load times for overlays (Scan/Chat).

## 6. Technical Stack (Current)
*   **Framework:** React (Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide-React
*   **AI Integration:** Google GenAI (Gemini) - implied by dependencies.
