// firebase.ts - CogniMirror 2.0 Firebase Configuration (Solo Firestore y Gemini)
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  initializeFirestore, 
  Firestore, 
  persistentLocalCache, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { CognitiveSession, CognitiveProfile, AnalysisGameSession } from '../types';

// Interfaces para métricas de tiempo
interface TimeMetrics {
  userId: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  games: GameMetric[];
  pages: Record<string, number>;
  timestamp: string;
}

interface GameMetric {
  gameName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  level?: number;
  score?: number;
  completed: boolean;
}

// ============================================================================
// FIREBASE CONFIG
// ============================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyC606eAk-HJLpZ1iA4IBfbuxHX_tGfA0Fs",
  authDomain: "cogntech-2fca1.firebaseapp.com",
  projectId: "cogntech-2fca1",
  storageBucket: "cogntech-2fca1.appspot.com",
  messagingSenderId: "22120571205",
  appId: "1:22120571205:web:82fcda6d020d3e6055de2c"
};

// ============================================================================
// GOOGLE TEXT-TO-SPEECH CONFIG
// ============================================================================

export const googleTTSConfig = {
  apiKey: "AIzaSyAsQjEwotmr4MuQ7KQAXh4WckkRB2_kpNg",
  voice: { 
    languageCode: 'es-US', 
    name: 'es-US-Neural2-A', 
    ssmlGender: 'FEMALE' as const 
  },
  audio: { 
    speakingRate: 1.0, 
    pitch: 1.0, 
    volumeGainDb: 0.0 
  }
};

export const fallbackVoiceConfig = {
  lang: 'es-ES',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  displayName: 'Voz Genérica del Navegador'
};

// ============================================================================
// INITIALIZE FIREBASE
// ============================================================================

export const app: FirebaseApp = initializeApp(firebaseConfig);

export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true,
});

// ============================================================================
// GEMINI AI CONFIG (usado por CoachAI.ts)
// ============================================================================
// GEMINI API - Usando la clave con Generative Language API habilitada
export const geminiConfig = {
  apiKey: "AIzaSyDhwcCkRRNAoiTC0LQAxPUXBSpQ04vK6_8l", // Gemini Developer key (Firebase)
  model: 'gemini-1.5-flash' // Modelo estable, ampliamente disponible
};

// ============================================================================
// FIRESTORE HELPERS - COGNITIVE SESSIONS
// ============================================================================

/**
 * Guarda una sesión cognitiva en Firestore
 */
export async function saveCognitiveSession(session: CognitiveSession): Promise<void> {
  const sessionRef = doc(db, 'cognitiveSessions', `${session.userId}_${session.startTime}`);
  await setDoc(sessionRef, session);
  console.log('✅ Sesión guardada en Firebase:', session.gameId);
}

/**
 * Obtiene todas las sesiones de un usuario
 */
export async function getUserSessions(userId: string): Promise<CognitiveSession[]> {
  const sessionsRef = collection(db, 'cognitiveSessions');
  const q = query(sessionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CognitiveSession);
}

/**
 * Guarda el perfil cognitivo completo
 */
export async function saveCognitiveProfile(profile: CognitiveProfile): Promise<void> {
  const profileRef = doc(db, 'cognitiveProfiles', profile.userId);
  await setDoc(profileRef, profile, { merge: true });
  console.log('✅ Perfil cognitivo actualizado en Firebase');
}

/**
 * Obtiene el perfil cognitivo de un usuario
 */
export async function getCognitiveProfile(userId: string): Promise<CognitiveProfile | null> {
  const profileRef = doc(db, 'cognitiveProfiles', userId);
  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? snapshot.data() as CognitiveProfile : null;
}

// ============================================================================
// FIRESTORE HELPERS - ANALYSIS GAME SESSIONS (LOG DE BATALLA)
// ============================================================================

/**
 * Guarda una sesión de análisis cognitivo completa en Firebase
 */
export async function saveAnalysisGameSession(session: AnalysisGameSession): Promise<void> {
  try {
    const sessionRef = doc(db, 'analysisGameSessions', `${session.userId}_${session.startTime}`);
    await setDoc(sessionRef, session);
    console.log('✅ Sesión de análisis guardada en Firebase:', session.gameId, 'Max Span:', session.metrics.maxSpan);
  } catch (error) {
    console.error('❌ Error guardando sesión de análisis:', error);
    throw error;
  }
}

