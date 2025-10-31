// CoachAI.ts - Sistema de Coach IA con Firebase AI SDK oficial
import { geminiConfig, googleTTSConfig, fallbackVoiceConfig } from '../data/firebase';
import { CognitiveMetrics } from '../types';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../data/firebase';

// ============================================================================
// FIREBASE AI SDK SETUP
// ============================================================================

// Inicializar Firebase AI con el backend oficial
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });

// ============================================================================
// TEXT-TO-SPEECH
// ============================================================================

let voiceEnabled = true;
let currentAudio: HTMLAudioElement | null = null;
let userInteracted = false;

if (typeof window !== 'undefined') {
  window.addEventListener('click', () => { userInteracted = true; }, { once: true });
  window.addEventListener('keydown', () => { userInteracted = true; }, { once: true });
}

export function toggleVoice(enabled: boolean): void {
  voiceEnabled = enabled;
  if (!enabled && currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function isVoiceEnabled(): boolean {
  return voiceEnabled;
}

/**
 * Reproduce texto usando Google Cloud TTS o Web Speech API
 */
export async function speakText(text: string): Promise<void> {
  if (!voiceEnabled || !text || !userInteracted) return;

  const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  const googleSuccess = await tryGoogleTTS(cleanText);
  
  if (!googleSuccess) {
    fallbackSpeak(cleanText);
  }
}

async function tryGoogleTTS(text: string): Promise<boolean> {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const apiKey = googleTTSConfig.apiKey;
    if (!apiKey) return false;

    const request = {
      input: { text },
      voice: {
        languageCode: googleTTSConfig.voice.languageCode,
        name: googleTTSConfig.voice.name,
        ssmlGender: googleTTSConfig.voice.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: googleTTSConfig.audio.speakingRate,
        pitch: googleTTSConfig.audio.pitch,
        volumeGainDb: googleTTSConfig.audio.volumeGainDb,
      },
    };

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    
    if (data.audioContent) {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      currentAudio = audio;
      await audio.play();
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('⚠️ Error en Google TTS:', error);
    return false;
  }
}

function fallbackSpeak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = fallbackVoiceConfig.lang;
    utterance.rate = fallbackVoiceConfig.rate;
    utterance.pitch = fallbackVoiceConfig.pitch;
    utterance.volume = fallbackVoiceConfig.volume;
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('⚠️ Error en Web Speech API:', error);
  }
}

// ============================================================================
// COACH AI (FIREBASE AI SDK OFICIAL - SIN DUPLICACIÓN)
// ============================================================================

const systemPrompt = `Eres el Coach CogniTech, un compañero cercano y motivador para niños y adolescentes.

TONO: Cálido, personal y empático, como un amigo que entiende sus desafíos. Usa 1-2 emojis para conectar emocionalmente.

OBJETIVO: Crear una sensación de "estoy aquí contigo, te entiendo, y tengo la pista perfecta para ti".

FORMATO: 
- 2-3 oraciones máximo
- SIEMPRE menciona el nombre del usuario
- Si hay una pista matemática, hazla divertida y clara
- Termina con ánimo positivo

ESTILO: No uses frases genéricas. Sé específico con los datos que recibes.`;

interface CoachRequest {
  userName: string;
  userAge: number;
  mirrorType: string;
  metrics: CognitiveMetrics;
  context?: string;
  currentSequence?: number[]; // Para Memory Mirror: secuencia actual
  needsHint?: boolean; // Si el usuario pidió consejo explícitamente
  isFinalMessage?: boolean; // Si es el mensaje final de felicitación después de completar un espejo
  finalLevel?: number; // Nivel máximo alcanzado en el espejo
}

// Variable para prevenir múltiples llamadas simultáneas
let isProcessingCoach = false;

/**
 * Solicita un consejo personalizado al Coach AI usando Firebase AI SDK oficial
 * PREVIENE DUPLICACIÓN DE AUDIO
 */
