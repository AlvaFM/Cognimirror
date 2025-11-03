// VoiceOnboardingWelcome.tsx - Componente unificado de Onboarding con modo vocal opcional

import { useState, useEffect, useRef } from 'react';
import { Mic, User, Calendar, CheckCircle, Play } from 'lucide-react';
import { VoiceRecognitionService, VoiceSynthesisService, intentFilters } from '../services/voiceRecognition';
import { useAuth } from '../context/AuthContext';

interface VoiceOnboardingWelcomeProps {
  onNavigate: (page: string) => void;
}

// Estados de la FSM para modo vocal
type DialogState = 
  | 'welcome'
  | 'askName'
  | 'confirmName'
  | 'askAge'
  | 'finalCheck'
  | 'completed';

export const VoiceOnboardingWelcome = ({ onNavigate }: VoiceOnboardingWelcomeProps) => {
  const { quickTry } = useAuth();
  
  // Modo de interacción
  const [mode, setMode] = useState<'selection' | 'vocal' | 'traditional'>('selection');
  
  // Estado FSM (solo para modo vocal)
  const [dialogPhase, setDialogPhase] = useState<DialogState>('welcome');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Datos del formulario (compartidos por ambos modos)
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState<number | ''>('');
  const [error, setError] = useState('');
  
  // Estado para captura de voz en campos individuales (modo tradicional)
  const [listeningField, setListeningField] = useState<'name' | 'age' | null>(null);
  
  // Historial (solo modo vocal)
  const [stateHistory, setStateHistory] = useState<string[]>([]);
  const historyEndRef = useRef<HTMLDivElement | null>(null);

  const voiceRecognitionRef = useRef<VoiceRecognitionService | null>(null);
  const voiceSynthesisRef = useRef<VoiceSynthesisService | null>(null);
  
  // Refs para valores inmediatos (sin esperar setState)
  const currentNameRef = useRef<string>('');
  const currentAgeRef = useRef<number>(0);

  useEffect(() => {
    voiceRecognitionRef.current = new VoiceRecognitionService();
    voiceSynthesisRef.current = new VoiceSynthesisService();

    return () => {
      voiceRecognitionRef.current?.stopListening();
      voiceSynthesisRef.current?.stop();
    };
  }, []);

  // ============= FUNCIONES MODO VOCAL =============

  const addToHistory = (message: string) => {
    setStateHistory(prev => [...prev, message]);
  };

  // Auto-scroll al final del historial cuando se agrega contenido
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [stateHistory]);

  const speak = (text: string, onEnd?: () => void) => {
    setIsSpeaking(true);
    addToHistory(`🤖 Coach: ${text}`);
    voiceSynthesisRef.current?.speak(text, {
      onEnd: () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      }
    });
  };

  const startListeningForState = (expectedState: DialogState) => {
    console.log(`🎤 Iniciando escucha para estado: ${expectedState}`);
    setIsListening(true);
    voiceRecognitionRef.current?.startListening(
      (text) => {
        console.log('📥 Texto recibido:', text);
        addToHistory(`👤 Usuario: ${text}`);
        setIsListening(false);
        // Pasar el estado esperado directamente
        handleVoiceInput(text, expectedState);
      },
      (error) => {
        console.error('❌ Error de reconocimiento:', error);
        setIsListening(false);
        
        // Solo reintentar en errores recuperables
        if (error === 'no-speech') {
          speak('No escuché nada. Por favor, intenta de nuevo.', () => {
            setTimeout(() => startListeningForState(expectedState), 500);
          });
        } else {
          speak('Hubo un error al escucharte. Por favor, intenta de nuevo.', () => {
            setTimeout(() => startListeningForState(expectedState), 500);
          });
        }
      },
      () => {
        console.log('🔊 Reconocimiento terminado');
        setIsListening(false);
      },
      false  // NO usar autoRestart
    );
  };

  const transitionToState = (newState: DialogState) => {
    console.log(`🔄 Transicionando de ${dialogPhase} a ${newState}`);
    setDialogPhase(newState);
    addToHistory(`📍 Estado: ${getStateLabel(newState)}`);

    switch (newState) {
      case 'welcome':
        speak('¡Hola! Bienvenido a CogniMirror. ¿Deseas probar la aplicación ahora mismo? Responde "sí deseo" o "no gracias".', () => {
          startListeningForState('welcome');
        });
        break;

      case 'askName':
        speak('Perfecto. Para crear tu perfil cognitivo, necesito que me digas tu nombre completo. Por ejemplo: "Mi nombre es Juan Pérez".', () => {
          startListeningForState('askName');
        });
        break;

      case 'confirmName':
        // Usar el ref para obtener el valor inmediato
        speak(`Entendido. Tu nombre es ${currentNameRef.current}. ¿Es correcto? Responde "sí es correcto" o "no, mi nombre es otro".`, () => {
          startListeningForState('confirmName');
        });
        break;

      case 'askAge':
        speak('Ahora dime, ¿cuál es tu edad? Por ejemplo: "Tengo 12 años".', () => {
          startListeningForState('askAge');
        });
        break;

      case 'finalCheck':
        // Usar los refs para obtener los valores inmediatos
        speak(`Perfecto. Entonces tu nombre es ${currentNameRef.current} y tienes ${currentAgeRef.current} años. ¿Todo está correcto? Responde "sí, todo correcto" o "no, quiero corregir".`, () => {
          startListeningForState('finalCheck');
        });
        break;

      case 'completed':
        speak('¡Perfecto! Bienvenido a CogniMirror. Vamos a tu perfil.', () => {
          setTimeout(() => {
            // Usar directamente userName y userAge que ya están guardados
            handleLogin();
          }, 1000);
        });
        break;
    }
  };

  const handleVoiceInput = (transcript: string, currentState: DialogState) => {
    console.log('=== VOZ CAPTURADA ===' );
    console.log('Texto original:', transcript);
    console.log('Texto normalizado:', intentFilters.normalizeText(transcript));
    console.log('Es afirmativo?', intentFilters.isAffirmative(transcript));
    console.log('Es negativo?', intentFilters.isNegative(transcript));
    console.log('Estado esperado:', currentState);
    console.log('Estado en React:', dialogPhase);
    console.log('=====================');
    
    switch (currentState) {
      case 'welcome':
        if (intentFilters.isAffirmative(transcript)) {
          addToHistory('✅ Respuesta afirmativa detectada');
          transitionToState('askName');
        } else if (intentFilters.isNegative(transcript)) {
          addToHistory('❌ Respuesta negativa detectada');
          speak('De acuerdo. Puedes volver cuando quieras.', () => {
            setTimeout(() => onNavigate('home'), 2000);
          });
        } else {
          addToHistory('⚠️ No se detectó respuesta clara');
          speak('No entendí tu respuesta. Por favor, responde "sí deseo" si quieres continuar, o "no gracias" si prefieres salir.', () => {
            startListeningForState('welcome');
          });
        }
        break;

      case 'askName':
        const extractedName = intentFilters.extractName(transcript);
        console.log('Nombre extraído:', extractedName);
        
        if (extractedName && extractedName.length > 2) {
          setUserName(extractedName);
          currentNameRef.current = extractedName; // Guardar inmediatamente en ref
          addToHistory(`📝 Nombre capturado: ${extractedName}`);
          setTimeout(() => {
            transitionToState('confirmName');
          }, 100);
        } else {
          addToHistory('⚠️ Nombre no capturado correctamente');
          speak('No pude capturar tu nombre correctamente. Por favor, dime tu nombre completo de nuevo. Por ejemplo: "Mi nombre es María García".', () => {
            startListeningForState('askName');
          });
        }
        break;

      case 'confirmName':
        if (intentFilters.isAffirmative(transcript)) {
          addToHistory('✅ Nombre confirmado');
          transitionToState('askAge');
        } else if (intentFilters.isNegative(transcript)) {
          setUserName('');
          addToHistory('🔄 Volviendo a preguntar el nombre...');
          speak('De acuerdo. Dime tu nombre correcto. Por ejemplo: "Mi nombre es Carlos Ruiz".', () => {
            setTimeout(() => {
              transitionToState('askName');
            }, 100);
          });
        } else {
          addToHistory('⚠️ Confirmación no clara');
          speak('No entendí tu respuesta. ¿Tu nombre es correcto? Responde "sí es correcto" o "no, mi nombre es otro".', () => {
            startListeningForState('confirmName');
          });
        }
        break;

      case 'askAge':
        const extractedAge = intentFilters.extractAge(transcript);
        console.log('Edad extraída:', extractedAge);
        
        if (extractedAge !== null) {
          setUserAge(extractedAge);
          currentAgeRef.current = extractedAge; // Guardar inmediatamente en ref
          addToHistory(`🎂 Edad capturada: ${extractedAge} años`);
          setTimeout(() => {
            transitionToState('finalCheck');
          }, 100);
        } else {
          addToHistory('⚠️ Edad no capturada correctamente');
          speak('No pude capturar tu edad. Por favor, dime tu edad de nuevo. Por ejemplo: "Tengo 10 años".', () => {
            startListeningForState('askAge');
          });
        }
        break;

      case 'finalCheck':
        if (intentFilters.isAffirmative(transcript)) {
          addToHistory('✅ Datos confirmados - Iniciando sesión');
          // Si dice que sí, continuar con los datos que ya están guardados
          transitionToState('completed');
        } else if (intentFilters.isNegative(transcript)) {
          // Solo si dice que no, reiniciar
          setUserName('');
          setUserAge('');
          addToHistory('🔄 Reiniciando proceso...');
          speak('De acuerdo. Volvamos a empezar desde el principio.', () => {
            setTimeout(() => {
              transitionToState('askName');
            }, 100);
          });
        } else {
          addToHistory('⚠️ Confirmación final no clara');
          speak('No entendí tu respuesta. ¿Todos los datos están correctos? Responde "sí, todo correcto" o "no, quiero corregir".', () => {
            startListeningForState('finalCheck');
          });
        }
        break;

      case 'completed':
        break;
    }
  };

  const getStateLabel = (state: DialogState): string => {
    const labels: Record<DialogState, string> = {
      'welcome': 'Bienvenida',
      'askName': 'Capturando Nombre',
      'confirmName': 'Confirmando Nombre',
      'askAge': 'Capturando Edad',
      'finalCheck': 'Verificación Final',
      'completed': 'Completado'
    };
    return labels[state];
  };

  const startVocalMode = () => {
    setMode('vocal');
    setStateHistory(['🎬 Iniciando modo vocal...']);
    setTimeout(() => {
      transitionToState('welcome');
    }, 300);
  };

  // ============= FUNCIONES MODO TRADICIONAL =============

  const startListeningForField = (field: 'name' | 'age') => {
    setListeningField(field);
    voiceRecognitionRef.current?.startListening(
      (text) => {
        console.log(`🎤 Voz capturada para campo ${field}:`, text);
        
        if (field === 'name') {
          const extractedName = intentFilters.extractName(text);
          if (extractedName && extractedName.length > 2) {
            setUserName(extractedName);
          } else {
            setUserName(text.trim());
          }
        } else if (field === 'age') {
          const extractedAge = intentFilters.extractAge(text);
          if (extractedAge !== null) {
            setUserAge(extractedAge);
          }
        }
        
        setListeningField(null);
      },
      (error) => {
        console.error('❌ Error al capturar voz:', error);
        setListeningField(null);
      },
      () => {
        setListeningField(null);
      },
      false
    );
  };

  const handleTraditionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ageNumber = typeof userAge === 'string' ? parseInt(userAge || '0', 10) : userAge;

    if (!userName.trim() || !ageNumber || ageNumber < 1 || ageNumber > 120) {
      setError('Ingresa un nombre y una edad válida (1 a 120 años).');
      return;
    }

    handleLogin();
  };

  const handleLogin = () => {
    console.log('=== HANDLE LOGIN ===');
    console.log('userName:', userName);
    console.log('userAge:', userAge);
    console.log('currentNameRef:', currentNameRef.current);
    console.log('currentAgeRef:', currentAgeRef.current);
    
    // Usar refs si están disponibles, sino usar estados
    const finalName = currentNameRef.current || userName;
    const finalAge = currentAgeRef.current || (typeof userAge === 'string' ? parseInt(userAge, 10) : userAge);
    
    if (!finalName || !finalName.trim()) {
      console.error('❌ Error: nombre está vacío');
      addToHistory('❌ Error: No se pudo guardar el nombre');
      return;
    }
    
    if (!finalAge || finalAge <= 0) {
      console.error('❌ Error: edad inválida');
      addToHistory('❌ Error: No se pudo guardar la edad');
      return;
    }
    
    console.log('✅ Guardando usuario:', finalName.trim(), finalAge);
    addToHistory(`✅ Guardado: ${finalName.trim()}, ${finalAge} años`);
    quickTry(finalName.trim(), finalAge);
    onNavigate('patient-profile');
  };


  // ============= RENDERIZADO =============

  if (mode === 'selection') {
    // Pantalla de selección de modo
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">CM</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Bienvenido a CogniMirror</h1>
            <p className="text-xl text-gray-600">¿Cómo prefieres navegar por la aplicación?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Modo Vocal */}
            <button
              onClick={startVocalMode}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center relative group-hover:scale-110 transition-transform">
                  <Mic className="w-12 h-12 text-white" />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Iniciar V-Onboarding</h2>
                <p className="text-gray-600 text-center font-medium">Usar Voz (Click para empezar)</p>
                <p className="text-sm text-gray-500 text-center">Navega usando comandos de voz</p>
                <div className="mt-2 px-4 py-2 bg-purple-100 rounded-full">
                  <span className="text-purple-700 font-semibold text-sm">🎤 Modo Vocal</span>
                </div>
              </div>
            </button>

            {/* Modo Tradicional */}
            <button
              onClick={() => setMode('traditional')}
              className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Modo Tradicional</h2>
                <p className="text-gray-600 text-center font-medium">Teclado y Ratón</p>
                <p className="text-sm text-gray-500 text-center">Navega de forma convencional</p>
                <div className="mt-2 px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-gray-700 font-semibold text-sm">⌨️ Modo Clásico</span>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'vocal') {
    // Modo Vocal con FSM
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Tela flotante de feedback */}
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 ${
          isListening 
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse scale-110' 
            : 'bg-gray-600'
        }`}>
          <div className="flex items-center gap-3">
            <Mic className={`w-5 h-5 text-white ${isListening ? 'animate-bounce' : ''}`} />
            <span className="font-bold text-white text-sm">
              {isListening ? '🎤 ESCUCHANDO...' : 'MODO VOCAL ACTIVO'}
            </span>
            {isListening && (
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-white rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-white rounded-full animate-pulse delay-75"></div>
                <div className="w-1 h-4 bg-white rounded-full animate-pulse delay-150"></div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">Voice Onboarding</h1>
              <p className="text-xl text-purple-200">Navegación por Diálogo Vocal</p>
            </div>

            {/* Panel de datos */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-6 h-6 text-purple-300" />
                  <h3 className="text-lg font-semibold text-white">Nombre</h3>
                </div>
                <p className="text-2xl font-bold text-white">{userName || '---'}</p>
                {userName && <CheckCircle className="w-5 h-5 text-green-400 mt-2" />}
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-6 h-6 text-purple-300" />
                  <h3 className="text-lg font-semibold text-white">Edad</h3>
                </div>
                <p className="text-2xl font-bold text-white">{userAge ? `${userAge} años` : '---'}</p>
                {userAge && <CheckCircle className="w-5 h-5 text-green-400 mt-2" />}
              </div>
            </div>

            {/* Historial */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-h-64 overflow-y-auto mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Historial</h3>
              <div className="space-y-2">
                {stateHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg ${
                      message.startsWith('🤖') 
                        ? 'bg-blue-500/20 text-blue-100' 
                        : message.startsWith('👤')
                        ? 'bg-purple-500/20 text-purple-100'
                        : 'bg-gray-500/20 text-gray-100'
                    }`}
                  >
                    {message}
                  </div>
                ))}
                {/* Elemento invisible para auto-scroll */}
                <div ref={historyEndRef} />
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  voiceRecognitionRef.current?.stopListening();
                  voiceSynthesisRef.current?.stop();
                  setMode('selection');
                  setUserName('');
                  setUserAge('');
                  setStateHistory([]);
                }}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
              >
                Cambiar de Modo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo Tradicional (formulario normal)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Pruébalo Ahora</h2>
            <p className="text-gray-600">Ingresa un nombre y edad para explorar el perfil</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">{error}</div>
          )}

          <form onSubmit={handleTraditionalSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <div className="relative">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej: Sofía Ramirez"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => startListeningForField('name')}
                  disabled={listeningField !== null}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    listeningField === 'name'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Dictar nombre"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Edad</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ingresa tu edad"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => startListeningForField('age')}
                  disabled={listeningField !== null}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    listeningField === 'age'
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Dictar edad"
                >
                  <Mic className="w-4 h-4" />
                </button>
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
              onClick={() => setMode('selection')}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cambiar de Modo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
