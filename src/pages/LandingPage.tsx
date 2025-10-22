//LandingPage.tsx

import { Brain, Target, Users, Award, ArrowRight, Gamepad2, LineChart, Heart } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Recupera tu{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Soberanía Cognitiva</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              <span className="font-bold text-purple-600">CogniMirror</span> no es una app de juegos.
              Es un espejo que revela los patrones únicos de tu mente. Descubre tu genialidad a través de
              experiencias gamificadas con base científica.
            </p>
            <p className="text-sm text-gray-500 italic">
              “El sistema mide mentes circulares con reglas de madera. Nosotros te damos el espejo correcto.”
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => onNavigate('register')}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Crear Usuario</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform">
                  <Gamepad2 className="w-10 h-10 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-gray-800">Juegos</h3>
                  <p className="text-sm text-gray-600">Interactivos</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform">
                  <LineChart className="w-10 h-10 text-green-600 mb-2" />
                  <h3 className="font-semibold text-gray-800">Progreso</h3>
                  <p className="text-sm text-gray-600">En tiempo real</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform">
                  <Award className="w-10 h-10 text-yellow-600 mb-2" />
                  <h3 className="font-semibold text-gray-800">Logros</h3>
                  <p className="text-sm text-gray-600">Motivadores</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-transform">
                  <Heart className="w-10 h-10 text-red-600 mb-2" />
                  <h3 className="font-semibold text-gray-800">Apoyo</h3>
                  <p className="text-sm text-gray-600">Personalizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Quiénes Somos
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Cogntech es una plataforma educativa con propósito social, dedicada a mejorar
              la calidad de vida de niños con Trastorno del Espectro Autista (TEA) y
              Trastorno por Déficit de Atención e Hiperactividad (TDAH).
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Creemos que cada niño tiene un potencial único que puede ser desarrollado a
              través de metodologías innovadoras, gamificación y seguimiento personalizado.
              Trabajamos en conjunto con instituciones educativas, terapeutas y familias
              para crear un ecosistema de apoyo integral.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <div className="text-center space-y-4 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Innovación</h3>
              <p className="text-gray-600">
                Metodologías basadas en evidencia científica y adaptadas a cada perfil
                cognitivo.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Colaboración</h3>
              <p className="text-gray-600">
                Conectamos familias, terapeutas e instituciones en un solo lugar.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Compromiso</h3>
              <p className="text-gray-600">
                Dedicados a hacer la diferencia en el desarrollo de cada niño.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-do" className="bg-gradient-to-b from-white to-blue-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Qué Hacemos
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Ofrecemos herramientas interactivas de validación cognitiva que permiten a
              los niños desarrollar habilidades mientras se divierten.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Juegos Cognitivos
                  </h3>
                  <p className="text-gray-600">
                    Actividades como el Cubo Rubik, Sudoku y Ajedrez adaptados para
                    estimular la resolución de problemas, memoria de trabajo, planificación
                    y flexibilidad cognitiva.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LineChart className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Seguimiento Detallado
                  </h3>
                  <p className="text-gray-600">
                    Los terapeutas y padres pueden observar métricas en tiempo real:
                    movimientos, tiempo, eficiencia y estrategias utilizadas por el niño.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Personalización
                  </h3>
                  <p className="text-gray-600">
                    Adaptamos la experiencia según el perfil de cada niño (TEA, TDAH o
                    ambos), ajustando dificultad, temas visuales y tipo de refuerzos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">Gamificación</h3>
                  <p className="text-gray-600">
                    Sistema de recompensas con insignias, barras de progreso y logros que
                    mantienen al niño motivado y comprometido con su desarrollo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Nuestro Impacto
              </h3>
              <p className="text-gray-600 mb-6">
                Ayudamos a niños con TEA y TDAH a fortalecer habilidades como atención,
                planificación, flexibilidad mental y resolución de problemas, mientras
                fomentamos su autonomía y autoestima a través del juego.
              </p>
              <button
                onClick={() => onNavigate('register')}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all inline-flex items-center space-x-2"
              >
                <span>Comienza Hoy</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
