import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { StatCard } from '../dashboard/StatCard';
import { PersistenceChart } from '../dashboard/PersistenceChart';
import { EvolutionChart } from '../dashboard/EvolutionChart';
import { InsightCard } from '../dashboard/InsightCard';
import { Target, Clock, TrendingUp, Trophy, Calendar, Zap } from 'lucide-react';

interface SessionData {
    id: string;
    fecha: Timestamp;
    gameId?: string;
    duracion_segundos: number;
    nivel_maximo: number;
    aciertos: number;
    errores: number;
    tasa_error: number;
    persistencia_intentos: number;
    completada: boolean;
}

interface EnhancedSessionDashboardProps {
    userId: string;
    userName: string;
    gameId?: 'memory_mirror' | 'digit_span_v1';
}

export const EnhancedSessionDashboard = ({ userId, userName, gameId }: EnhancedSessionDashboardProps) => {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    // Initialize filter based on prop, but default to 'general' if not provided
    const [chartFilter, setChartFilter] = useState<'general' | 'memory_mirror' | 'digit_span' | 'compare'>(
        gameId === 'digit_span_v1' ? 'digit_span' :
            gameId === 'memory_mirror' ? 'memory_mirror' : 'general'
    );

    useEffect(() => {
        if (!userId) return;

        const sessionsRef = collection(db, 'usuarios', userId, 'sesiones');
        const q = query(sessionsRef, orderBy('fecha', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SessionData[];
            setSessions(fetchedSessions);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);


    if (loading) return <div className="p-8 text-center text-gray-500">Cargando estadísticas avanzadas...</div>;

    // --- Filter Logic ---
    let filteredSessions = sessions;
    if (chartFilter === 'memory_mirror') {
        filteredSessions = sessions.filter(s => (s.gameId || 'memory_mirror') === 'memory_mirror' || s.gameId === 'memory_mirror_v1');
    } else if (chartFilter === 'digit_span') {
        filteredSessions = sessions.filter(s => s.gameId === 'digit_span_v1');
    }

    const statsSessions = chartFilter === 'compare' ? sessions : filteredSessions;

    // --- Statistics Calculation ---
    const totalSessions = statsSessions.length;
    const totalTimeSeconds = statsSessions.reduce((acc, s) => acc + (s.duracion_segundos || 0), 0);

    // Calculate Max Level
    const globalMaxLevel = statsSessions.length > 0
        ? Math.max(...statsSessions.map(s => s.nivel_maximo || 0))
        : 0;

    // Calculate Average Error Rate (replacing Precision)
    const globalAvgError = statsSessions.length > 0
        ? (statsSessions.reduce((acc, s) => acc + (s.tasa_error || 0), 0) / statsSessions.length).toFixed(1)
        : "0";

    // --- Comparison Logic ---
    let comparisonSessions = undefined;
    let comparisonMaxLevel = undefined;
    let comparisonTime = undefined;
    let comparisonError = undefined;

    const formatTimeShort = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins}m`;
    };

    if (chartFilter === 'compare') {
        const memorySessions = sessions.filter(s => (s.gameId || 'memory_mirror') === 'memory_mirror' || s.gameId === 'memory_mirror_v1');
        const digitSessions = sessions.filter(s => s.gameId === 'digit_span_v1');

        comparisonSessions = [
            { value: memorySessions.length, label: 'Memory Mirror', color: 'bg-purple-500' },
            { value: digitSessions.length, label: 'Digit Span', color: 'bg-blue-500' }
        ];

        const maxLevelMemory = memorySessions.length > 0 ? Math.max(...memorySessions.map(s => s.nivel_maximo || 0)) : 0;
        const maxLevelDigit = digitSessions.length > 0 ? Math.max(...digitSessions.map(s => s.nivel_maximo || 0)) : 0;

        comparisonMaxLevel = [
            { value: maxLevelMemory, label: 'Memory Mirror', color: 'bg-purple-500' },
            { value: maxLevelDigit, label: 'Digit Span', color: 'bg-blue-500' }
        ];

        const timeMemory = memorySessions.reduce((acc, s) => acc + (s.duracion_segundos || 0), 0);
        const timeDigit = digitSessions.reduce((acc, s) => acc + (s.duracion_segundos || 0), 0);

        comparisonTime = [
            { value: formatTimeShort(timeMemory), label: 'Memory Mirror', color: 'bg-purple-500' },
            { value: formatTimeShort(timeDigit), label: 'Digit Span', color: 'bg-blue-500' }
        ];

        const avgErrorMemory = memorySessions.length > 0 ? (memorySessions.reduce((acc, s) => acc + (s.tasa_error || 0), 0) / memorySessions.length).toFixed(1) : "0";
        const avgErrorDigit = digitSessions.length > 0 ? (digitSessions.reduce((acc, s) => acc + (s.tasa_error || 0), 0) / digitSessions.length).toFixed(1) : "0";

        comparisonError = [
            { value: `${avgErrorMemory}%`, label: 'Memory Mirror', color: 'bg-purple-500' },
            { value: `${avgErrorDigit}%`, label: 'Digit Span', color: 'bg-blue-500' }
        ];
    }

    // --- Chart Data Preparation ---
    const persistenceData = statsSessions.map((s, index) => {
        const isMemory = (s.gameId || 'memory_mirror') === 'memory_mirror' || s.gameId === 'memory_mirror_v1';

        if (chartFilter === 'compare') {
            return {
                name: `Sesión ${index + 1}`,
                persistence_memory: isMemory ? s.persistencia_intentos : null,
                persistence_digit: !isMemory ? s.persistencia_intentos : null,
                error_memory: isMemory ? s.tasa_error : null,
                error_digit: !isMemory ? s.tasa_error : null,
            };
        }

        return {
            name: `Sesión ${index + 1}`,
            persistencia: s.persistencia_intentos,
            tasa_error: s.tasa_error
        };
    });

    const evolutionData = statsSessions.map((s, index) => {
        const isMemory = (s.gameId || 'memory_mirror') === 'memory_mirror' || s.gameId === 'memory_mirror_v1';
        const total = (s.aciertos || 0) + (s.errores || 0);
        const precision = total > 0 ? ((s.aciertos || 0) / total) * 100 : 0;

        if (chartFilter === 'compare') {
            return {
                name: `Sesión ${index + 1}`,
                level_memory: isMemory ? s.nivel_maximo : null,
                level_digit: !isMemory ? s.nivel_maximo : null,
                precision_memory: isMemory ? precision : null,
                precision_digit: !isMemory ? precision : null,
            };
        }

        return {
            name: `Sesión ${index + 1}`,
            nivel: s.nivel_maximo,
            precision: precision
        };
    });

    // --- Insight Logic ---
    const lastSession = sessions[sessions.length - 1];
    let insightMessage = "¡Sigue entrenando para ver tu progreso!";
    let insightType: 'positive' | 'neutral' | 'attention' = 'neutral';

    if (lastSession) {
        if (lastSession.completada) {
            insightMessage = "¡Excelente trabajo! Has completado tu última sesión con éxito.";
            insightType = 'positive';
        } else if (lastSession.tasa_error > 30) {
            insightMessage = "Notamos una tasa de error alta en la última sesión. ¡Intenta ir más despacio!";
            insightType = 'attention';
        } else {
            insightMessage = "Constancia es clave. ¡Buen trabajo manteniendo el ritmo!";
            insightType = 'positive';
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}m ${secs}s`;
    };

    const totalSessionsDisplay = chartFilter === 'compare'
        ? ""
        : totalSessions;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-fit">
                {[
                    { id: 'general', label: 'General', icon: Target, color: 'bg-gray-100 text-gray-600' },
                    { id: 'memory_mirror', label: 'Memory Mirror', icon: Zap, color: 'bg-purple-100 text-purple-600' },
                    { id: 'digit_span', label: 'Digit Span', icon: Clock, color: 'bg-blue-100 text-blue-600' },
                    { id: 'compare', label: 'Comparar', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setChartFilter(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${chartFilter === tab.id
                                ? `${tab.color} ring-2 ring-offset-1 ring-opacity-60 ring-current shadow-sm`
                                : 'hover:bg-gray-50 text-gray-500'
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Sesiones Totales"
                    value={totalSessionsDisplay}
                    icon={Target}
                    color="blue"
                    comparisonValues={comparisonSessions}
                />
                <StatCard
                    title="Tiempo Total"
                    value={chartFilter === 'compare' ? "" : formatTime(totalTimeSeconds)}
                    icon={Clock}
                    color="green"
                    comparisonValues={comparisonTime}
                />
                <StatCard
                    title="Nivel Máximo"
                    value={chartFilter === 'compare' ? "" : globalMaxLevel}
                    icon={Trophy}
                    color="purple"
                    comparisonValues={comparisonMaxLevel}
                />
                <StatCard
                    title="Tasa de Error"
                    value={chartFilter === 'compare' ? "" : `${globalAvgError}%`}
                    icon={TrendingUp}
                    color="orange"
                    comparisonValues={comparisonError}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Persistence Chart */}
                <div className="lg:col-span-2 h-[400px] relative">
                    <PersistenceChart data={persistenceData} />
                </div>

                {/* Insight Card */}
                <div className="h-full">
                    <InsightCard insight={insightMessage} type={insightType} />
                </div>
            </div>

            {/* Evolution Chart */}
            <div className="h-[400px]">
                <EvolutionChart data={evolutionData} />
            </div>

            {/* Cronograma de Sesiones (Timeline) */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Cronograma de Sesiones</h3>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {[...statsSessions].reverse().map((session, index) => (
                        <div key={session.id} className="relative pl-8 pb-8 last:pb-0">
                            {/* Timeline Line */}
                            {index !== statsSessions.length - 1 && (
                                <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200"></div>
                            )}

                            {/* Timeline Dot */}
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${session.completada ? 'bg-green-500' : 'bg-orange-400'
                                }`}></div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            {session.gameId === 'digit_span_v1' ? 'Digit Span' : 'Memory Mirror'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {session.fecha?.toDate().toLocaleDateString()} - {session.fecha?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${session.completada ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {session.completada ? 'Completada' : 'Incompleta'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-gray-500 text-xs">Nivel</p>
                                        <p className="font-semibold">{session.nivel_maximo}</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-gray-500 text-xs">Precisión</p>
                                        <p className="font-semibold">
                                            {(() => {
                                                const total = (session.aciertos || 0) + (session.errores || 0);
                                                return total > 0 ? Math.round(((session.aciertos || 0) / total) * 100) : 0;
                                            })()}%
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <p className="text-gray-500 text-xs">Duración</p>
                                        <p className="font-semibold">{Math.floor(session.duracion_segundos / 60)}m {session.duracion_segundos % 60}s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