export async function askCoach(request: CoachRequest, autoSpeak = false): Promise<string> {
  // Prevenir múltiples llamadas simultáneas
  if (isProcessingCoach) {
    console.warn('⚠️ Coach AI ya está procesando, ignorando llamada duplicada');
    return '';
  }

  isProcessingCoach = true;

  try {
    // Construir el prompt según el tipo de solicitud
    let userMsg = '';
    let prompt = '';
    
    if (request.needsHint && request.currentSequence && request.currentSequence.length > 0) {
      // PISTA MATEMÁTICA - Usar Gemini para hacerla más creativa
      const firstNumber = request.currentSequence[0] + 1;
      const mathHint = generateMathHint(firstNumber);
      
      userMsg = `Nombre: ${request.userName}. Edad: ${request.userAge} años.
Espejo: ${request.mirrorType}.
Métricas: Persistencia ${request.metrics.persistencia.toFixed(2)}, Eficiencia ${request.metrics.eficiencia.toFixed(2)}.
${request.context ? `Contexto: ${request.context}` : ''}

EL USUARIO PIDIÓ AYUDA. Dale una pista MUY ESPECÍFICA y MOTIVADORA:
- La secuencia empieza con el número que resulta de: ${mathHint}
- Usa un tono cercano y personal: "${request.userName}, ¡te tengo la pista perfecta! 🧠"
- Máximo 2 oraciones cortas.
- NO reveles el número directamente, solo el acertijo matemático.
- Añade un emoji y ánimo positivo.`;
    } else if (request.isFinalMessage) {
      // MENSAJE FINAL DE FELICITACIÓN - Usar Protocolo de Revelación Narrativa (P.I.N.)
      const personalityType = getPersonalityType(request.metrics);
      const finalMessage = `¡Felicitaciones, ${request.userName}! 🎉 Has alcanzado el nivel ${request.finalLevel} en el espejo ${request.mirrorType}. Tu tipo de personalidad según el modelo 16Personalities es ${personalityType}. ¡Sigue adelante y descubre más sobre ti mismo!`;
      
      userMsg = `Nombre: ${request.userName}. Edad: ${request.userAge} años.
Espejo: ${request.mirrorType}.
Métricas: Persistencia ${request.metrics.persistencia.toFixed(2)}, Eficiencia ${request.metrics.eficiencia.toFixed(2)}, Resiliencia ${request.metrics.resiliencia.toFixed(2)}, Adaptación ${request.metrics.adaptacion.toFixed(2)}.
${request.context ? `Contexto: ${request.context}` : ''}

Objetivo: Ofrece un mensaje de felicitación MUY PERSONALIZADO basado en las métricas y el tipo de personalidad. 2-3 oraciones máximo. Usa 1-2 emojis.`;
      
      prompt = `${systemPrompt}\n\n${userMsg}\n\n${finalMessage}`;
    } else {
      // MENSAJE MOTIVACIONAL - Usar Gemini para personalizar
      userMsg = `Nombre: ${request.userName}. Edad: ${request.userAge} años.
Espejo: ${request.mirrorType}.
Métricas: Persistencia ${request.metrics.persistencia.toFixed(2)}, Eficiencia ${request.metrics.eficiencia.toFixed(2)}, Resiliencia ${request.metrics.resiliencia.toFixed(2)}, Adaptación ${request.metrics.adaptacion.toFixed(2)}.
${request.context ? `Contexto: ${request.context}` : ''}

Objetivo: Ofrece un mensaje de ánimo MUY PERSONALIZADO basado en las métricas. 2-3 oraciones máximo. Usa 1-2 emojis.`;
    }

    console.log('🤖 Consultando Gemini AI (Firebase SDK)...');
    
    // Usar Firebase AI SDK oficial
    const result = await model.generateContent(prompt);
    const response = result.response;
    const tip = response.text();
    
    console.log('✅ Gemini respondió exitosamente:', tip.substring(0, 50) + '...');
    
    // Solo reproducir audio si se solicita explícitamente Y está habilitado
    if (autoSpeak && voiceEnabled && userInteracted) {
      await speakText(tip);
    }
    
    return tip.trim();
    
  } catch (error) {
    console.warn('⚠️ Error con Firebase AI SDK:', error);
    
    // FALLBACK LOCAL (solo si Gemini falla)
    const localTip = request.needsHint && request.currentSequence 
      ? generateLocalHint(request)
      : generateLocalMotivation(request);
    
    // Solo reproducir audio si se solicita explícitamente Y está habilitado
    if (autoSpeak && voiceEnabled && userInteracted) {
      await speakText(localTip);
    }
    
    return localTip;
  } finally {
    // Siempre liberar el bloqueo
    isProcessingCoach = false;
  }
}

