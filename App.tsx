
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import ChatOverlay from './components/ChatOverlay';
import UberRideModal from './components/UberRideModal';

// Views
import Dashboard from './views/Dashboard';
import OmnibusScan from './views/OmnibusScan';
import GuardianAlert from './views/GuardianAlert';
import FamilyConnectionsView from './views/FamilyConnectionsView';
import PlanView from './views/PlanView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import ProcurerShop from './views/ProcurerShop';
import LoginView from './views/LoginView';
import SignUpView from './views/SignUpView';
import ForgotPasswordView from './views/ForgotPasswordView';

import { AppMode, HistoryItem, TaskCard } from './types';

const App: React.FC = () => {
  // --- 1. GLOBAL APP STATE (The Source of Truth) ---
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // --- 2. USER & AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginReason, setLoginReason] = useState<string | undefined>(undefined);

  // --- 3. DATA STATE (Shared across views) ---
  const [initialChatQuery, setInitialChatQuery] = useState("");
  const [initialChatAction, setInitialChatAction] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: '1', title: 'Blocked suspicious call', subtitle: 'Potential spam risk', time: '10:15 AM', type: 'scam', status: 'blocked' },
    { id: '2', title: 'Ordered Milk', subtitle: 'Whole milk, 1 gallon from Kroger', time: '9:00 AM', type: 'order', status: 'completed' },
    { id: '3', title: 'Read prescription', subtitle: 'Identified "Lisinopril" 10mg', time: '8:30 AM', type: 'scan', status: 'completed' },
    { id: '6', title: 'Utility Bill (Electric)', subtitle: 'Due on Oct 28th', time: 'Yesterday', type: 'scan' },
  ]);

  // Shared Task State (Lifted from PlanView)
  const [tasks, setTasks] = useState<TaskCard[]>([
    {
      id: '1',
      type: 'SMART_MEDS',
      title: 'Morning Meds',
      subtitle: 'Check the bottle',
      detail: '1 Red Pill, 1 White Pill',
      time: '8:00 AM',
      completed: false,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '2',
      type: 'BILL_SAFE',
      title: 'Electric Bill',
      subtitle: 'Verified Safe',
      detail: '$45.20 due Oct 28',
      completed: false,
      verifiedBy: 'John'
    },
    {
      id: '3',
      type: 'BILL_RISK',
      title: 'Urgent IRS Notice',
      subtitle: 'Scam Alert!',
      detail: 'Do not pay. Discard.',
      completed: false,
    },
    {
      id: '4',
      type: 'ROUTINE',
      title: 'Hydration',
      subtitle: 'Drink Water',
      detail: 'Glass 1 of 3',
      completed: false,
    }
  ]);

  const handleTaskUpdate = (updatedTasks: TaskCard[]) => {
    setTasks(updatedTasks);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const hasVisited = localStorage.getItem('aura_has_visited');
    const authStatus = localStorage.getItem('aura_is_authenticated');

    if (!hasVisited) {
      setShowOnboarding(true);
    } else if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    setIsAppLoading(false);
  }, []);

  // --- HISTORY HANDLERS ---
  const handleAddHistoryItem = (item: HistoryItem) => setHistoryItems(prev => [item, ...prev]);
  const handleDeleteHistoryItem = (id: string) => setHistoryItems(prev => prev.filter(item => item.id !== id));
  const handleToggleHistoryImportance = (id: string) => {
    setHistoryItems(prev => prev.map(item => item.id === id ? { ...item, isImportant: !item.isImportant } : item));
  };
  const handleShareHistoryItem = (item: HistoryItem) => {
    if (navigator.share) navigator.share({ title: item.title, text: item.subtitle }).catch(console.error);
    else alert(`Sharing: ${item.title}`);
  };

  // --- NAVIGATION CONTROLLER (The "Flow" Guard) ---
  const handleNavigation = (mode: AppMode) => {
    // 1. Haptic Feedback for feel
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);

    // 2. Auth Protection Guard
    const protectedRoutes = [AppMode.PROFILE, AppMode.SETTINGS];
    if (!isAuthenticated && protectedRoutes.includes(mode)) {
      setLoginReason("Log in to view personal settings.");
      setCurrentMode(AppMode.LOGIN);
      return;
    }

    // 3. Navigate
    setCurrentMode(mode);
  };

  // --- USAGE TRACKING (Guest Limits) ---
  const trackUsage = (type: 'voice' | 'scan') => {
    if (isAuthenticated) return;

    let vCount = parseInt(localStorage.getItem('aura_voice_count') || '0');
    let sCount = parseInt(localStorage.getItem('aura_scan_count') || '0');

    if (type === 'voice') vCount++;
    if (type === 'scan') sCount++;

    localStorage.setItem('aura_voice_count', vCount.toString());
    localStorage.setItem('aura_scan_count', sCount.toString());

    // Limit Logic
    if (vCount >= 5 || sCount >= 3) {
      setLoginReason("Free guest limit reached. Log in to continue.");
      setCurrentMode(AppMode.LOGIN);
    }
  };

  // --- GLOBAL ACTIONS (Triggers from deep within components) ---
  const handleActionTrigger = (action: string) => {
    console.log("Global Action Triggered:", action);
    switch (action) {
      case 'SHOW_UBER': setCurrentMode(AppMode.RIDE_REQUEST); break;
      case 'SHOW_BILL_ANALYSIS': setCurrentMode(AppMode.OMNIBUS); break;
      case 'TRIGGER_SAFETY': setCurrentMode(AppMode.GUARDIAN_ALERT); break;
      case 'NAVIGATE_DASHBOARD': handleNavigation(AppMode.DASHBOARD); break;
      case 'NAVIGATE_MATE': handleNavigation(AppMode.FAMILY_CONNECTIONS); break;
      case 'NAVIGATE_PLAN': handleNavigation(AppMode.PLAN); break;
      case 'NAVIGATE_PROFILE': handleNavigation(AppMode.PROFILE); break;
      default: console.warn("Unknown action:", action);
    }
  };

  const startChat = (query: string = "", action: string | null = null) => {
    setInitialChatQuery(query);
    setInitialChatAction(action);
    setCurrentMode(AppMode.CHAT);
  };

  // --- VIEW RENDERER (The "Switchboard") ---
  const renderCurrentView = () => {
    switch (currentMode) {
      // 1. Auth Views
      case AppMode.LOGIN:
        return <LoginView onLoginSuccess={() => { setIsAuthenticated(true); setLoginReason(undefined); handleNavigation(AppMode.DASHBOARD); }} onNavigate={setCurrentMode} loginMessage={loginReason} onClose={() => handleNavigation(AppMode.DASHBOARD)} />;
      case AppMode.SIGNUP:
        return <SignUpView onLoginSuccess={() => { setIsAuthenticated(true); handleNavigation(AppMode.DASHBOARD); }} onNavigate={setCurrentMode} />;
      case AppMode.FORGOT_PASSWORD:
        return <ForgotPasswordView onNavigate={setCurrentMode} />;

      // 2. Full Screen Overlays (No Bottom Nav)
      case AppMode.OMNIBUS:
        return <OmnibusScan onBack={() => handleNavigation(AppMode.DASHBOARD)} onNavigateToShopping={() => setCurrentMode(AppMode.SHOPPING_RESULT)} onScanUsed={() => trackUsage('scan')} />;
      case AppMode.GUARDIAN_ALERT:
        return <GuardianAlert onDismiss={() => handleNavigation(AppMode.FAMILY_CONNECTIONS)} />;
      case AppMode.CHAT:
        return <ChatOverlay onClose={() => handleNavigation(AppMode.DASHBOARD)} onTriggerAction={handleActionTrigger} initialQuery={initialChatQuery} initialAction={initialChatAction} onVoiceInteraction={() => trackUsage('voice')} onSaveHistory={handleAddHistoryItem} />;
      case AppMode.RIDE_REQUEST:
        return <UberRideModal onClose={() => handleNavigation(AppMode.DASHBOARD)} />;
      case AppMode.SHOPPING_RESULT:
        return <ProcurerShop onBack={() => handleNavigation(AppMode.PLAN)} />;

      // 3. Main Tab Views (Has Bottom Nav)
      case AppMode.FAMILY_CONNECTIONS:
        return <FamilyConnectionsView />;
      case AppMode.PLAN:
        return <PlanView
          onOpenGuide={() => setShowOnboarding(true)}
          items={historyItems}
          tasks={tasks}
          onUpdateTasks={handleTaskUpdate}
          onToggleImportant={handleToggleHistoryImportance}
          onDelete={handleDeleteHistoryItem}
          onShare={handleShareHistoryItem}
        />;
      case AppMode.PROFILE:
        return <ProfileView onBack={() => handleNavigation(AppMode.DASHBOARD)} onOpenGuide={() => setShowOnboarding(true)} />;
      case AppMode.SETTINGS:
        return <SettingsView onBack={() => handleNavigation(AppMode.DASHBOARD)} />;

      // 4. Default / Home
      case AppMode.DASHBOARD:
      default:
        // Filter for pending tasks to show on Dashboard
        const pendingTasks = tasks.filter(t => !t.completed);

        return (
          <Dashboard
            isListening={false}
            setIsListening={() => startChat()}
            pendingTasks={pendingTasks} // Pass tasks to Dashboard
            onSearch={(q) => startChat(q)}
            onFileSelected={() => startChat("", "ANALYZE_FILE")}
            onNavigateToPlan={() => handleNavigation(AppMode.PLAN)}
            onNavigateToScan={() => setCurrentMode(AppMode.OMNIBUS)}
            onNavigateToMate={() => handleNavigation(AppMode.FAMILY_CONNECTIONS)}
            onNavigateToProfile={() => handleNavigation(AppMode.PROFILE)}
            onNavigateToSettings={() => handleNavigation(AppMode.SETTINGS)}
            onTriggerSOS={() => setCurrentMode(AppMode.GUARDIAN_ALERT)}
            onVoiceUsed={() => trackUsage('voice')}
          />
        );
    }
  };

  if (isAppLoading) return <div className="w-full h-full bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#00E341] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#F5F7F9] text-[#111827]">
      {showOnboarding && <Onboarding onComplete={() => { localStorage.setItem('aura_has_visited', 'true'); setShowOnboarding(false); }} />}

      <div className="relative w-full h-full z-10 flex flex-col">
        {renderCurrentView()}
      </div>

      {/* Conditionally Render Bottom Nav based on current mode */}
      {![
        AppMode.LOGIN, AppMode.SIGNUP, AppMode.FORGOT_PASSWORD,
        AppMode.OMNIBUS, AppMode.GUARDIAN_ALERT, AppMode.CHAT,
        AppMode.RIDE_REQUEST, AppMode.SHOPPING_RESULT
      ].includes(currentMode) && (
          <BottomNav
            currentMode={currentMode}
            setMode={handleNavigation}
            onMicTap={() => startChat()}
            isListening={false}
          />
        )}
    </div>
  );
};

export default App;
