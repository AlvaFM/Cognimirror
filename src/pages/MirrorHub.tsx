// MirrorHub.tsx - Selector de Espejos Cognitivos (Modelo Waze)
import { Brain, Sparkles, Lock, Zap, ArrowLeft } from 'lucide-react';
import { MIRROR_CATALOG, MirrorType } from '../types';
import { CoachDialog, useCoachDialog } from '../components/common/CoachDialog';
import { geminiConfig } from '../data/firebase';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../data/firebase';

interface MirrorHubProps {
  onNavigate: (page: string) => void;
  userName: string;
}

export const MirrorHub = ({ onNavigate, userName }: MirrorHubProps) => {
  const { dialogType, closeDialog } = useCoachDialog();
  
  const getMirrorStatus = (mirrorId: MirrorType): 'recommended' | 'advanced' | 'locked' => {
    if (mirrorId === 'memory_mirror_v1') return 'recommended';
    if (mirrorId === 'strategy_mirror_v1') return 'advanced';
    return 'locked';
  };

  const handleMirrorClick = (mirrorType: MirrorType) => {
    const status = getMirrorStatus(mirrorType);
    
    if (status === 'locked') {
      // Próximamente
      return;
    }
    
    if (mirrorType === 'memory_mirror_v1') {
      onNavigate('memory-mirror');
    } else if (mirrorType === 'strategy_mirror_v1') {
      onNavigate('rubik-game');
    } else if (mirrorType === 'spatial_mirror_v1') {
      alert('Este espejo estará disponible pronto 🔮');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          {/* Botón Volver */}
          <button
            onClick={() => onNavigate('patient-profile')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </button>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Brain className="w-16 h-16" />
              <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              ¡Hola, {userName}!
            </h1>
            <p className="text-2xl md:text-3xl font-light">
              Bienvenido a tu espacio de <span className="font-bold text-yellow-300">autodescubrimiento cognitivo</span>
            </p>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Cada espejo revela una faceta única de tu mente. No estamos aquí para evaluarte, sino para mostrarte tu genialidad única.
            </p>
          </div>
        </div>
      </div>

      {/* Espejos Grid */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {Object.values(MIRROR_CATALOG).map((mirror) => {
            const status = getMirrorStatus(mirror.id);
            
            return (
              <div
                key={mirror.id}
                onClick={() => handleMirrorClick(mirror.id)}
                className={`
                  relative rounded-2xl p-8 shadow-2xl transition-all duration-300
                  ${
                    status === 'recommended'
                      ? 'bg-gradient-to-br ' + mirror.gradient + ' cursor-pointer transform hover:scale-110 ring-4 ring-yellow-400 ring-offset-4 ring-offset-gray-900 animate-pulse'
                      : status === 'advanced'
                      ? 'bg-gradient-to-br ' + mirror.gradient + ' opacity-70 cursor-pointer hover:opacity-90 transform hover:scale-105'
                      : 'bg-gradient-to-br ' + mirror.gradient + ' opacity-40 cursor-not-allowed'
                  }
                `}
              >
                {/* Badge de Estado */}
                {status === 'recommended' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                    <Zap className="w-3 h-3" />
                    <span>RECOMENDADO PARA EMPEZAR</span>
                  </div>
                )}
                {status === 'advanced' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    DESAFÍO EXPERTO
                  </div>
                )}
                {status === 'locked' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
                    <div className="text-center text-white">
                      <Lock className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-lg font-bold">PRÓXIMAMENTE</p>
                    </div>
                  </div>
                )}

                {/* Contenido del Espejo */}
                <div className="text-6xl mb-4 text-center">{mirror.icon}</div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">
                  {mirror.displayName}
                </h3>
                <p className="text-white text-center opacity-90 mb-4 text-sm">
                  {mirror.description}
                </p>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-xs text-white space-y-1">
                  <p>📊 {mirror.scientificBasis}</p>
                  <p>⏱️ ~{mirror.estimatedDuration} min</p>
                  <p>🎯 Dificultad: {mirror.difficulty === 'easy' ? 'Fácil' : mirror.difficulty === 'medium' ? 'Media' : 'Alta'}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mensaje de Guía */}
        <div className="mt-12 max-w-2xl mx-auto bg-gradient-to-r from-cyan-900 to-blue-900 rounded-xl p-6 text-white text-center shadow-xl">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Brain className="w-6 h-6 text-cyan-300" />
            <h3 className="text-xl font-bold">💡 Consejo del Coach</h3>
          </div>
          <p className="text-cyan-100">
            Te recomendamos empezar con el <span className="font-bold text-yellow-300">Memory Mirror</span> para
            calibrar tu perfil cognitivo. Pero recuerda: <span className="italic">tienes libertad total para explorar</span>.
          </p>
        </div>
      </div>

      {/* Coach Dialog */}
      <CoachDialog
        userName={userName}
        onClose={closeDialog}
        onNavigate={onNavigate}
        type={dialogType}
      />

      {/* Sección de Diagnóstico - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-xs space-y-2 max-w-xs">
          <div className="font-bold text-yellow-400"> DIAGNÓSTICO API</div>
          <button
            onClick={async () => {
              try {
                // Probar conexión simple con Gemini usando Firebase AI SDK
                const ai = getAI(app, { backend: new GoogleAIBackend() });
                const model = getGenerativeModel(ai, { model: 'gemini-1.5-flash' });
                
                const result = await model.generateContent('Di "Hola" en español.');
                const response = result.response;
                const text = response.text();
                
                console.log('✅ Gemini AI SDK funciona:', text);
                alert(`API Gemini: ✅ FUNCIONA\n\nRespuesta: ${text}`);
              } catch (error) {
                console.error('❌ Error con Gemini AI SDK:', error);
                alert(`API Gemini: ❌ FALLA\n\nError: ${error.message}`);
              }
            }}
            className="w-full px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium"
          >
            Probar API Gemini
          </button>
          <div className="text-gray-400 text-xs">
            API Key actual: {geminiConfig.apiKey.substring(0, 20)}...
          </div>
        </div>
      )}
    </div>
  );
};