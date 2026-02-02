import React from 'react';
import { RouteObject } from 'react-router-dom';
import { AppMode } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import LoginView from './pages/LoginView';
import SignUpView from './pages/SignUpView';
import ForgotPasswordView from './pages/ForgotPasswordView';
import OmnibusScan from './pages/OmnibusScan';
import GuardianAlert from './pages/GuardianAlert';
import FamilyConnectionsView from './pages/FamilyConnectionsView';
import PlanView from './pages/PlanView';
import ProfileView from './pages/ProfileView';
import SettingsView from './pages/SettingsView';
import ProcurerShop from './pages/ProcurerShop';
import RideDetailPage from './pages/RideDetailPage';
import CarePersonMedicationConfirm from './pages/CarePersonMedicationConfirm';

// Components acting as pages/modals
import ChatOverlay from './components/ChatOverlay';
import UberRideModal from './components/UberRideModal';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/signup',
    element: <SignUpView />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordView />,
  },
  {
    path: '/omnibus',
    element: <OmnibusScan />,
  },
  {
    path: '/guardian-alert',
    element: <GuardianAlert />,
  },
  {
    path: '/chat',
    element: <ChatOverlay />,
  },
  {
    path: '/ride-request',
    element: <UberRideModal />,
  },
  {
    path: '/shopping-result',
    element: <ProcurerShop />,
  },
  {
    path: '/family-connections',
    element: <FamilyConnectionsView />,
  },
  {
    path: '/plan',
    element: <PlanView />,
  },
  {
    path: '/profile',
    element: <ProfileView />,
  },
  {
    path: '/settings',
    element: <SettingsView />,
  },
  {
    path: '/ride-detail',
    element: <RideDetailPage />,
  },
  {
    path: '/medication-confirm',
    element: <CarePersonMedicationConfirm />,
  },
];

// Helper to map AppMode to path (for legacy support during migration)
export const getPathForMode = (mode: AppMode): string => {
  switch (mode) {
    case AppMode.LOGIN: return '/login';
    case AppMode.SIGNUP: return '/signup';
    case AppMode.FORGOT_PASSWORD: return '/forgot-password';
    case AppMode.DASHBOARD: return '/';
    case AppMode.MATE: return '/family-connections'; // Mapped MATE to Family Connections based on previous App.tsx
    case AppMode.FAMILY_CONNECTIONS: return '/family-connections';
    case AppMode.PLAN: return '/plan';
    case AppMode.PROFILE: return '/profile';
    case AppMode.SETTINGS: return '/settings';
    case AppMode.ALL_ACTIVITY: return '/all-activity';
    case AppMode.OMNIBUS: return '/omnibus';
    case AppMode.GUARDIAN_ALERT: return '/guardian-alert';
    case AppMode.CHAT: return '/chat';
    case AppMode.RIDE_REQUEST: return '/ride-request';
    case AppMode.SHOPPING_RESULT: return '/shopping-result';
    case AppMode.RIDE_DETAIL: return '/ride-detail';
    default: return '/';
  }
};
