//Header.tsx

import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header = ({ onNavigate, currentPage }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🧠</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">CogniMirror</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {!currentUser ? (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`font-medium transition-colors ${
                    currentPage === 'home'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Inicio
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className={`font-medium transition-colors ${
                    currentPage === 'about'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Quiénes Somos
                </button>
                <button
                  onClick={() => onNavigate('what-we-do')}
                  className={`font-medium transition-colors ${
                    currentPage === 'what-we-do'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Qué Hacemos
                </button>
                <button
                  onClick={() => onNavigate('try-now')}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pruébalo ahora
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-gray-600 hover:text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('home');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 rounded-lg"
                >
                  Inicio
                </button>
                <button
                  onClick={() => {
                    onNavigate('about');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 rounded-lg"
                >
                  Quiénes Somos
                </button>
                <button
                  onClick={() => {
                    onNavigate('what-we-do');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-blue-50 rounded-lg"
                >
                  Qué Hacemos
                </button>
                <button
                  onClick={() => {
                    onNavigate('try-now');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Pruébalo ahora
                </button>
              </>
            ) : (
              <>
                <div className="px-4 py-2 text-gray-700 font-medium">
                  {currentUser.name}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Salir
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
