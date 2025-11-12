import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { useCognitiveMetrics } from './useCognitiveMetrics';
import { getCoachMessages } from './CoachLogic';

interface Props {
  userId: string;
  userName?: string;
  onNavigate?: (page: string) => void;
}

export function AnalyticsDashboard({ userId, userName, onNavigate }: Props) {
  const [uid, setUid] = useState(userId);
  const [gameId, setGameId] = useState<string | undefined>(undefined);

  const { loading, error, metrics, trend } = useCognitiveMetrics({ userId: uid, gameId });
  const coach = useMemo(() => getCoachMessages(metrics || null), [metrics]);

  useEffect(() => {
    setUid(userId);
  }, [userId]);

  const fluencyPct = (() => {
    const maxTarget = 1200; // escala simple
    const val = Math.max(0, Math.min(metrics?.fluency || 0, maxTarget));
    return Math.round((val / maxTarget) * 100);
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cognitive Analytics</h1>
            <p className="text-gray-600">{userName || uid}</p>
          </div>
          {onNavigate && (
            <button onClick={() => onNavigate('mirror-hub')} className="px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow">
              Volver
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">userId</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={uid}
                onChange={(e) => setUid(e.target.value.trim())}
                placeholder="usuario-123"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">gameId (opcional)</label>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={gameId || ''}
                onChange={(e) => setGameId(e.target.value.trim() || undefined)}
                placeholder="memory_mirror_v1"
              />
            </div>
            <div className="flex items-end">
              <button
                className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                onClick={() => {
                  // trigger re-run via state dependencies already bound
                }}
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Kpi title="Accuracy" value={loading ? '...' : `${(metrics?.accuracy ?? 0).toFixed(1)}%`} />
          <Kpi title="Avg RT" value={loading ? '...' : `${((metrics?.avgRT ?? 0) / 1000).toFixed(2)}s`} />
          <Kpi title="Max Span" value={loading ? '...' : `${metrics?.maxSpan ?? 0}`} />
          <Kpi title="Fatigue" value={loading ? '...' : `${(metrics?.fatigue ?? 0).toFixed(2)}`} />
          <Kpi title="Self-Corr" value={loading ? '...' : `${((metrics?.selfCorrectionRate ?? 0) * 100).toFixed(0)}%`} />
          <Kpi title="Fluency" value={loading ? '...' : `${(metrics?.fluency ?? 0).toFixed(1)}`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Trend: Accuracy & Reaction Time</h3>
            <div className="w-full h-72">
              <ResponsiveContainer>
                <LineChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} name="Accuracy (%)" />
                  <Line yAxisId="right" type="monotone" dataKey="avgRT" stroke="#3b82f6" strokeWidth={2} dot={false} name="RT (s)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow border border-gray-200 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Cognitive Fluency</h3>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ name: 'fluency', value: fluencyPct }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={8} fill="#a855f7" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-10">
              <div className="text-2xl font-bold text-purple-600">{metrics?.fluency?.toFixed(0) ?? 0}</div>
              <div className="text-xs text-gray-500">target 1200</div>
            </div>
          </div>
        </div>

        {/* Coach */}
        <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Coach</h3>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          {coach.length === 0 && <p className="text-gray-600 text-sm">Sin recomendaciones por ahora.</p>}
          <ul className="space-y-2">
            {coach.map((m, i) => (
              <li key={i} className="text-sm text-gray-700">• {m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
