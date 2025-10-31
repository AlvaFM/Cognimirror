//LoginPage.tsx

import { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage = ({ onNavigate }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, currentUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = login(email, password);

    if (success) {
      if (currentUser?.type === 'institucional') {
        onNavigate('institution-panel');
      } else if (currentUser?.type === 'terapeuta') {
        onNavigate('therapist-panel');
      } else if (currentUser?.type === 'paciente') {
        onNavigate('patient-profile');
      }
    } else {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setTimeout(() => {
      setShowForgotPassword(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede a tu cuenta de CogniMirror</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {showForgotPassword && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Se ha enviado un correo de recuperación a tu dirección de email (simulado).
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </button>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Registrarte
              </button>
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700">Usuarios de prueba:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Institución: instituto@cogntech.com / 123456</p>
              <p>Terapeuta: ana.garcia@cogntech.com / 123456</p>
              <p>Paciente: lucas@cogntech.com / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