/**
 * Obtiene todas las sesiones de análisis de un usuario
 */
export async function getUserAnalysisSessions(userId: string): Promise<AnalysisGameSession[]> {
  try {
    const sessionsRef = collection(db, 'analysisGameSessions');
    const q = query(
      sessionsRef, 
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AnalysisGameSession);
  } catch (error) {
    console.error('❌ Error obteniendo sesiones de análisis:', error);
    return [];
  }
}

/**
 * Obtiene las últimas N sesiones de análisis de un usuario
 */
export async function getRecentAnalysisSessions(userId: string, limitCount: number = 10): Promise<AnalysisGameSession[]> {
  try {
    const sessionsRef = collection(db, 'analysisGameSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AnalysisGameSession);
  } catch (error) {
    console.error('❌ Error obteniendo sesiones recientes de análisis:', error);
    return [];
  }
}

/**
 * Obtiene sesiones de análisis filtradas por juego específico
 */
export async function getAnalysisSessionsByGame(userId: string, gameId: string): Promise<AnalysisGameSession[]> {
  try {
    const sessionsRef = collection(db, 'analysisGameSessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('gameId', '==', gameId),
      orderBy('startTime', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AnalysisGameSession);
  } catch (error) {
    console.error('❌ Error obteniendo sesiones por juego:', error);
    return [];
  }
}

/**
 * Calcula estadísticas evolutivas de las sesiones de análisis
 */
export async function getAnalysisEvolutionStats(userId: string): Promise<{
  totalSessions: number;
  averageMaxSpan: number;
  averageCognitiveFluency: number;
  totalPersistence: number;
  averageErrorRate: number;
  progression: { date: string; maxSpan: number; fluency: number }[];
}> {
  try {
    const sessions = await getUserAnalysisSessions(userId);
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageMaxSpan: 0,
        averageCognitiveFluency: 0,
        totalPersistence: 0,
        averageErrorRate: 0,
        progression: []
      };
    }
    
    const totalSessions = sessions.length;
    const avgMaxSpan = sessions.reduce((sum, s) => sum + s.metrics.maxSpan, 0) / totalSessions;
    const avgFluency = sessions.reduce((sum, s) => sum + s.metrics.cognitiveFluency, 0) / totalSessions;
    const totalPersistence = sessions.reduce((sum, s) => sum + s.metrics.persistence, 0);
    const avgErrorRate = sessions.reduce((sum, s) => sum + s.metrics.errorRate, 0) / totalSessions;
    
    const progression = sessions.map(s => ({
      date: new Date(s.startTime).toLocaleDateString('es-ES'),
      maxSpan: s.metrics.maxSpan,
      fluency: Math.round(s.metrics.cognitiveFluency)
    })).reverse(); // Orden cronológico
    
    return {
      totalSessions,
      averageMaxSpan: avgMaxSpan,
      averageCognitiveFluency: avgFluency,
      totalPersistence,
      averageErrorRate: avgErrorRate,
      progression
    };
  } catch (error) {
    console.error('❌ Error calculando evolución:', error);
    return {
      totalSessions: 0,
      averageMaxSpan: 0,
      averageCognitiveFluency: 0,
      totalPersistence: 0,
      averageErrorRate: 0,
      progression: []
    };
  }
}

// ============================================================================
// FIRESTORE HELPERS - TIME METRICS
// ============================================================================

/**
 * Guarda métricas de tiempo de un usuario en Firebase
 */
export async function saveUserTimeMetrics(metrics: TimeMetrics): Promise<void> {
  try {
    const metricsRef = doc(db, 'userTimeMetrics', `${metrics.userId}_${metrics.sessionId}`);
    await setDoc(metricsRef, {
      ...metrics,
      timestamp: new Date().toISOString(),
      savedAt: Date.now()
    });
    console.log('✅ Métricas de tiempo guardadas en Firebase:', metrics.sessionId);
  } catch (error) {
    console.error('❌ Error guardando métricas de tiempo:', error);
    throw error;
  }
}

/**
 * Obtiene todas las métricas de tiempo de un usuario
 */
