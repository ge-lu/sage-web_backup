
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Onboarding from './components/Onboarding';
import ChatOverlay from './components/ChatOverlay';
import UberRideModal from './components/UberRideModal';

// Pages (formerly Views)
import Dashboard from './pages/Dashboard';
import OmnibusScan from './pages/OmnibusScan';
import GuardianAlert from './pages/GuardianAlert';
import FamilyConnectionsView from './pages/FamilyConnectionsView';
import PlanView from './pages/PlanView';
import ProfileView from './pages/ProfileView';
import SettingsView from './pages/SettingsView';
import ProcurerShop from './pages/ProcurerShop';
import LoginView from './pages/LoginView';
import SignUpView from './pages/SignUpView';
import ForgotPasswordView from './pages/ForgotPasswordView';

import { AppMode, HistoryItem, TaskCard } from './types';
import { getPathForMode } from './routes';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. GLOBAL APP STATE (The Source of Truth) ---
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
    // Note: We also use RequireAuth for direct URL access, but this covers programmatic navigation
    const protectedRoutes = [AppMode.PROFILE, AppMode.SETTINGS];
    if (!isAuthenticated && protectedRoutes.includes(mode)) {
      setLoginReason("Log in to view personal settings.");
      navigate(getPathForMode(AppMode.LOGIN));
      return;
    }

    // 3. Navigate
    navigate(getPathForMode(mode));
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
      navigate(getPathForMode(AppMode.LOGIN));
    }
  };

  // --- GLOBAL ACTIONS (Triggers from deep within components) ---
  const handleActionTrigger = (action: string) => {
    console.log("Global Action Triggered:", action);
    switch (action) {
      case 'SHOW_UBER': navigate(getPathForMode(AppMode.RIDE_REQUEST)); break;
      case 'SHOW_BILL_ANALYSIS': navigate(getPathForMode(AppMode.OMNIBUS)); break;
      case 'TRIGGER_SAFETY': navigate(getPathForMode(AppMode.GUARDIAN_ALERT)); break;
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
    navigate(getPathForMode(AppMode.CHAT));
  };

  // --- AUTH GUARD COMPONENT ---
  const RequireAuth = ({ children }: { children: React.ReactElement }) => {
    if (!isAuthenticated) {
      setLoginReason("Log in to view access this page.");
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (isAppLoading) return <div className="w-full h-full bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#00E341] border-t-transparent rounded-full animate-spin"></div></div>;

  // Paths requiring BottomNav
  const showBottomNav = ![
    '/login', '/signup', '/forgot-password',
    '/omnibus', '/guardian-alert', '/chat',
    '/ride-request', '/shopping-result'
  ].includes(location.pathname);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#F5F7F9] text-[#111827]">
      {showOnboarding && <Onboarding onComplete={() => { localStorage.setItem('aura_has_visited', 'true'); setShowOnboarding(false); }} />}

      <div className="relative w-full h-full z-10 flex flex-col">
        <Routes>
          {/* 1. Auth Views */}
          <Route path="/login" element={
            <LoginView
              onLoginSuccess={() => { setIsAuthenticated(true); setLoginReason(undefined); handleNavigation(AppMode.DASHBOARD); }}
              onNavigate={handleNavigation} // Legacy prop support
              loginMessage={loginReason}
              onClose={() => handleNavigation(AppMode.DASHBOARD)}
            />
          } />
          <Route path="/signup" element={
            <SignUpView
              onLoginSuccess={() => { setIsAuthenticated(true); handleNavigation(AppMode.DASHBOARD); }}
              onNavigate={handleNavigation}
            />
          } />
          <Route path="/forgot-password" element={<ForgotPasswordView onNavigate={handleNavigation} />} />

          {/* 2. Full Screen Overlays */}
          <Route path="/omnibus" element={
            <OmnibusScan
              onBack={() => handleNavigation(AppMode.DASHBOARD)}
              onNavigateToShopping={() => navigate(getPathForMode(AppMode.SHOPPING_RESULT))}
              onScanUsed={() => trackUsage('scan')}
            />
          } />
          <Route path="/guardian-alert" element={
            <GuardianAlert onDismiss={() => handleNavigation(AppMode.FAMILY_CONNECTIONS)} />
          } />
          <Route path="/chat" element={
            <ChatOverlay
              onClose={() => handleNavigation(AppMode.DASHBOARD)}
              onTriggerAction={handleActionTrigger}
              initialQuery={initialChatQuery}
              initialAction={initialChatAction}
              onVoiceInteraction={() => trackUsage('voice')}
              onSaveHistory={handleAddHistoryItem}
            />
          } />
          <Route path="/ride-request" element={
            <UberRideModal onClose={() => handleNavigation(AppMode.DASHBOARD)} />
          } />
          <Route path="/shopping-result" element={
            <ProcurerShop onBack={() => handleNavigation(AppMode.PLAN)} />
          } />

          {/* 3. Main Tab Views */}
          <Route path="/family-connections" element={<FamilyConnectionsView />} />
          <Route path="/plan" element={
            <PlanView
              onOpenGuide={() => setShowOnboarding(true)}
              items={historyItems}
              tasks={tasks}
              onUpdateTasks={handleTaskUpdate}
              onToggleImportant={handleToggleHistoryImportance}
              onDelete={handleDeleteHistoryItem}
              onShare={handleShareHistoryItem}
            />
          } />
          <Route path="/profile" element={
            <RequireAuth>
              <ProfileView onBack={() => handleNavigation(AppMode.DASHBOARD)} onOpenGuide={() => setShowOnboarding(true)} />
            </RequireAuth>
          } />
          <Route path="/settings" element={
            <RequireAuth>
              <SettingsView onBack={() => handleNavigation(AppMode.DASHBOARD)} />
            </RequireAuth>
          } />

          {/* 4. Default / Home */}
          <Route path="/" element={
            <Dashboard
              isListening={false}
              setIsListening={() => startChat()}
              pendingTasks={tasks.filter(t => !t.completed)}
              onSearch={(q) => startChat(q)}
              onFileSelected={() => startChat("", "ANALYZE_FILE")}
              onTriggerSOS={() => navigate(getPathForMode(AppMode.GUARDIAN_ALERT))}
              onVoiceUsed={() => trackUsage('voice')}
            />
          } />
        </Routes>
      </div>

      {/* Conditionally Render Bottom Nav */}
      {showBottomNav && (
        <BottomNav
          onMicTap={() => startChat()}
          isListening={false}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
