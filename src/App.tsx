/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CareAIProvider, useCareAI } from './contexts/CareAIContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import { EmergencyModal } from './components/EmergencyModal';
import { DemoFloatingBar } from './components/DemoFloatingBar';

// Page components
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ElderlyDashboard } from './pages/ElderlyDashboard';
import { ElderlyReminderPage } from './pages/ElderlyReminderPage';
import { ElderlyAssistantPage } from './pages/ElderlyAssistantPage';
import { ElderlyHistoryPage } from './pages/ElderlyHistoryPage';
import { CaregiverDashboard } from './pages/CaregiverDashboard';
import { CaregiverMedicinesPage } from './pages/CaregiverMedicinesPage';
import { CaregiverMedicineFormPage } from './pages/CaregiverMedicineFormPage';
import { CaregiverHistoryPage } from './pages/CaregiverHistoryPage';
import { CaregiverNotificationsPage } from './pages/CaregiverNotificationsPage';
import { CaregiverUsersPage } from './pages/CaregiverUsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoPage } from './pages/DemoPage';

function MainRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const { isEmergencyOpen, closeEmergency } = useCareAI();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Route parser
  const renderRoute = () => {
    // 1. Landing
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage navigate={navigate} />;
    }

    // 2. Login
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }

    // 3. Demo Simulator
    if (currentPath === '/demo') {
      return <DemoPage navigate={navigate} />;
    }

    // 4. Settings
    if (currentPath === '/settings') {
      return <SettingsPage navigate={navigate} />;
    }

    // 5. Elderly Experience
    if (currentPath === '/elderly') {
      return <ElderlyDashboard navigate={navigate} />;
    }

    if (currentPath.startsWith('/elderly/reminder/')) {
      const parts = currentPath.split('/');
      const reminderId = parts[3] || '';
      return <ElderlyReminderPage reminderId={reminderId} navigate={navigate} />;
    }

    if (currentPath === '/elderly/assistant') {
      return <ElderlyAssistantPage navigate={navigate} userType="elderly" />;
    }

    if (currentPath === '/elderly/history') {
      return <ElderlyHistoryPage navigate={navigate} />;
    }

    // 6. Caregiver Experience
    if (currentPath === '/caregiver') {
      return <CaregiverDashboard navigate={navigate} />;
    }

    if (currentPath === '/caregiver/medicines') {
      return <CaregiverMedicinesPage navigate={navigate} />;
    }

    if (currentPath === '/caregiver/medicines/new') {
      return <CaregiverMedicineFormPage navigate={navigate} />;
    }

    if (currentPath.startsWith('/caregiver/medicines/') && currentPath.endsWith('/edit')) {
      const parts = currentPath.split('/');
      const medicineId = parts[3] || '';
      return <CaregiverMedicineFormPage medicineId={medicineId} navigate={navigate} />;
    }

    if (currentPath === '/caregiver/assistant') {
      return <ElderlyAssistantPage navigate={navigate} userType="caregiver" />;
    }

    if (currentPath === '/caregiver/history') {
      return <CaregiverHistoryPage navigate={navigate} />;
    }

    if (currentPath === '/caregiver/notifications') {
      return <CaregiverNotificationsPage navigate={navigate} />;
    }

    if (currentPath === '/caregiver/users') {
      return <CaregiverUsersPage navigate={navigate} />;
    }

    // Fallback: Default to LandingPage
    return <LandingPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-200 selection:text-teal-900">
      {/* Universal Top Navigation */}
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Floating Demo Escalation Bar for Testing Care Loop Anywhere */}
      <DemoFloatingBar navigate={navigate} />

      {/* Clinical Emergency Modal */}
      <EmergencyModal isOpen={isEmergencyOpen} onClose={closeEmergency} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CareAIProvider>
          <MainRouter />
        </CareAIProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
