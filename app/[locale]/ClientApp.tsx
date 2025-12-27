'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { RoleProvider } from '@/contexts/RoleContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { BatchSubmission } from '@/components/BatchSubmission';
import { InspectionRequests } from '@/components/InspectionRequests';
import DigitalPassports from '@/components/DigitalPassports';
import { AuditLogs } from '@/components/AuditLogs';
import InjiVerify from '@/components/InjiVerify';

interface ClientAppProps {
  locale: string;
  messages: any;
}

export default function ClientApp({ locale, messages }: ClientAppProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutKey, setLayoutKey] = useState(0);

  useEffect(() => {
    const storedRole = localStorage.getItem('mock_role');

    if (!storedRole) {
      router.replace('/login');
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
    setLayoutKey(prev => prev + 1);

    const defaultView =
      storedRole === 'QA_AGENCY' ? 'inspection-requests' :
      storedRole === 'IMPORTER' ? 'digital-passports' :
      storedRole === 'ADMIN' ? 'audit-logs' :
      'dashboard';

    setCurrentView(defaultView);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('mock_role');
    router.replace('/login');
  };

  function renderView() {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'batch-submission':
        return <BatchSubmission />;
      case 'inspection-requests':
        return <InspectionRequests />;
      case 'digital-passports':
        return <DigitalPassports />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'inji-verify':
        return <InjiVerify />;
      default:
        return <Dashboard />;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <RoleProvider key={layoutKey}>
        <Layout currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout}>
          {renderView()}
        </Layout>
      </RoleProvider>
    </NextIntlClientProvider>
  );
}
