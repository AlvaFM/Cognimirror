// ObserverDashboard.tsx - Panel del Observador (Vista para Padres/Tutores) - v2.0
// Con Guía Educativa para Padres
import { useState } from 'react';
import { ArrowLeft, Brain, TrendingUp, Activity, Target, Zap } from 'lucide-react';
import { useAnalysisHistory } from '../context/AnalysisHistoryContext';

interface ObserverDashboardProps {
  onNavigate: (page: string) => void;
  userId: string;
  userName: string;
}

export const ObserverDashboard = ({ onNavigate, userId, userName }: ObserverDashboardProps) => {
  const { gameHistory } = useAnalysisHistory();
  const [selectedGame, setSelectedGame] = useState<'all' | 'memory_mirror_v1' | 'tetris_mirror_v1' | 'digit_span_v1'>('all');

  // Filtrar SOLO las sesiones del usuario actual (el niño)
  const userSessions = gameHistory.filter(session => session.userId === userId);
  
  // Aplicar filtro de juego
  const filteredSessions = selectedGame === 'all' 
    ? userSessions 
    : userSessions.filter(session => session.gameId === selectedGame);

  // Calcular estadísticas del niño
  const memoryMirrorSessions = filteredSessions.filter(s => s.gameId === 'memory_mirror_v1');
  const digitSpanSessions = filteredSessions.filter(s => s.gameId === 'digit_span_v1');
  
  const stats = {
    totalSessions: filteredSessions.length,
    totalGames: userSessions.length, // Todas las sesiones del niño
    
    // Mejor desempeño
    bestMaxSpan: memoryMirrorSessions.length > 0
      ? Math.max(...memoryMirrorSessions.map((s: any) => s.metrics.maxSpan || 0))
      : 0,
    
    // Promedio Max Span
    avgMaxSpan: memoryMirrorSessions.length > 0
      ? memoryMirrorSessions.reduce((sum, s: any) => sum + (s.metrics.maxSpan || 0), 0) / memoryMirrorSessions.length
      : 0,
    
    // Fluidez Cognitiva Promedio
    avgCognitiveFluency: filteredSessions.length > 0
      ? filteredSessions.reduce((sum, s: any) => sum + (s.metrics.cognitiveFluency || 0), 0) / filteredSessions.length
      : 0,
    
    // Persistencia Total
    totalPersistence: filteredSessions.reduce((sum, s: any) => sum + (s.metrics.persistence || 0), 0),
    
    // Auto-Corrección Promedio
    avgSelfCorrection: filteredSessions.length > 0
      ? filteredSessions.reduce((sum, s: any) => sum + (s.metrics.selfCorrectionIndex || 0), 0) / filteredSessions.length
      : 0,
    
    // Tiempo total jugado (en minutos)
    totalTimePlayed: filteredSessions.reduce((sum, s: any) => sum + (s.metrics.totalSessionTime || 0), 0) / 60,
  };

  // Datos de progresión temporal
  const progressionData = filteredSessions
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(-10); // Últimas 10 sesiones

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg transition-all shadow"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Volver</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <Activity className="w-10 h-10 text-purple-600" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Panel de Observación</h1>
              <p className="text-gray-600">{userName}</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('mirror-hub')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all shadow-lg"
          >
            Modo Juego
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filtrar por Juego</h2>
          <div className="max-w-md">
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            >
              <option value="all">📊 Todos los juegos</option>
              <option value="memory_mirror_v1">🧠 Memory Mirror</option>
              <option value="digit_span_v1">🔢 Digit Span</option>
              <option value="tetris_mirror_v1">👑 Tetris Mirror</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Sesiones */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{stats.totalSessions}</span>
            </div>
            <p className="text-sm opacity-90">Sesiones</p>
          </div>

          {/* Tiempo Total Jugado */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{Math.round(stats.totalTimePlayed)}</span>
            </div>
            <p className="text-sm opacity-90">Minutos Totales</p>
          </div>

          {/* Mejor Max Span */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{stats.bestMaxSpan}</span>
            </div>
            <p className="text-sm opacity-90">Mejor Max Span</p>
          </div>

          {/* Fluidez Promedio */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{Math.round(stats.avgCognitiveFluency)}</span>
            </div>
            <p className="text-sm opacity-90">Fluidez (ms)</p>
          </div>
        </div>

        {/* Métricas Detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Métricas de Proceso */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              Métricas de Proceso
            </h3>
            
            <div className="space-y-4">
              {/* Persistencia */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Persistencia Total</span>
                  <span className="text-sm font-bold text-green-600">{stats.totalPersistence} reintentos</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(stats.totalPersistence * 5, 100)}%` }}
                  />
                </div>
              </div>

              {/* Auto-Corrección */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Índice Auto-Corrección</span>
                  <span className="text-sm font-bold text-blue-600">{stats.avgSelfCorrection.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(Math.abs(stats.avgSelfCorrection), 100)}%` }}
                  />
                </div>
              </div>

              {/* Fluidez Cognitiva */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Fluidez Cognitiva</span>
                  <span className="text-sm font-bold text-purple-600">{Math.round(stats.avgCognitiveFluency)}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((2000 - stats.avgCognitiveFluency) / 20, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progresión Temporal */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Progresión Temporal</h3>
            
            {progressionData.length > 0 ? (
              <div className="space-y-2">
                {progressionData.map((session, i) => {
                  const isMemoryMirror = session.gameId === 'memory_mirror_v1';
                  const value = isMemoryMirror && 'maxSpan' in session.metrics
                    ? (session.metrics as any).maxSpan
                    : 0;
                  
                  const gameIcon = session.gameId === 'memory_mirror_v1' ? '🧠' : 
                                  session.gameId === 'digit_span_v1' ? '🔢' : '👑';
                  
                  return (
                    <div key={i} className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500 w-28">
                        {new Date(session.startTime).toLocaleDateString('es-ES', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="text-lg">{gameIcon}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
                        >
                          <span className="text-xs font-bold text-white">{value}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos de progresión</p>
              </div>
            )}
          </div>
        </div>

        {/* Guía para Padres */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Brain className="w-7 h-7 text-purple-600 mr-2" />
            Guía para Padres: Cómo Ayudar a tu Hijo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Memory Mirror */}
            <div className="bg-white rounded-lg p-5 border-l-4 border-cyan-500">
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">🧠</span>
                Memory Mirror
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                <strong className="text-cyan-600">Qué revela:</strong> Memoria de trabajo visual, atención sostenida y capacidad de secuenciación.
              </p>
              <p className="text-sm text-gray-700">
                <strong className="text-green-600">Cómo ayudar:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 mt-2">
                <li>• Juegos de memoria con cartas</li>
                <li>• Repetir secuencias de objetos</li>
                <li>• Simon Says (juego de seguir instrucciones)</li>
                <li>• Ejercicios de concentración sin distracciones</li>
              </ul>
            </div>

            {/* Digit Span */}
            <div className="bg-white rounded-lg p-5 border-l-4 border-green-500">
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">🔢</span>
                Digit Span
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                <strong className="text-teal-600">Qué revela:</strong> Memoria verbal, retención auditiva y procesamiento secuencial del lenguaje.
              </p>
              <p className="text-sm text-gray-700">
                <strong className="text-green-600">Cómo ayudar:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 mt-2">
                <li>• Repetir números de teléfono</li>
                <li>• Juegos de "teléfono descompuesto"</li>
                <li>• Leer en voz alta y resumir</li>
                <li>• Ejercicios de escucha activa</li>
              </ul>
            </div>

            {/* Tetris Mirror */}
            <div className="bg-white rounded-lg p-5 border-l-4 border-amber-500">
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">👑</span>
                Tetris Mirror
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                <strong className="text-amber-600">Qué revela:</strong> Velocidad de procesamiento, coordinación visoespacial y toma rápida de decisiones.
              </p>
              <p className="text-sm text-gray-700">
                <strong className="text-green-600">Cómo ayudar:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 mt-2">
                <li>• Puzzles y rompecabezas</li>
                <li>• Juegos de construcción (LEGO)</li>
                <li>• Actividades de orientación espacial</li>
                <li>• Deportes que requieren coordinación</li>
              </ul>
            </div>

            {/* Consejos Generales */}
            <div className="bg-white rounded-lg p-5 border-l-4 border-purple-500">
              <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Consejos Generales
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                <strong className="text-purple-600">Claves para el éxito:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• <strong>Celebra el esfuerzo</strong>, no solo resultados</li>
                <li>• <strong>Practica regularmente</strong> (10-15 min/día)</li>
                <li>• <strong>Sin presión</strong>: cada niño avanza a su ritmo</li>
                <li>• <strong>Observa patrones</strong>: ¿cuándo rinde mejor?</li>
                <li>• <strong>Descansos adecuados</strong>: el cerebro necesita pausas</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-purple-100 rounded-lg p-4 border border-purple-300">
            <p className="text-sm text-gray-800">
              <strong className="text-purple-700">💜 Recuerda:</strong> Estos juegos NO son exámenes. 
              Son herramientas para <strong>descubrir fortalezas</strong> y <strong>celebrar el progreso</strong>. 
              Cada mejora, por pequeña que sea, es un logro significativo. 
              Tu apoyo positivo es el factor más importante en su desarrollo cognitivo.
            </p>
          </div>
        </div>

        {/* Lista de Sesiones */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Últimas Sesiones</h3>
          
          {filteredSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Juego</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duración</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Max Span</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Persistencia</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fluidez</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSessions.slice(-20).reverse().map((session, i) => {
                    const isMemoryMirror = session.gameId === 'memory_mirror_v1';
                    const isDigitSpan = session.gameId === 'digit_span_v1';
                    const metrics: any = session.metrics;
                    
                    const gameName = isMemoryMirror ? '🧠 Memory Mirror' : 
                                    isDigitSpan ? '🔢 Digit Span' : '👑 Tetris';
                    
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {gameName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(session.startTime).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {Math.round(metrics.totalSessionTime || 0)}s
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-cyan-600">
                          {(isMemoryMirror || isDigitSpan) && metrics.maxSpan ? metrics.maxSpan : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-600">
                          {metrics.persistence || 0}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-purple-600">
                          {Math.round(metrics.cognitiveFluency || 0)}ms
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Completada
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay sesiones que mostrar</p>
              <p className="text-sm">Aplica filtros diferentes o espera a que se registren más sesiones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