// Genera pistas matemáticas para números del 1 al 9
function generateMathHint(number: number): string {
  const hints: { [key: number]: string[] } = {
    1: ['1 + 0', 'el primer número natural'],
    2: ['4 ÷ 2', '1 + 1'],
    3: ['9 ÷ 3', '6 ÷ 2'],
    4: ['16 ÷ 4', '2 + 2', '8 ÷ 2'],
    5: ['10 ÷ 2', '15 ÷ 3', '3 + 2'],
    6: ['12 ÷ 2', '18 ÷ 3', '3 + 3'],
    7: ['14 ÷ 2', '21 ÷ 3', '4 + 3'],
    8: ['16 ÷ 2', '24 ÷ 3', '4 + 4'],
    9: ['18 ÷ 2', '27 ÷ 3', '5 + 4']
  };
  
  const options = hints[number] || [`${number}`];
  return options[Math.floor(Math.random() * options.length)];
}

// Genera pista matemática localmente (SIN necesidad de API)
function generateLocalHint(request: CoachRequest): string {
  if (!request.currentSequence || request.currentSequence.length === 0) {
    return getFallbackTip(request.userName);
  }
  
  const firstNumber = request.currentSequence[0] + 1;
  const mathHint = generateMathHint(firstNumber);
  
  const templates = [
    `${request.userName}, ¡te tengo una pista perfecta! 🧠 El primer número es el resultado de: ${mathHint}. ¡Concéntrate y lo lograrás!`,
    `¡Escucha bien, ${request.userName}! 💡 La secuencia empieza con el número que sale de: ${mathHint}. ¡Tú puedes!`,
    `${request.userName}, aquí va tu pista especial: ✨ El primer bloque es ${mathHint}. ¡Confía en tu memoria!`,
    `¡Atención ${request.userName}! 🎯 Necesitas presionar el número que resulta de: ${mathHint}. ¡Vamos!`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Genera motivación local basada en métricas (SIN necesidad de API)
function generateLocalMotivation(request: CoachRequest): string {
  const { userName, metrics, context } = request;
  const { persistencia, eficiencia, resiliencia } = metrics;
  
  // Mensajes personalizados según métricas
  if (persistencia > 0.7) {
    return `¡Increíble, ${userName}! 💪 Tu persistencia es notable. Sigue así y alcanzarás niveles que ni imaginas. 🌟`;
  }
  
  if (eficiencia > 0.8) {
    return `${userName}, tu eficiencia es impresionante. 🎯 Cada movimiento cuenta, ¡y tú lo sabes! Sigue confiando en tu estrategia. ✨`;
  }
  
  if (resiliencia < 0.5) {
    return `${userName}, cada error es una oportunidad para crecer. 🌱 No te desanimes, tu cerebro está aprendiendo con cada intento. ¡Adelante!`;
  }
  
  // Mensaje genérico motivador
  const genericMessages = [
    `${userName}, sigue explorando. 🧠 Cada intento te acerca más a descubrir tu genialidad única. 🌟`,
    `¡Vas muy bien, ${userName}! 💡 Tu mente está en constante evolución. Confía en el proceso. ✨`,
    `${userName}, estás entrenando tu cerebro de forma asombrosa. 🎯 Cada sesión te hace más fuerte. ¡Sigue así!`,
    `¡Excelente trabajo, ${userName}! 🚀 Tu capacidad cognitiva está en pleno desarrollo. No pares ahora. 💪`
  ];
  
  return genericMessages[Math.floor(Math.random() * genericMessages.length)];
}

function getFallbackTip(userName: string): string {
  return `${userName}, sigue explorando. Cada intento te acerca más a descubrir tu genialidad única. 🌟`;
}

// Función de diagnóstico para probar Gemini API
export async function diagnoseGeminiAPI(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('🔍 DIAGNÓSTICO: Probando Gemini API...');
    
    // Test simple con modelo básico
    const testPrompt = `Di "Hola" en español.`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: testPrompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Diagnóstico fallido:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        details: { status: response.status, body: errorText }
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return {
        success: false,
        error: 'Gemini devolvió respuesta vacía',
        details: data
      };
    }

    console.log('✅ Diagnóstico exitoso:', content);
    return {
      success: true,
      details: { response: content }
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error
    };
  }
}

export default {
  askCoach,
  speakText,
  toggleVoice,
  isVoiceEnabled,
  diagnoseGeminiAPI,
};