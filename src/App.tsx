//App.tsx

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { InstitutionPanel } from './pages/InstitutionPanel';
import { TherapistPanel } from './pages/TherapistPanel';
import { PatientProfile } from './pages/PatientProfile';
import { RubikGamePage } from './pages/RubikGamePage';
import { MirrorHub } from './pages/MirrorHub';
import { MemoryMirror } from './components/mirrors/MemoryMirror';
import { TryNowPage } from './pages/TryNowPage';

type Page =
  | 'home'
  | 'about'
  | 'what-we-do'
  | 'login'
  | 'register'
  | 'try-now'
  | 'institution-panel'
  | 'therapist-panel'
  | 'patient-profile'
  | 'rubik-game'
  | 'mirror-hub'
  | 'memory-mirror';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.type === 'institucional') {
        setCurrentPage('institution-panel');
      } else if (currentUser.type === 'terapeuta') {
        setCurrentPage('therapist-panel');
      } else if (currentUser.type === 'paciente') {
        setCurrentPage('patient-profile');
      }
    } else {
      if (
        currentPage === 'institution-panel' ||
        currentPage === 'therapist-panel' ||
        currentPage === 'patient-profile' ||
        currentPage === 'rubik-game'
      ) {
        setCurrentPage('home');
      }
    }
  }, [currentUser]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
      case 'about':
      case 'what-we-do':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'try-now':
        return <TryNowPage onNavigate={handleNavigate} />;
      case 'institution-panel':
        return <InstitutionPanel onNavigate={handleNavigate} />;
      case 'therapist-panel':
        return <TherapistPanel onNavigate={handleNavigate} />;
      case 'patient-profile':
        return <PatientProfile onNavigate={handleNavigate} />;
      case 'rubik-game':
        return <RubikGamePage onNavigate={handleNavigate} />;
      case 'mirror-hub':
        return <MirrorHub onNavigate={handleNavigate} userName={currentUser?.name || 'Usuario'} />;
      case 'memory-mirror':
        return (
          <MemoryMirror
            userId={currentUser?.id || 'demo-user'}
            userName={currentUser?.name || 'Usuario'}
            onBack={() => handleNavigate('mirror-hub')}
          />
        );
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const showHeaderFooter = currentPage !== 'rubik-game' && currentPage !== 'memory-mirror' && currentPage !== 'mirror-hub';

  return (
    <div className="min-h-screen flex flex-col">
      {showHeaderFooter && <Header onNavigate={handleNavigate} currentPage={currentPage} />}
      <main className="flex-1">{renderPage()}</main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
