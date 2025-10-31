//PatientProfile.tsx

import { useState } from 'react';
import { Eye, Gamepad2, Lock, Trophy, TrendingUp, Clock, Target, Brain, Sparkles, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MetricsViewer } from '../components/common/MetricsViewer';

interface PatientProfileProps {
  onNavigate: (page: string) => void;
}

export const PatientProfile = ({ onNavigate }: PatientProfileProps) => {
  const { selectedPatient, gameMode, switchGameMode } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [parentPassword, setParentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showMetrics, setShowMetrics] = useState(false);

  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No hay paciente seleccionado</p>
      </div>
    );
  }

  const handleModeSwitch = () => {
    if (gameMode === 'juego') {
      setShowPasswordModal(true);
    } else {
      switchGameMode('juego');
    }
  };

  const handlePasswordSubmit = () => {
    const success = switchGameMode('observador', parentPassword);
    if (success) {
      setShowPasswordModal(false);
      setParentPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Contraseña incorrecta');
    }
  };

  const unlockedAchievements = selectedPatient.achievements.filter((a) => a.unlockedAt);
  const inProgressAchievements = selectedPatient.achievements.filter(
    (a) => !a.unlockedAt && a.progress
  );

  const avgEfficiency = selectedPatient.sessions.length > 0
    ? Math.round(
        selectedPatient.sessions.reduce((sum, s) => sum + s.efficiency, 0) /
          selectedPatient.sessions.length
      )
    : 0;

  const totalTime = Math.round(
    selectedPatient.sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-50 pb-12">
      <div
        className={`${
          gameMode === 'juego'
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
            : 'bg-gradient-to-r from-blue-600 to-cyan-500'
        } text-white py-8 transition-all`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {gameMode === 'juego' ? '¡Hola!' : 'Panel de Observación'}
              </h1>
              <p className={gameMode === 'juego' ? 'text-orange-100' : 'text-blue-100'}>
                {selectedPatient.name}
              </p>
            </div>
            <button
              onClick={handleModeSwitch}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                gameMode === 'juego'
                  ? 'bg-white text-orange-600 hover:bg-orange-50'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              {gameMode === 'juego' ? (
                <>
                  <Eye className="w-5 h-5" />
                  <span>Modo Observador</span>
                </>
              ) : (
                <>
                  <Gamepad2 className="w-5 h-5" />
                  <span>Modo Juego</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Modo Observador</h3>
              <p className="text-gray-600 mt-2">
                Ingresa la contraseña parental para continuar
              </p>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            <input
              type="password"
              value={parentPassword}
              onChange={(e) => {
                setParentPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Contraseña parental"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />

            <div className="flex space-x-3">
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setParentPassword('');
                  setPasswordError('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Contraseña de prueba: 1234 o {selectedPatient.password}
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 -mt-6">
        {gameMode === 'juego' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Mi Progreso</h2>
                <div className="text-right">
                  <p className="text-3xl font-bold text-yellow-600">
                    {selectedPatient.progress}%
                  </p>
                  <p className="text-sm text-gray-600">Completado</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full transition-all"
                  style={{ width: `${selectedPatient.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Botón para ver métricas de tiempo */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <span>Métricas de Tiempo</span>
                  </h3>
                  <p className="text-gray-600">
                    Revisa cuánto tiempo has dedicado a cada juego y sesión
                  </p>
                </div>
                <button
                  onClick={() => setShowMetrics(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>Ver Métricas</span>
                </button>
              </div>
            </div>

            {/* Botón destacado para MirrorHub */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Brain className="w-10 h-10 text-yellow-300" />
                    <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Espejos Cognitivos
                  </h2>
                  <p className="text-purple-100 text-lg mb-4">
                    Descubre los patrones únicos de tu mente a través de experiencias gamificadas
                  </p>
                  <button
                    onClick={() => onNavigate('mirror-hub')}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Brain className="w-5 h-5" />
                    <span>Explorar Mis Espejos</span>
                  </button>
                </div>
                <div className="hidden md:block text-8xl opacity-20">
                  🧠
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Trophy className="w-7 h-7 text-yellow-600" />
                <span>Mis Logros</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-md"
                  >
                    <div className="text-4xl mb-2 text-center">{achievement.icon}</div>
                    <h3 className="font-bold text-gray-900 text-center mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 text-center">
                      {achievement.description}
                    </p>
                  </div>
                ))}

                {inProgressAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"
                  >
                    <div className="text-4xl mb-2 text-center opacity-50">
                      {achievement.icon}
                    </div>
                    <h3 className="font-bold text-gray-700 text-center mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-2">
                      {achievement.description}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>
                          {achievement.progress}/{achievement.goal}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              ((achievement.progress || 0) / (achievement.goal || 1)) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Sesiones</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {selectedPatient.sessions.length}
                    </p>
                  </div>
                  <Target className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Tiempo Total</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalTime} min</p>
                  </div>
                  <Clock className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Eficiencia</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{avgEfficiency}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Logros</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {unlockedAchievements.length}
                    </p>
                  </div>
                  <Trophy className="w-10 h-10 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Sesiones</h2>

              <div className="space-y-4">
                {selectedPatient.sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Sesión {selectedPatient.sessions.length - index}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(session.startTime).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {session.completed ? 'Completada' : 'Incompleta'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Movimientos</p>
                        <p className="text-xl font-bold text-gray-900">{session.moves}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duración</p>
                        <p className="text-xl font-bold text-gray-900">
                          {Math.round((session.duration || 0) / 60)} min
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Eficiencia</p>
                        <p className="text-xl font-bold text-gray-900">{session.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estrategia</p>
                        <p className="text-sm font-medium text-gray-900">
                          {session.metrics.strategy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cerebro 3D Amelia en Modo Observador */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-2xl shadow-2xl p-8 border-2 border-purple-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mapa Cognitivo 3D</h2>
                  <p className="text-gray-600">Visualización cerebral de {selectedPatient.name}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 rounded-xl shadow-lg border border-purple-200 py-6">
                <div className="text-center space-y-4 px-6">
                  {/* Cerebro animado con CSS - MÁS COMPACTO */}
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute inset-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute inset-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-16 h-16 text-purple-600 animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      Visualización Cerebral 3D
                    </h3>
                    <p className="text-sm text-gray-600">
                      Mapa cognitivo de <span className="font-semibold text-purple-600">{selectedPatient.name}</span>
                    </p>
                    <div className="mt-2 inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Análisis en tiempo real</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-2xl mb-1">🧠</div>
                      <p className="text-xs text-gray-600">Memoria</p>
                      <p className="text-base font-bold text-cyan-600">{Math.round(avgEfficiency * 0.9)}%</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-2xl mb-1">⚡</div>
                      <p className="text-xs text-gray-600">Flexibilidad</p>
                      <p className="text-base font-bold text-purple-600">{Math.round(selectedPatient.progress * 0.8)}%</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-2xl mb-1">🎯</div>
                      <p className="text-xs text-gray-600">Resolución</p>
                      <p className="text-base font-bold text-emerald-600">{Math.round(avgEfficiency * 1.1)}%</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-2xl mb-1">🔥</div>
                      <p className="text-xs text-gray-600">Persistencia</p>
                      <p className="text-base font-bold text-orange-600">{Math.min(100, selectedPatient.sessions.length * 5)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-90">Memoria de Trabajo</p>
                  <p className="text-3xl font-bold">{Math.round(avgEfficiency * 0.9)}%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-90">Flexibilidad Cognitiva</p>
                  <p className="text-3xl font-bold">{Math.round(selectedPatient.progress * 0.8)}%</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-90">Resolución de Problemas</p>
                  <p className="text-3xl font-bold">{Math.round(avgEfficiency * 1.1)}%</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white">
                  <p className="text-sm opacity-90">Persistencia</p>
                  <p className="text-3xl font-bold">{Math.min(100, selectedPatient.sessions.length * 5)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Recomendaciones y Análisis
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>
                    <strong>Progreso general:</strong> {selectedPatient.name} muestra un avance
                    del {selectedPatient.progress}%, lo cual es{' '}
                    {selectedPatient.progress > 50 ? 'excelente' : 'positivo'}.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>
                    <strong>Eficiencia:</strong> La eficiencia promedio es del {avgEfficiency}%.
                    Se recomienda practicar estrategias más directas.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>
                    <strong>Constancia:</strong> Ha completado {selectedPatient.sessions.length}{' '}
                    sesiones. Mantener la práctica regular es clave.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-1">•</span>
                  <span>
                    <strong>Logros:</strong> Ha desbloqueado {unlockedAchievements.length} logros.
                    Celebrar estos hitos refuerza la motivación.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Métricas */}
      {showMetrics && (
        <MetricsViewer 
          onClose={() => setShowMetrics(false)}
          userId={selectedPatient.id}
          userName={selectedPatient.name}
        />
      )}
    </div>
  );
};
