//LandingPage.tsx

import { Brain, Users, Award, ArrowRight, Gamepad2, LineChart, Heart, ArrowDown, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'what-we-do'];
      const scrollPosition = window.scrollY + 100; // Ajuste para el header fijo

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    // Ejecutar una vez al cargar para establecer la sección inicial
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <div className="mt-12">
                <div className="relative group/button inline-block">
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <ArrowDown className="w-5 h-5 text-blue-600 animate-bounce" />
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">¡Empieza aquí!</span>
                  </div>
                  <button
                    onClick={() => onNavigate('try-now')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover/button:opacity-10 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center">
                      <span className="animate-pulse">✨</span>
                      <span className="ml-2">Pruébalo Ahora</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover/button:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>

              {/* COMENTADO - Botón Entrenamiento
              <div className="mt-12">
                <button
                  onClick={() => onNavigate('firestore-training')}
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg border border-blue-200 flex items-center space-x-2"
                >
                  <Database className="w-5 h-5" />
                  <span>Entrenamiento</span>
                </button>
              </div>
              */}

            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onNavigate('try-now')}
                  className="w-full text-left bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <Gamepad2 className="w-10 h-10 text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Juegos</h3>
                  <p className="text-sm text-gray-600">Interactivos</p>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full text-left bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <LineChart className="w-10 h-10 text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Progreso</h3>
                  <p className="text-sm text-gray-600">En tiempo real</p>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full text-left bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <Award className="w-10 h-10 text-yellow-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Logros</h3>
                  <p className="text-sm text-gray-600">Motivadores</p>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full text-left bg-white rounded-2xl p-6 shadow-md transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-300 group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <Heart className="w-10 h-10 text-red-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Apoyo</h3>
                  <p className="text-sm text-gray-600">Personalizado</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-16 md:py-24 scroll-mt-20" data-section="about">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Quiénes Somos
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              <span className="font-semibold text-purple-600">CogniMirror</span> es el primer ecosistema de Inteligencia Cognitiva en Chile. No solo creamos juegos; democratizamos el acceso a la evaluación neuropsicológica de precisión. Nacimos para cerrar la brecha entre la ciencia clínica y el aula de clases, transformando procesos de evaluación subjetivos y lentos en datos objetivos, inmediatos y accionables. Nuestra misión es devolver la soberanía cognitiva a las personas, comenzando por potenciar el desarrollo de estudiantes en Programas de Integración (PIE) y pacientes en rehabilitación.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">

            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            <div className="text-center space-y-4 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Ciencia de Datos</h3>
              <p className="text-gray-600">
                Transformamos la interacción lúdica en métricas clínicas valiosas (Persistencia, Precisión, Memoria de Trabajo).
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Tecnología Híbrida</h3>
              <p className="text-gray-600">
                Unimos el mundo físico (CubeCoop) con el digital para capturar una huella cognitiva completa.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Accesibilidad</h3>
              <p className="text-gray-600">
                Llevamos herramientas de estándar clínico a colegios y centros terapéuticos a una fracción del costo tradicional.
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
              Desarrollamos una plataforma integral que convierte la evaluación cognitiva en una experiencia fluida y gamificada, eliminando el papeleo y la subjetividad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Evaluación Clínica Gamificada
                  </h3>
                  <p className="text-gray-600">
                    Utilizamos protocolos validados científicamente (como el Test de Corsi y Digit Span) digitalizados en interfaces modernas (Memory Mirror). Esto permite medir funciones ejecutivas sin que el usuario sienta que está siendo examinado.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Hardware Inteligente (CubeCoop)
                  </h3>
                  <p className="text-gray-600">
                    Integramos sensores en objetos tangibles, como el Cubo Rubik, para capturar datos motrices y de resolución de problemas en tiempo real, llevando la terapia más allá de la pantalla.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Insights Basados en IA
                  </h3>
                  <p className="text-gray-600">
                    Nuestra plataforma no solo muestra números; procesa el rendimiento del usuario para entregar "Insights" automáticos a terapeutas y educadores, detectando patrones de fatiga, curvas de aprendizaje y picos de rendimiento al instante.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏅</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">Monitoreo de Progreso Real</h3>
                  <p className="text-gray-600">
                    Reemplazamos la "foto del momento" por una "película de la evolución". Terapeutas y padres pueden visualizar la trayectoria de mejora mediante gráficos de radar y tendencias históricas, facilitando la toma de decisiones basada en evidencia.
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
                Estamos redefiniendo el estándar de la educación especial y la rehabilitación. Al automatizar la captura de datos, liberamos a los profesionales de la carga administrativa para que se enfoquen en lo que mejor saben hacer: intervenir y transformar vidas.
              </p>
              <button
                onClick={() => onNavigate('try-now')}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all inline-flex items-center space-x-2"
              >
                <span>Comienza Hoy</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Validados por la Industria */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Validados por la Industria
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600">
              Nuestro trabajo y alianzas estratégicas que respaldan nuestra misión
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Tarjeta 1: CITT Duoc UC */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100 group flex flex-col h-full">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform overflow-hidden bg-white p-2 shadow-sm">
                <img
                  src="/images/logos/logo citt.jpg"
                  alt="Centro de Innovación y Transferencia Tecnológica CITT Duoc UC"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmNTk1MWMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTRjMS40OS0xLjQ2IDIuMzgtMy42NCAyLjM4LTZAOS4xMyA4QzIuODcgOCAwIDEyLjI0IDAgMThzNC4yNCAxMCA5LjUgMTBjMi4zMSAwIDQuNDEtLjg1IDYuMDQtMi4yN0wxMy41IDE1YTEuNSAxLjUgMCAxIDEtMi0yLjA3bTU4OC0xLjM2bS01ODYtMS42NGw1ODYtMS4zNiIvPjwvc3ZnPg==';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Centro de Innovación y Transferencia Tecnológica CITT Duoc UC</h3>
              <p className="text-gray-600 text-sm mb-4">
                Centro de Innovación y Transferencia Tecnológica CITT Sede Puerto Montt. Aliado estratégico de nuestro proyecto. Su respaldo fue fundamental para la articulación y presentación de nuestra plataforma <span className="text-purple-600 font-semibold">CogniMirror</span> en la feria tecnológica del Colegio Da Vinci School, evento que constituyó nuestra primera validación con usuarios reales y de alto perfil.
              </p>
              <div className="mt-auto">
                <a
                  href="https://www.instagram.com/citt_puertomontt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium inline-flex items-center group-hover:underline"
                >
                  Saber más
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Tarjeta 2: Centro Terapéutico Armonía */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 group flex flex-col h-full">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform overflow-hidden bg-white p-2 shadow-sm">
                <img
                  src="/images/logos/logo armonia.jpg"
                  alt="Centro Terapéutico Armonía"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiI4YzRkZTAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTRjMS40OS0xLjQ2IDIuMzgtMy42NCAyLjM4LTZAOS4xMyA4QzIuODcgOCAwIDEyLjI0IDAgMThzNC4yNCAxMCA5LjUgMTBjMi4zMSAwIDQuNDEtLjg1IDYuMDQtMi4yN0wxMy41IDE1YTEuNSAxLjUgMCAxIDEtMi0yLjA3bTU4OC0xLjM2bS01ODYtMS42NGw1ODYtMS4zNiIvPjwvc3ZnPg==';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Centro Terapéutico Armonía</h3>
              <p className="text-gray-600 text-sm mb-4">
                Centro de Validación Clínica. Centro con <strong>12 años de trayectoria</strong> en el mundo de la terapia. Trabajamos en conjunto para la implementación inicial de nuestro programa piloto, co-creando las futuras soluciones de gestión (AgendMirror) y validación cognitiva.
              </p>
              <div className="mt-auto">
                <a
                  href="https://www.instagram.com/armonia_terapias/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium inline-flex items-center group-hover:underline"
                >
                  Saber más
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Tarjeta 3: Cooimpacta 2025 */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 group flex flex-col h-full">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform overflow-hidden bg-white p-2 shadow-sm">
                <img
                  src="/images/logos/logo cooimpacta.png"
                  alt="Cooimpacta 2025"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiIxNmE5NzQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTRjMS40OS0xLjQ2IDIuMzgtMy42NCAyLjM4LTZAOS4xMyA4QzIuODcgOCAwIDEyLjI0IDAgMThzNC4yNCAxMCA5LjUgMTBjMi4zMSAwIDQuNDEtLjg1IDYuMDQtMi4yN0wxMy41IDE1YTEuNSAxLjUgMCAxIDEtMi0yLjA3bTU4OC0xLjM2bS01ODYtMS42NGw1ODYtMS4zNiIvPjwvc3ZnPg==';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Cooimpacta 2025</h3>
              <p className="text-gray-600 text-sm mb-4">
                Nuestro proyecto de hardware, <span className="text-green-600 font-semibold">CubeCoop</span>, fue <strong>seleccionado como uno de los 20 finalistas nacionales</strong> en el desafío de innovación cooperativa impulsado por la Fundación Coopeuch y Duoc UC, validando nuestro modelo de triple impacto.
              </p>
              <div className="mt-auto">
                <a
                  href="https://www.duoc.cl/cooimpacta/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm font-medium inline-flex items-center group-hover:underline"
                >
                  Saber más
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Tarjeta 4: All In Chile 2025 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 group flex flex-col h-full">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform overflow-hidden bg-white p-2 shadow-sm">
                <img
                  src="/images/logos/logo all in.png"
                  alt="All In Chile 2025"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZDdlYmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTkgMTRjMS40OS0xLjQ2IDIuMzgtMy42NCAyLjM4LTZAOS4xMyAwLTQuNDUtNC4yNi0xNi0xMS4zOC0xNkM2LjI0IDIgMiA2LjI0IDIgMTJzNC4yNCAxMCA5LjUgMTBjMi4zMSAwIDQuNDEtLjg1IDYuMDQtMi4yN0wxMy41IDE1YTEuNSAxLjUgMCAxIDEtMi0yLjA3bDU4LTEuMzZtLTU4Ni0xLjY0bDU4Ni0xLjM2Ii8+PC9zdmc+';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                <span translate="no" className="whitespace-nowrap">All In Chile 2025</span>
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                <span className="text-purple-600 font-semibold">CogniMirror</span> fue seleccionado como uno de los <strong>100 mejores proyectos</strong> con "potencial de emprendimiento innovador" entre más de <strong>1,400 proyectos postulantes</strong>, en el prestigioso torneo nacional organizado por Duoc UC, Ruta IE y Santander X.
              </p>
              <div className="mt-auto">
                <a
                  href="https://www.duoc.cl/allinchile/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center group-hover:underline"
                >
                  Saber más
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
