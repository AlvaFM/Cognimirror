//TryNowPage.tsx

import { useState } from 'react';
import { UserPlus, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TryNowPageProps {
  onNavigate: (page: string) => void;
}

export const TryNowPage = ({ onNavigate }: TryNowPageProps) => {
  const { quickTry } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ageNumber = typeof age === 'string' ? parseInt(age || '0', 10) : age;

    if (!name.trim() || !ageNumber || ageNumber < 4 || ageNumber > 18) {
      setError('Ingresa un nombre y una edad válida (4 a 18 años).');
      return;
    }

    quickTry(name.trim(), ageNumber);
    onNavigate('patient-profile');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Pruébalo Ahora</h2>
            <p className="text-gray-600">Ingresa un nombre y edad para explorar el perfil</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Sofía Ramirez"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Edad</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={4}
                  max={18}
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a mi Perfil
            </button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Volver
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};