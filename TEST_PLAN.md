# Aura AI Assistant - Test Plan

## 1. Introduction
**Objective:** Verify that all core functionalities of the Aura AI Assistant (Version 1.0) function as designed, ensuring a stable and user-friendly experience for elderly users.
**Scope:** This plan covers the user interface, interaction flows, state management, and simulated backend logic (e.g., guest limits, specific task completions) within the React application.
**Testing Environment:** Local Development Environment (Chrome/Edge Browser via Vite).

## 2. Test Strategy
*   **Manual Walkthrough:** Execute each step in the browser simulator.
*   **State Verification:** Check if UI updates correctly after actions (e.g., buttons change color, counters increment).
*   **Persistence Check:** Verify if data persists where applicable (e.g., Guest limits in LocalStorage).

## 3. Test Cases by Feature

### 3.1 Authentication & Onboarding
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **AO-01** | **New User Onboarding** | 1. Clear LocalStorage (`aura_has_visited`).<br>2. Refresh the app.<br>3. Verify "Onboarding" screens appear. | Onboarding carousel is displayed. Finishing it saves state and lands on Dashboard. |
| **AO-02** | **Guest Mode Limits (Voice)** | 1. Ensure user is logged out.<br>2. Tap the Microphone icon 5 times (simulating usage). | After 5th tap, app redirects to **Login View** with message "Free guest limit reached". |
| **AO-03** | **Guest Mode Limits (Scan)** | 1. Ensure user is logged out.<br>2. Navigate to Omnibus Scan.<br>3. Tap "Scan" 3 times. | After 3rd use, app redirects to **Login View** with limit message. |
| **AO-04** | **Login Flow** | 1. On Login View, enter dummy credentials.<br>2. Click "Login". | App navigates to Dashboard. Bottom Nav appears. Protected routes (Profile) become accessible. |

### 3.2 Dashboard & Navigation
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **DN-01** | **Bottom Navigation** | 1. Tap "Mate", "Family", "Plan", "Profile" icons. | App switches to the correct view. Active icon is highlighted. |
| **DN-02** | **Protected Route Guard** | 1. Logout (if logged in).<br>2. Tap "Profile" or "Settings". | App redirects to **Login View** with message "Log in to view personal settings." |
| **DN-03** | **Pending Tasks Display** | 1. Observe Dashboard "Pending Tasks" section. | Shows tasks that are marked incomplete (e.g., "Morning Meds"). |

### 3.3 Mate (Shields/Security) View
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **MT-01** | **Score Display** | 1. Navigate to Mate tab.<br>2. Observe the large circular score. | Score should be visible (e.g., 75%). Ring should be partially filled. |
| **MT-02** | **Task Completion (Medication)** | 1. Tap the "Take 1 Lisinopril" task card.<br>2. Click "Mark Done". | 1. Card turns green.<br>2. Text changes to "Medication Taken".<br>3. Main Score updates to 100%. |
| **MT-03** | **Task Undo** | 1. On the completed medication card, click "Undo". | Card reverts to original state (Emergency color/Amber). Score drops back to original value. |
| **MT-04** | **System Scan Animation** | 1. Click "Run Full System Scan". | 1. View changes to "Scanning".<br>2. Progress counter goes 0-100%.<br>3. View automatically switches to "Details" upon completion. |
| **MT-05** | **Sub-View Navigation** | 1. Click on "Guardian AI", "Vitals Monitor", or "Digital Identity" rows. | View transitions to the specific detail page with correct icon and status list. |

### 3.4 Plan View (History & Logistics)
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **PL-01** | **History Feed** | 1. Navigate to Plan tab.<br>2. Scroll through the timeline. | list of events (Scams, Orders, Scans) is displayed with correct icons and timestamps. |
| **PL-02** | **Important Toggle** | 1. Click the "Star" icon on a history item. | Star icon fills/unfills. State persists within the session. |
| **PL-03** | **Delete Item** | 1. Swipe left or click "Delete" (Trash icon) on an item. | Item is removed from the list immediately. |

### 3.5 Utilities & Overlays
| ID | Test Case | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **UT-01** | **Omnibus Scanner** | 1. Tap "Scan" button (Dashboard or Nav).<br>2. Verify camera UI (mock). | Camera view opens. Overlay controls (Document/Medication toggle) are visible. |
| **UT-02** | **Guardian Alert (SOS)** | 1. Tap "SOS" / "Guardian Alert" trigger. | Screen turns Red. Emergency interface appears. Bottom Navigation disappears. |
| **UT-03** | **Chat Overlay** | 1. Tap Microphone (Dashboard). | Chat overlay slides up. "Listening" state or Avatar is active. History of conversation is visible. |
| **UT-04** | **Ride Request** | 1. Trigger "Show Uber" action (or via specific task). | Ride modal appears with Map, Driver Info, and ETA. |

## 4. Execution Log (Template)
| Date | Tester | Test Case ID | Status (Pass/Fail) | Notes/Bugs |
| :--- | :--- | :--- | :--- | :--- |
| | | AO-01 | | |
| | | AO-02 | | |
| | | ... | | |
