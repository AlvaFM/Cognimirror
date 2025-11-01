//RubikGamePage.tsx - Cubo Rubik 3D con Three.js

import { ArrowLeft } from 'lucide-react';

interface RubikGamePageProps {
  onNavigate: (page: string) => void;
}

export const RubikGamePage = ({ onNavigate }: RubikGamePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-pink-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate('mirror-hub')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Volver a Espejos</span>
          </button>
          <h1 className="text-2xl font-bold">🧩 Strategy Mirror - Cubo Rubik 3D</h1>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Cubo 3D en iframe */}
      <div className="flex-1 relative">
        <iframe
          src="/RubiksCube-threejs-master/index.html"
          title="Cubo Rubik 3D"
          className="w-full h-full border-0"
          style={{ minHeight: 'calc(100vh - 80px)' }}
          allow="accelerometer; gyroscope"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Nota temporal */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 m-4 rounded">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Modo Demo:</strong> El cubo 3D está funcionando. La captura de métricas cognitivas se integrará en la próxima versión.
        </p>
      </div>
    </div>
  );
};
