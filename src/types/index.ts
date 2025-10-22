//index.ts

export type UserType = 'institucional' | 'terapeuta' | 'paciente';

export interface User {
  id: string;
  email: string;
  password: string;
  type: UserType;
  name: string;
  institutionId?: string;
  createdAt: Date;
}

export interface Institution extends User {
  type: 'institucional';
  therapists: string[];
  patients: string[];
}

export interface Therapist extends User {
  type: 'terapeuta';
  institutionId?: string;
  patients: string[];
}

export interface Patient extends User {
  type: 'paciente';
  parentEmails: string[];
  therapistId: string;
  institutionId?: string;
  age?: number;
  diagnosis?: string[];
  progress: number;
  achievements: Achievement[];
  sessions: GameSession[];
  // Nuevo: Perfil Cognitivo CogniMirror 2.0
  cognitiveProfile?: CognitiveProfile;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  goal?: number;
}

// ============================================================================
// SISTEMA DE ESPEJOS COGNITIVOS - CogniMirror 2.0
// ============================================================================

export type MirrorType = 'memory_mirror_v1' | 'spatial_mirror_v1' | 'strategy_mirror_v1' | 'sudoku_mirror_v1' | 'chess_mirror_v1';
export type SessionOutcome = 'completed' | 'abandoned';
export type EventType = 
  | 'user_input' 
  | 'level_up' 
  | 'mistake' 
  | 'hint_used'
  | 'sequence_start'
  | 'sequence_end'
  | 'move_executed'
  | 'rotation_detected'
  | 'comparison_made';

/**
 * Evento individual dentro de una sesión de espejo
 */
export interface SessionEvent {
  timestamp: string; // ISO 8601
  type: EventType;
  value: any;
  isCorrect?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Contrato de datos universal para todos los Espejos Cognitivos
 * ESTE ES EL FORMATO ESTÁNDAR que todos los espejos deben generar
 */
export interface CognitiveSession {
  gameId: MirrorType;
  userId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  outcome: SessionOutcome;
  finalScore: number;
  events: SessionEvent[];
  metadata?: {
    difficulty?: string;
    assistanceUsed?: number;
    [key: string]: any;
  };
}

/**
 * Métricas CognTech - El corazón del análisis cognitivo
 * Calculadas por el Coach IA a partir de los eventos
 */
export interface CognitiveMetrics {
  persistencia: number;  // 0-1: Capacidad de mantener el esfuerzo
  eficiencia: number;    // 0-1: Ratio de éxito vs intentos
  resiliencia: number;   // 0-1: Recuperación después de errores
  adaptacion: number;    // 0-1: Flexibilidad estratégica
}

/**
 * Perfil cognitivo del usuario - Acumula insights
 */
export interface CognitiveProfile {
  userId: string;
  sessions: CognitiveSession[];
  aggregatedMetrics: CognitiveMetrics;
  insights: string[]; // Generados por Coach IA
  strengths: string[];
  areasToExplore: string[];
  lastUpdated: string;
}

// Legacy GameSession (mantener compatibilidad)
export interface GameSession {
  id: string;
  gameType: 'rubik' | 'sudoku' | 'ajedrez' | MirrorType;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  moves: number;
  efficiency: number;
  completed: boolean;
  metrics: {
    [key: string]: number | string;
  };
  // Nuevo: referencia a sesión cognitiva
  cognitiveSession?: CognitiveSession;
}

export type GameMode = 'juego' | 'observador';

export interface GameStats {
  totalSessions: number;
  totalTime: number;
  averageEfficiency: number;
  totalMoves: number;
  completedGames: number;
  strategies: string[];
}

// ============================================================================
// CONFIGURACIÓN DE ESPEJOS COGNITIVOS
// ============================================================================

export interface MirrorConfig {
  id: MirrorType;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  scientificBasis: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number; // minutos
  targetMetrics: (keyof CognitiveMetrics)[];
}

/**
 * Catálogo de Espejos Cognitivos - CogniMirror 2.0
 */
export const MIRROR_CATALOG: Record<MirrorType, MirrorConfig> = {
  memory_mirror_v1: {
    id: 'memory_mirror_v1',
    name: 'Memory Mirror',
    displayName: 'El Detective de Patrones',
    description: 'Revela tu memoria de trabajo y capacidad de atención sostenida',
    icon: '🧠',
    color: '#00D9FF',
    gradient: 'from-cyan-400 to-cyan-600',
    scientificBasis: 'Test de Corsi (Maceda Martínez et al., 2025: +0.54 en autoestima)',
    difficulty: 'easy',
    estimatedDuration: 5,
    targetMetrics: ['persistencia', 'eficiencia', 'adaptacion']
  },
  spatial_mirror_v1: {
    id: 'spatial_mirror_v1',
    name: 'Spatial Mirror',
    displayName: 'El Arquitecto Mental',
    description: 'Descubre tu razonamiento espacial y rotación mental',
    icon: '🔮',
    color: '#8B5CF6',
    gradient: 'from-purple-400 to-purple-600',
    scientificBasis: 'Test de Rotación Mental de Shepard y Metzler',
    difficulty: 'medium',
    estimatedDuration: 8,
    targetMetrics: ['eficiencia', 'adaptacion']
  },
  strategy_mirror_v1: {
    id: 'strategy_mirror_v1',
    name: 'Strategy Mirror',
    displayName: 'El Estratega del Cubo',
    description: 'Refleja tu flexibilidad cognitiva y resolución de problemas complejos',
    icon: '🧩',
    color: '#EC4899',
    gradient: 'from-pink-400 to-red-600',
    scientificBasis: 'Cubo de Rubik terapéutico (Cardoso et al., 2025: +46% en precisión)',
    difficulty: 'hard',
    estimatedDuration: 15,
    targetMetrics: ['persistencia', 'eficiencia', 'resiliencia', 'adaptacion']
  },
  sudoku_mirror_v1: {
    id: 'sudoku_mirror_v1',
    name: 'Sudoku Mirror',
    displayName: 'El Lógico Deductivo',
    description: 'Desvela tu pensamiento lógico y resolución de acertijos numéricos',
    icon: '🔢',
    color: '#10B981',
    gradient: 'from-green-400 to-emerald-600',
    scientificBasis: 'Entrenamiento cognitivo con Sudoku (Próximamente)',
    difficulty: 'medium',
    estimatedDuration: 10,
    targetMetrics: ['persistencia', 'eficiencia', 'adaptacion']
  },
  chess_mirror_v1: {
    id: 'chess_mirror_v1',
    name: 'Chess Mirror',
    displayName: 'El Maestro Táctico',
    description: 'Revela tu pensamiento estratégico y planificación a largo plazo',
    icon: '♟️',
    color: '#6366F1',
    gradient: 'from-indigo-400 to-indigo-600',
    scientificBasis: 'Ajedrez como herramienta cognitiva (Próximamente)',
    difficulty: 'hard',
    estimatedDuration: 20,
    targetMetrics: ['persistencia', 'eficiencia', 'resiliencia', 'adaptacion']
  }
};
