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
  getDocs 
} from 'firebase/firestore';
import { CognitiveSession, CognitiveProfile } from '../types';

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

export default {
  app,
  db,
  geminiConfig,
  saveCognitiveSession,
  getUserSessions,
  saveCognitiveProfile,
  getCognitiveProfile
};