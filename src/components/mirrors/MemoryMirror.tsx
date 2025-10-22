// MemoryMirror.tsx - El Detective de Patrones (Test de Corsi)
import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Award, Brain, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { MirrorRecorder } from '../../data/MirrorRecorder';
import { saveCognitiveSession } from '../../data/firebase';
import { askCoach, speakText, toggleVoice } from '../../services/CoachAI';

interface MemoryMirrorProps {
  userId: string;
  userName: string;
  onBack: () => void;
}

export const MemoryMirror = ({ userId, userName, onBack }: MemoryMirrorProps) => {
  const [recorder] = useState(() => new MirrorRecorder('memory_mirror_v1', userId));
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'waiting' | 'gameover'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [lives, setLives] = useState(3);
  const [maxLevel, setMaxLevel] = useState(3);
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [coachTip, setCoachTip] = useState<string>('Cargando consejo...');
  const [showCoachPanel, setShowCoachPanel] = useState(true); // Siempre visible
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const blocks = Array.from({ length: 9 }, (_, i) => i);

  // Cargar mensaje de bienvenida del Coach al inicio
  useEffect(() => {
    const loadWelcomeMessage = async () => {
      try {
        // askCoach maneja el audio automáticamente, no necesitamos speakText manual
        const tip = await askCoach({
          userName,
          userAge: 12,
          mirrorType: 'Memory Mirror',
          metrics: {
            persistencia: 0.5,
            eficiencia: 0.5,
            resiliencia: 0.5,
            adaptacion: 0.5
          },
          context: 'Está a punto de comenzar su primera sesión en Memory Mirror'
        }, audioEnabled); // autoSpeak habilitado si audio está activo
        
        setCoachTip(tip);
      } catch (error) {
        console.error('Error cargando Coach:', error);
        setCoachTip('¡Bienvenido! Prepara tu mente para el desafío.');
      }
    };
    loadWelcomeMessage();
  }, [userName, audioEnabled]);

  const startGame = () => {
    recorder.start();
    setGameState('showing');
    setCurrentLevel(3);
    setLives(3);
    setMaxLevel(3);
    setUserSequence([]);
    generateSequence(3);
  };

  const generateSequence = (length: number) => {
    const newSeq: number[] = [];
    for (let i = 0; i < length; i++) {
      newSeq.push(Math.floor(Math.random() * 9));
    }
    setSequence(newSeq);
    recorder.recordEvent({
      type: 'sequence_start',
      value: { sequence: newSeq, level: length }
    });
    showSequence(newSeq);
  };

  const showSequence = async (seq: number[]) => {
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveBlock(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveBlock(null);
    }
    setGameState('waiting');
  };

  const handleBlockClick = (blockId: number) => {
    if (gameState !== 'waiting') return;

    const newUserSeq = [...userSequence, blockId];
    setUserSequence(newUserSeq);

    // Flash visual
    setActiveBlock(blockId);
    setTimeout(() => setActiveBlock(null), 200);

    const isCorrect = sequence[newUserSeq.length - 1] === blockId;

    recorder.recordEvent({
      type: 'user_input',
      value: { blockId, position: newUserSeq.length - 1 },
      isCorrect
    });

    if (!isCorrect) {
      // Error
      handleMistake();
      return;
    }

    if (newUserSeq.length === sequence.length) {
      // Secuencia completa correcta
      handleLevelComplete();
    }
  };

  const handleMistake = () => {
    const newLives = lives - 1;
    setLives(newLives);
    setUserSequence([]);

    recorder.recordEvent({
      type: 'mistake',
      value: { livesRemaining: newLives }
    });

    if (newLives === 0) {
      endGame();
    } else {
      setTimeout(() => {
        setGameState('showing');
        generateSequence(currentLevel);
      }, 1000);
    }
  };

  const handleLevelComplete = () => {
    const newLevel = currentLevel + 1;
    setCurrentLevel(newLevel);
    setMaxLevel(Math.max(maxLevel, newLevel));
    setUserSequence([]);

    recorder.recordEvent({
      type: 'level_up',
      value: { newLevel, sequenceLength: newLevel }
    });

    setTimeout(() => {
      setGameState('showing');
      generateSequence(newLevel);
    }, 1000);
  };

  const endGame = async () => {
    setGameState('gameover');
    
    const session = recorder.end('completed', maxLevel, {
      livesUsed: 3 - lives,
      finalLevel: currentLevel
    });

    try {
      await saveCognitiveSession(session);
      console.log('✅ Sesión de Memory Mirror guardada');
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }

    setShowCoachPanel(true);
    // ACTIVAR PROTOCOLO DE REVELACIÓN NARRATIVA (P.I.N.) para mensaje final
    const tip = await askCoach({
      userName,
      userAge: 12,
      mirrorType: 'Memory Mirror',
      metrics: {
        persistencia: maxLevel / 10,
        eficiencia: maxLevel / 10,
        resiliencia: (3 - lives + 3) / 6,
        adaptacion: 0.7
      },
      context: `Alcanzó nivel ${maxLevel} con ${lives} vidas restantes`,
      isFinalMessage: true, // ACTIVAR protocolo P.I.N.
      finalLevel: maxLevel // Nivel máximo alcanzado
    }, audioEnabled); // autoSpeak habilitado si audio está activo
    setCoachTip(tip);
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    toggleVoice(newState);
    
    // SIEMPRE cancelar audio al silenciar, no solo si isSpeaking
    if (!newState) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const requestNewAdvice = async () => {
    setCoachTip('Pensándolo... 🧠');
    try {
      // askCoach maneja el audio automáticamente con autoSpeak
      const tip = await askCoach({
        userName,
        userAge: 12,
        mirrorType: 'Memory Mirror',
        metrics: {
          persistencia: maxLevel / 10,
          eficiencia: maxLevel / 10,
          resiliencia: (3 - lives + 3) / 6,
          adaptacion: 0.7
        },
        context: `Nivel ${currentLevel}, Vidas: ${lives}, Mejor: ${maxLevel}`,
        currentSequence: sequence, // Pasamos la secuencia actual
        needsHint: true // Activamos modo pista matemática
      }, audioEnabled); // autoSpeak habilitado si audio está activo
      
      setCoachTip(tip);
    } catch (error) {
      console.error('Error pidiendo consejo:', error);
      setCoachTip('¡Sigue así! Estás haciendo un gran trabajo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Brain className="w-8 h-8 text-cyan-600" />
              <h1 className="text-3xl font-bold text-gray-900">Memory Mirror</h1>
            </div>
            <p className="text-gray-600">El Detective de Patrones</p>
          </div>

          <div className="w-24"></div>
        </div>

        {/* Layout Principal: Stats | Game | Coach */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Stats Sidebar - Izquierda */}
          <div className="w-full lg:w-56 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Nivel</span>
                <Award className="w-5 h-5 text-cyan-600" />
              </div>
              <p className="text-4xl font-bold text-cyan-600">{currentLevel}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Vidas</span>
              </div>
              <div className="flex space-x-2 mb-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${
                      i < lives ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-4xl font-bold text-red-500">{lives}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-semibold">Mejor</span>
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-4xl font-bold text-yellow-600">{maxLevel}</p>
            </div>
          </div>

          {/* Game Board - Centro */}
          <div className="flex-1 bg-white rounded-2xl shadow-2xl p-8 min-h-[500px] flex items-center justify-center">
            {gameState === 'idle' && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🧠⚡</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ¡Hola, {userName}!
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  Voy a mostrarte una secuencia de bloques iluminados. 
                  Tu misión es repetirla en el mismo orden. 
                  ¡Cada nivel es más largo!
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
                >
                  <Play className="w-6 h-6" />
                  <span>Comenzar</span>
                </button>
              </div>
            )}

            {(gameState === 'showing' || gameState === 'waiting') && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-lg font-semibold text-gray-700">
                    {gameState === 'showing' ? '👀 Observa la secuencia...' : '🎯 ¡Tu turno! Repite el patrón'}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {blocks.map((blockId) => (
                    <button
                      key={blockId}
                      onClick={() => handleBlockClick(blockId)}
                      disabled={gameState !== 'waiting'}
                      className={`aspect-square rounded-2xl transition-all transform ${
                        activeBlock === blockId
                          ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 scale-110 shadow-2xl'
                          : 'bg-gray-200 hover:bg-gray-300'
                      } ${gameState === 'waiting' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <span className="text-2xl font-bold text-gray-700">{blockId + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-gray-900">
                  ¡Increíble, {userName}!
                </h2>
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6">
                  <p className="text-lg text-gray-700 mb-2">Máximo nivel alcanzado:</p>
                  <p className="text-5xl font-bold text-cyan-600">{maxLevel}</p>
                </div>
                <p className="text-gray-600 max-w-md mx-auto">
                  Tu memoria de trabajo es asombrosa. Has completado secuencias de hasta {maxLevel} elementos.
                  ¡Sigue entrenando tu cerebro!
                </p>
                {coachTip && (
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-purple-900">Consejo del Coach IA:</h4>
                    </div>
                    <p className="text-gray-700">{coachTip}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={async () => {
                      setCoachTip('Analizando tu desempeño...');
                      setShowCoachPanel(true);
                      // askCoach maneja el audio automáticamente con autoSpeak
                      const tip = await askCoach({
                        userName,
                        userAge: 12,
                        mirrorType: 'Memory Mirror',
                        metrics: {
                          persistencia: maxLevel / 10,
                          eficiencia: maxLevel / 10,
                          resiliencia: (3 - lives + 3) / 6,
                          adaptacion: 0.7
                        },
                        context: `Alcanzó nivel ${maxLevel} con ${lives} vidas restantes`
                      }, audioEnabled); // autoSpeak habilitado si audio está activo
                      setCoachTip(tip);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Pedir Consejo al Coach IA</span>
                  </button>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Jugar de Nuevo
                  </button>
                  <button
                    onClick={onBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Ver Otros Espejos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Coach Sidebar - Derecha */}
          <div className="w-full lg:w-80 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-7 h-7 text-yellow-300 animate-pulse" />
                <h3 className="text-white font-bold text-xl">Coach IA</h3>
              </div>
              <button
                onClick={toggleAudio}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                title={audioEnabled ? 'Silenciar' : 'Activar audio'}
              >
                {audioEnabled ? (
                  <Volume2 className="w-5 h-5 text-white" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 min-h-[120px]">
              <p className="text-white text-sm leading-relaxed">{coachTip}</p>
            </div>

            <div className="flex items-center space-x-2 text-white/80 text-xs mb-4">
              <div className={`w-2 h-2 rounded-full ${
                isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span>{isSpeaking ? 'Reproduciendo...' : 'Listo'}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (coachTip && coachTip !== 'Cargando consejo...' && coachTip !== 'Analizando tu desempeño...') {
                    // Usar askCoach para obtener una nueva respuesta y reproducirla
                    const tip = await askCoach({
                      userName,
                      userAge: 12,
                      mirrorType: 'Memory Mirror',
                      metrics: {
                        persistencia: maxLevel / 10,
                        eficiencia: maxLevel / 10,
                        resiliencia: (3 - lives + 3) / 6,
                        adaptacion: 0.7
                      },
                      context: `Nivel ${currentLevel}, Vidas: ${lives}, Mejor: ${maxLevel}`
                    }, true); // Siempre reproducir audio
                    setCoachTip(tip);
                  }
                }}
                disabled={!audioEnabled || isSpeaking || !coachTip || coachTip === 'Cargando consejo...'}
                className="w-full py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'Reproduciendo...' : 'Escuchar Consejo'}</span>
              </button>

              {gameState !== 'idle' && (
                <button
                  onClick={requestNewAdvice}
                  disabled={coachTip === 'Analizando tu desempeño...'}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600 disabled:cursor-not-allowed rounded-lg text-gray-900 font-bold transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Pedir Consejo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};