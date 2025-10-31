// src/services/metrics.ts
import { saveUserTimeMetrics } from '../data/firebase';

interface MetricEvent {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface GameMetric {
  gameName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  level?: number;
  score?: number;
  completed: boolean;
}

interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  games: GameMetric[];
  pages: Record<string, number>; // página -> tiempo total en ms
  events: MetricEvent[];
}

class MetricsService {
  private static instance: MetricsService;
  private sessionId: string;
  private sessionStart: number = Date.now();
  private currentGame: GameMetric | null = null;
  private currentPage: string | null = null;
  private pageViewStart: number = Date.now();
  private games: GameMetric[] = [];
  private pages: Record<string, number> = {};
  private events: MetricEvent[] = [];
  private currentUserId: string | null = null;

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.loadFromLocalStorage();
    this.logEvent('session_start');
    
    // Guardar métricas periódicamente cada 30 segundos
    setInterval(() => {
      this.saveToLocalStorage();
      this.saveToFirebase(); // Guardar también en Firebase
    }, 30000);
    
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  /**
   * Establece el ID del usuario actual
   */
  public setUserId(userId: string): void {
    this.currentUserId = userId;
    console.log(`👤 [Metrics] Usuario establecido: ${userId}`);
  }

  /**
   * Obtiene el ID del usuario actual
   */
  public getUserId(): string | null {
    return this.currentUserId;
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public startPageView(pageName: string): void {
    const now = Date.now();
    if (this.currentPage) {
      const duration = now - this.pageViewStart;
      this.pages[this.currentPage] = (this.pages[this.currentPage] || 0) + duration;
      this.logEvent(`page_${this.currentPage}_view_end`, { duration });
    }
    this.currentPage = pageName;
    this.pageViewStart = now;
    this.logEvent(`page_${pageName}_view_start`);
    this.saveToLocalStorage();
  }

  public startGame(gameName: string, metadata?: Record<string, any>): void {
    if (this.currentGame) {
      this.endGame(false);
    }
    this.currentGame = {
      gameName,
      startTime: Date.now(),
      completed: false,
      ...metadata
    };
    this.logEvent(`game_${gameName}_start`, metadata);
    console.log(`🎮 [Metrics] Juego iniciado: ${gameName}`);
  }

  public endGame(completed: boolean = true, finalData?: { level?: number; score?: number }): void {
    if (this.currentGame) {
      const endTime = Date.now();
      const duration = endTime - this.currentGame.startTime;
      
      this.currentGame.endTime = endTime;
      this.currentGame.duration = duration;
      this.currentGame.completed = completed;
      
      if (finalData) {
        this.currentGame.level = finalData.level;
        this.currentGame.score = finalData.score;
      }
      
      this.games.push({ ...this.currentGame });
      this.logEvent(`game_${this.currentGame.gameName}_end`, { 
        duration, 
        completed,
        ...finalData 
      });
      
      console.log(`🏁 [Metrics] Juego finalizado: ${this.currentGame.gameName}`, {
        duration: `${Math.floor(duration / 1000)}s`,
        completed,
        ...finalData
      });
      
      this.currentGame = null;
      this.saveToLocalStorage();
    }
  }

  public logEvent(name: string, metadata?: Record<string, any>): void {
    const event: MetricEvent = {
      name,
      startTime: Date.now(),
      metadata
    };
    this.events.push(event);
  }

  public getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  public getGameDuration(): number | null {
    if (!this.currentGame) return null;
    return Date.now() - this.currentGame.startTime;
  }

  public getPageViewDuration(): number | null {
    if (!this.pageViewStart) return null;
    return Date.now() - this.pageViewStart;
  }

  public getEvents(): MetricEvent[] {
    return this.events;
  }

  public getGames(): GameMetric[] {
    return this.games;
  }

  public getPages(): Record<string, number> {
    return this.pages;
  }

  public getCurrentSession(): SessionMetrics {
    // Actualizar página actual
    if (this.currentPage) {
      const now = Date.now();
      const currentPageDuration = now - this.pageViewStart;
      this.pages[this.currentPage] = (this.pages[this.currentPage] || 0) + currentPageDuration;
      this.pageViewStart = now;
    }

    return {
      sessionId: this.sessionId,
      startTime: this.sessionStart,
      totalDuration: this.getSessionDuration(),
      games: this.games,
      pages: this.pages,
      events: this.events
    };
  }

  private saveToLocalStorage(): void {
    try {
      const session = this.getCurrentSession();
      const allSessions = this.getAllSessions();
      
      // Actualizar o agregar sesión actual
      const existingIndex = allSessions.findIndex(s => s.sessionId === this.sessionId);
      if (existingIndex >= 0) {
        allSessions[existingIndex] = session;
      } else {
        allSessions.push(session);
      }
      
      // Mantener solo las últimas 50 sesiones
      if (allSessions.length > 50) {
        allSessions.splice(0, allSessions.length - 50);
      }
      
      localStorage.setItem('cognimirror_metrics', JSON.stringify(allSessions));
      console.log('💾 [Metrics] Métricas guardadas localmente');
    } catch (error) {
      console.error('Error guardando métricas:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('cognimirror_metrics');
      if (stored) {
        console.log('📂 [Metrics] Métricas cargadas desde localStorage');
      }
    } catch (error) {
      console.error('Error cargando métricas:', error);
    }
  }

  public getAllSessions(): SessionMetrics[] {
    try {
      const stored = localStorage.getItem('cognimirror_metrics');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      return [];
    }
  }

  public getSessionStats(): {
    totalSessions: number;
    totalTime: number;
    totalGames: number;
    gamesByType: Record<string, number>;
    averageSessionDuration: number;
  } {
    const sessions = this.getAllSessions();
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
    const allGames = sessions.flatMap(s => s.games);
    const totalGames = allGames.length;
    
    const gamesByType: Record<string, number> = {};
    allGames.forEach(game => {
      gamesByType[game.gameName] = (gamesByType[game.gameName] || 0) + 1;
    });
    
    return {
      totalSessions,
      totalTime,
      totalGames,
      gamesByType,
      averageSessionDuration: totalSessions > 0 ? totalTime / totalSessions : 0
    };
  }

  public getGameStats(gameName: string): {
    totalPlays: number;
    totalTime: number;
    averageTime: number;
    completionRate: number;
    bestLevel?: number;
  } {
    const sessions = this.getAllSessions();
    const allGames = sessions.flatMap(s => s.games).filter(g => g.gameName === gameName);
    
    const totalPlays = allGames.length;
    const totalTime = allGames.reduce((sum, g) => sum + (g.duration || 0), 0);
    const completed = allGames.filter(g => g.completed).length;
    const bestLevel = Math.max(...allGames.map(g => g.level || 0), 0);
    
    return {
      totalPlays,
      totalTime,
      averageTime: totalPlays > 0 ? totalTime / totalPlays : 0,
      completionRate: totalPlays > 0 ? (completed / totalPlays) * 100 : 0,
      bestLevel: bestLevel > 0 ? bestLevel : undefined
    };
  }

  public endSession(): void {
    if (this.currentGame) {
      this.endGame(false);
    }
    
    if (this.currentPage) {
      const now = Date.now();
      const duration = now - this.pageViewStart;
      this.pages[this.currentPage] = (this.pages[this.currentPage] || 0) + duration;
    }
    
    this.logEvent('session_end');
    this.saveToLocalStorage();
    this.saveToFirebase(); // Guardar en Firebase al finalizar sesión
    
    const stats = this.getCurrentSession();
    console.log('📊 [Metrics] Sesión finalizada:', {
      duration: `${Math.floor(stats.totalDuration! / 1000)}s`,
      games: stats.games.length,
      pages: Object.keys(stats.pages).length
    });
  }

  /**
   * Guarda métricas en Firebase
   */
  private async saveToFirebase(): Promise<void> {
    if (!this.currentUserId) {
      console.warn('⚠️ [Metrics] No se puede guardar en Firebase: usuario no establecido');
      return;
    }

    try {
      const session = this.getCurrentSession();
      await saveUserTimeMetrics({
        userId: this.currentUserId,
        sessionId: this.sessionId,
        startTime: this.sessionStart,
        endTime: Date.now(),
        totalDuration: session.totalDuration,
        games: this.games,
        pages: this.pages,
        timestamp: new Date().toISOString()
      });
      console.log('🔥 [Metrics] Métricas guardadas en Firebase');
    } catch (error) {
      console.error('❌ [Metrics] Error guardando en Firebase:', error);
    }
  }

  public async sendMetrics(): Promise<void> {
    const session = this.getCurrentSession();
    const stats = this.getSessionStats();
    
    const metricsData = {
      currentSession: session,
      stats,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
    
    try {
      console.log('📤 [Metrics] Métricas preparadas para envío:', metricsData);
      // Guardar en Firebase
      await this.saveToFirebase();
    } catch (error) {
      console.error('Error enviando métricas:', error);
    }
  }

  public clearAllMetrics(): void {
    if (confirm('¿Estás seguro de que quieres borrar todas las métricas almacenadas?')) {
      localStorage.removeItem('cognimirror_metrics');
      console.log('🗑️ [Metrics] Todas las métricas han sido eliminadas');
    }
  }
}

export const metrics = MetricsService.getInstance();