export async function getUserTimeMetrics(userId: string): Promise<TimeMetrics[]> {
  try {
    const metricsRef = collection(db, 'userTimeMetrics');
    const q = query(
      metricsRef, 
      where('userId', '==', userId),
      orderBy('startTime', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as TimeMetrics);
  } catch (error) {
    console.error('❌ Error obteniendo métricas de tiempo:', error);
    return [];
  }
}

/**
 * Obtiene las últimas N métricas de un usuario
 */
export async function getRecentUserTimeMetrics(userId: string, limitCount: number = 10): Promise<TimeMetrics[]> {
  try {
    const metricsRef = collection(db, 'userTimeMetrics');
    const q = query(
      metricsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as TimeMetrics);
  } catch (error) {
    console.error('❌ Error obteniendo métricas recientes:', error);
    return [];
  }
}

/**
 * Obtiene estadísticas agregadas de un usuario
 */
export async function getUserMetricsStats(userId: string): Promise<{
  totalSessions: number;
  totalTime: number;
  totalGames: number;
  gamesByType: Record<string, number>;
  averageSessionDuration: number;
}> {
  try {
    const metrics = await getUserTimeMetrics(userId);
    
    const totalSessions = metrics.length;
    const totalTime = metrics.reduce((sum, m) => sum + (m.totalDuration || 0), 0);
    const allGames = metrics.flatMap(m => m.games);
    const totalGames = allGames.length;
    
    const gamesByType: Record<string, number> = {};
    allGames.forEach(game => {
      gamesByType[game.gameName] = (gamesByType[game.gameName] || 0) + 1;
    });
    
    return {
      totalSessions,
      totalTime,
      totalGames,
      gamesByType,
      averageSessionDuration: totalSessions > 0 ? totalTime / totalSessions : 0
    };
  } catch (error) {
    console.error('❌ Error calculando estadísticas:', error);
    return {
      totalSessions: 0,
      totalTime: 0,
      totalGames: 0,
      gamesByType: {},
      averageSessionDuration: 0
    };
  }
}

/**
 * Exporta métricas de un usuario a formato JSON para Excel
 */
export async function exportUserMetricsToJSON(userId: string): Promise<any[]> {
  try {
    const metrics = await getUserTimeMetrics(userId);
    
    // Aplanar datos para Excel
    const exportData: any[] = [];
    
    metrics.forEach(session => {
      // Agregar fila de sesión
      exportData.push({
        Tipo: 'SESION',
        Usuario: session.userId,
        SessionID: session.sessionId,
        FechaInicio: new Date(session.startTime).toLocaleString('es-ES'),
        FechaFin: session.endTime ? new Date(session.endTime).toLocaleString('es-ES') : 'En curso',
        DuracionMinutos: session.totalDuration ? Math.round(session.totalDuration / 60000) : 0,
        TotalJuegos: session.games.length,
        Juego: '',
        Nivel: '',
        Score: '',
        Completado: ''
      });
      
      // Agregar filas de juegos
      session.games.forEach(game => {
        exportData.push({
          Tipo: 'JUEGO',
          Usuario: session.userId,
          SessionID: session.sessionId,
          FechaInicio: new Date(game.startTime).toLocaleString('es-ES'),
          FechaFin: game.endTime ? new Date(game.endTime).toLocaleString('es-ES') : 'En curso',
          DuracionMinutos: game.duration ? Math.round(game.duration / 60000) : 0,
          TotalJuegos: '',
          Juego: game.gameName,
          Nivel: game.level || '',
          Score: game.score || '',
          Completado: game.completed ? 'SÍ' : 'NO'
        });
      });
    });
    
    return exportData;
  } catch (error) {
    console.error('❌ Error exportando métricas:', error);
    return [];
  }
}

export default {
  app,
  db,
  geminiConfig,
  saveCognitiveSession,
  getUserSessions,
  saveCognitiveProfile,
  getCognitiveProfile,
  saveAnalysisGameSession,
  getUserAnalysisSessions,
  getRecentAnalysisSessions,
  getAnalysisSessionsByGame,
  getAnalysisEvolutionStats,
  saveUserTimeMetrics,
  getUserTimeMetrics,
  getRecentUserTimeMetrics,
  getUserMetricsStats,
  exportUserMetricsToJSON
};