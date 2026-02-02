
import React, { useEffect } from 'react';
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
import RideDetailPage from './pages/RideDetailPage';
import CarePersonMedicationConfirm from './pages/CarePersonMedicationConfirm';
import LoginView from './pages/LoginView';
import SignUpView from './pages/SignUpView';
import ForgotPasswordView from './pages/ForgotPasswordView';
import AllActivityView from './pages/AllActivityView';
import PlusPaywall from './components/Paywall/PlusPaywall';
import { checkPaywallTrigger } from './util/paywallUtils';

import { AppMode, HistoryItem, TaskCard } from './types';
import { getPathForMode } from './routes';
import { useAuthStore } from './stores/useAuthStore';
import { useDataStore } from './stores/useDataStore';
// import VConsole from 'vconsole';
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();


  // --- 1. GLOBAL APP STATE (The Source of Truth) ---
  // --- STORE STATE ---
  const { isAuthenticated, isLoading: isAppLoading, loginReason, checkAuth, setLoginReason } = useAuthStore();
  const { addHistoryItem } = useDataStore(); // Example usage for saving history if needed

  useEffect(() => {
    checkAuth();
  }, []);

  // UI State
  const [showOnboarding, setShowOnboarding] = React.useState(false); // Kept local if UI-only
  const [showPaywall, setShowPaywall] = React.useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    const hasVisited = localStorage.getItem('aura_has_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
    }
    // Auth check is handled by store now
  }, []);

  // Data state (tasks, history) is now in useDataStore and accessed directly by components



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

  const handleCheckPaywall = (type: 'voice' | 'photo') => {
    const shouldShow = checkPaywallTrigger(type);
    if (shouldShow) {
      // setShowPaywall(true);
    }
  };

  // Chat state can remain local local or moved to store if needed globally later
  const [initialChatQuery, setInitialChatQuery] = React.useState("");
  const [initialChatAction, setInitialChatAction] = React.useState<string | null>(null);

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
  // Only show BottomNav on main tabs
  const showBottomNav = ['/', '/plan', '/family-connections', '/profile'].includes(location.pathname);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#F5F7F9] text-[#111827]">
      {showPaywall && <PlusPaywall onClose={() => setShowPaywall(false)} />}
      {showOnboarding && <Onboarding onComplete={() => { localStorage.setItem('aura_has_visited', 'true'); setShowOnboarding(false); setShowPaywall(true); }} />}

      <div className="relative w-full h-full z-10 flex flex-col">
        <Routes>
          {/* 1. Auth Views */}
          <Route path="/login" element={
            <LoginView
              onLoginSuccess={() => { handleNavigation(AppMode.DASHBOARD); }}
              onNavigate={handleNavigation} // Legacy prop support
              loginMessage={loginReason}
              onClose={() => handleNavigation(AppMode.DASHBOARD)}
            />
          } />
          <Route path="/signup" element={
            <SignUpView
              onLoginSuccess={() => { handleNavigation(AppMode.DASHBOARD); }}
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
            <GuardianAlert onDismiss={() => handleNavigation(AppMode.DASHBOARD)} />
          } />
          <Route path="/chat" element={
            <ChatOverlay
              onClose={() => handleNavigation(AppMode.DASHBOARD)}
              onTriggerAction={handleActionTrigger}
              initialQuery={initialChatQuery}
              initialAction={initialChatAction}
              onVoiceInteraction={() => { trackUsage('voice'); handleCheckPaywall('voice'); }}
            />
          } />
          <Route path="/ride-request" element={
            <UberRideModal onClose={() => handleNavigation(AppMode.DASHBOARD)} />
          } />
          <Route path="/shopping-result" element={
            <ProcurerShop onBack={() => handleNavigation(AppMode.PLAN)} />
          } />
          <Route path="/ride-detail" element={<RideDetailPage />} />
          <Route path="/medication-confirm" element={<CarePersonMedicationConfirm />} />

          {/* 3. Main Tab Views */}
          <Route path="/family-connections" element={<FamilyConnectionsView onPhotoFixUsed={() => handleCheckPaywall('photo')} />} />
          <Route path="/plan" element={
            <PlanView
              onOpenGuide={() => setShowOnboarding(true)}
            />
          } />
          <Route path="/profile" element={
            <RequireAuth>
              <ProfileView onBack={() => handleNavigation(AppMode.DASHBOARD)} onOpenGuide={() => setShowOnboarding(true)} onSubscriptionClick={() => setShowPaywall(true)} />
            </RequireAuth>
          } />
          <Route path="/settings" element={
            <RequireAuth>
              <SettingsView 
                onBack={() => handleNavigation(AppMode.DASHBOARD)} 
                onNavigate={handleNavigation}
                onLogout={() => { /* Handled in SettingsView */ }}
              />
            </RequireAuth>
          } />
          <Route path="/all-activity" element={
            <AllActivityView onBack={() => handleNavigation(AppMode.DASHBOARD)} />
          } />

          {/* 4. Default / Home */}
          <Route path="/" element={
            <Dashboard
              isListening={false}
              setIsListening={() => startChat()}
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
