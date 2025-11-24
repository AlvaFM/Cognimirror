// RubikGamePage.tsx - Cubo Rubik 3D con Three.js y Firebase
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Save, Box, History, MousePointer2 } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../data/firebase';
import { auth, initializeAnonymousAuth } from '../services/firebaseAuth';
import { onAuthStateChanged, User } from 'firebase/auth';

interface RubikGamePageProps {
  onNavigate: (page: string) => void;
}

// Configuración de colores (Vibrantes)
const COLORS = {
  U: 0xFFFFFF, // Blanco
  D: 0xFFD500, // Amarillo
  F: 0x009E60, // Verde
  B: 0x0051BA, // Azul
  R: 0xC41E3A, // Rojo
  L: 0xFF5800, // Naranja
  CORE: 0x1a1a1a // Núcleo oscuro
};

// Configuración de movimientos
const MOVES_CONFIG: Record<string, { axis: 'x' | 'y' | 'z'; val: number; angle: number }> = {
  'U': { axis: 'y', val: 1, angle: -Math.PI / 2 },
  'D': { axis: 'y', val: -1, angle: Math.PI / 2 },
  'R': { axis: 'x', val: 1, angle: -Math.PI / 2 },
  'L': { axis: 'x', val: -1, angle: Math.PI / 2 },
  'F': { axis: 'z', val: 1, angle: -Math.PI / 2 },
  'B': { axis: 'z', val: -1, angle: Math.PI / 2 },
};

export const RubikGamePage = ({ onNavigate }: RubikGamePageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<string>('Conectando...');
  const [moveLog, setMoveLog] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState('Guardar Sesión');

  // Referencias Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const allCubiesRef = useRef<THREE.Mesh[]>([]);
  const isAnimatingRef = useRef(false);
  const moveHistoryRef = useRef<{ move: string, time: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Inicialización Auth
  useEffect(() => {
    initializeAnonymousAuth().catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthStatus('Conectado');
      } else {
        setCurrentUser(null);
        setAuthStatus('Desconectado');
      }
    });
    return () => unsubscribe();
  }, []);

  // Inicialización 3D
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    // Fondo transparente para dejar ver el gradiente CSS
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(6, 5, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Iluminación mejorada
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-10, -10, -10);
    scene.add(backLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controlsRef.current = controls;

    createCube(scene);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const validKeys = ['U', 'D', 'L', 'R', 'F', 'B'];
      if (validKeys.includes(key)) {
        let move = key;
        if (e.shiftKey) move += "'";
        handleMove(move);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const createCube = (scene: THREE.Scene) => {
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);

    const cubies: THREE.Mesh[] = [];

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const materials = [
            new THREE.MeshPhongMaterial({ color: x === 1 ? COLORS.R : COLORS.CORE, shininess: 50 }),
            new THREE.MeshPhongMaterial({ color: x === -1 ? COLORS.L : COLORS.CORE, shininess: 50 }),
            new THREE.MeshPhongMaterial({ color: y === 1 ? COLORS.U : COLORS.CORE, shininess: 50 }),
            new THREE.MeshPhongMaterial({ color: y === -1 ? COLORS.D : COLORS.CORE, shininess: 50 }),
            new THREE.MeshPhongMaterial({ color: z === 1 ? COLORS.F : COLORS.CORE, shininess: 50 }),
            new THREE.MeshPhongMaterial({ color: z === -1 ? COLORS.B : COLORS.CORE, shininess: 50 }),
          ];
          const cubie = new THREE.Mesh(geometry, materials);
          cubie.position.set(x, y, z);
          cubie.userData = { x, y, z };

          // Añadir borde negro sutil a cada cubie
          const edges = new THREE.EdgesGeometry(geometry);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }));
          cubie.add(line);

          scene.add(cubie);
          cubies.push(cubie);
        }
      }
    }
    allCubiesRef.current = cubies;
  };

  const logMove = (notation: string) => {
    moveHistoryRef.current.push({ move: notation, time: Date.now() });
    setMoveLog(prev => [...prev, notation]);
    // Auto-scroll
    setTimeout(() => {
      const el = document.getElementById('move-log-container');
      if (el) el.scrollTop = el.scrollHeight;
    }, 10);
  };

  const rotateFaceAnimated = (axis: 'x' | 'y' | 'z', val: number, angle: number) => {
    return new Promise<void>(resolve => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) {
        resolve(); return;
      }

      const activeCubies = allCubiesRef.current.filter(c => Math.abs(c.position[axis] - val) < 0.1);
      const pivot = new THREE.Object3D();
      sceneRef.current.add(pivot);
      activeCubies.forEach(c => pivot.attach(c));

      const steps = 12; // Más rápido
      const stepAngle = angle / steps;
      let currentStep = 0;

      const animateStep = () => {
        if (currentStep < steps) {
          if (axis === 'x') pivot.rotation.x += stepAngle;
          if (axis === 'y') pivot.rotation.y += stepAngle;
          if (axis === 'z') pivot.rotation.z += stepAngle;
          rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
          currentStep++;
          requestAnimationFrame(animateStep);
        } else {
          finalizeRotation(pivot, activeCubies);
          resolve();
        }
      };
      animateStep();
    });
  };

  const finalizeRotation = (pivot: THREE.Object3D, activeCubies: THREE.Mesh[]) => {
    if (!sceneRef.current) return;
    pivot.updateMatrixWorld();
    activeCubies.forEach(c => {
      sceneRef.current!.attach(c);
      c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
      c.rotation.set(
        Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2),
        Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2),
        Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2)
      );
      c.updateMatrix();
    });
    sceneRef.current.remove(pivot);
  };

  const handleMove = async (notation: string) => {
    if (isAnimatingRef.current) return;

    const face = notation.charAt(0);
    const modifier = notation.length > 1 ? notation.charAt(1) : '';
    let count = 1;
    let reverse = false;

    if (modifier === '2') count = 2;
    if (modifier === '\'') reverse = true;

    logMove(notation);

    const config = MOVES_CONFIG[face];
    if (!config) return;

    let angle = config.angle;
    if (reverse) angle *= -1;

    isAnimatingRef.current = true;
    for (let i = 0; i < count; i++) {
      await rotateFaceAnimated(config.axis, config.val, angle);
    }
    isAnimatingRef.current = false;
  };

  const scrambleCube = () => {
    if (isAnimatingRef.current) return;
    const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
    const modifiers = ['', '\'', '2'];
    const totalMoves = 20;
    const sequence: string[] = [];
    for (let i = 0; i < totalMoves; i++) {
      const f = faces[Math.floor(Math.random() * faces.length)];
      const m = modifiers[Math.floor(Math.random() * modifiers.length)];
      sequence.push(f + m);
    }
    (async () => {
      for (const move of sequence) {
        await handleMove(move);
        await new Promise(r => setTimeout(r, 60));
      }
    })();
  };

  const saveToFirebase = async () => {
    if (!currentUser) {
      alert("Esperando conexión...");
      return;
    }
    if (moveHistoryRef.current.length === 0) {
      alert("Realiza movimientos antes de guardar.");
      return;
    }

    setIsSaving(true);
    setSaveButtonText("Guardando...");

    try {
      await addDoc(collection(db, 'artifacts', 'rubik-app', 'users', currentUser.uid, 'rubik_sessions'), {
        moves: moveHistoryRef.current,
        moveCount: moveHistoryRef.current.length,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      });

      setSaveButtonText("¡Guardado!");
      setTimeout(() => {
        setIsSaving(false);
        setSaveButtonText("Guardar Sesión");
      }, 2000);
    } catch (error: any) {
      console.error("Error:", error);
      alert("Error al guardar");
      setIsSaving(false);
      setSaveButtonText("Reintentar");
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden font-sans text-white">

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center pointer-events-none">
        <div className="flex items-center space-x-4 pointer-events-auto">
          <button
            onClick={() => onNavigate('mirror-hub')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-all border border-white/10 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver</span>
          </button>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Box className="w-6 h-6 text-blue-400" />
              Strategy Mirror
            </h1>
            <p className="text-sm text-blue-200/80">Cubo Rubik 3D</p>
          </div>
        </div>

        <div className="pointer-events-auto px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${currentUser ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm font-medium text-white/90">{authStatus}</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-move" />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-row justify-between items-center">

        {/* Left Panel: Info & Actions */}
        <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl max-w-xs shadow-2xl transform transition-all hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-4 text-white/90">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg">Historial</h3>
          </div>

          <div id="move-log-container" className="h-32 overflow-y-auto bg-black/40 rounded-xl p-3 mb-4 font-mono text-sm border border-white/5 custom-scrollbar">
            {moveLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 italic text-xs">
                Esperando movimientos...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {moveLog.map((move, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-bold border border-blue-500/30">
                    {move}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={scrambleCube}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Mezclar
            </button>
            <button
              onClick={saveToFirebase}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '...' : 'Guardar'}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-white/40 justify-center">
            <MousePointer2 className="w-3 h-3" />
            <span>Arrastra para rotar la cámara</span>
          </div>
        </div>

        {/* Right Panel: Controls */}
        <div className="pointer-events-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
          <h3 className="text-sm font-bold text-white/90 mb-3 text-center uppercase tracking-wider">Controles Manuales</h3>
          <div className="grid grid-cols-3 gap-2">
            {['U', 'D', 'F', 'B', 'R', 'L'].map((face) => (
              <>
                <button onClick={() => handleMove(face)} className="w-10 h-10 bg-white/5 hover:bg-white/20 border border-white/10 rounded-lg font-bold text-white transition-all hover:scale-110 active:scale-95">{face}</button>
                <button onClick={() => handleMove(face + "'")} className="w-10 h-10 bg-white/5 hover:bg-white/20 border border-white/10 rounded-lg font-bold text-white transition-all hover:scale-110 active:scale-95">{face}'</button>
                <button onClick={() => handleMove(face + "2")} className="w-10 h-10 bg-white/5 hover:bg-white/20 border border-white/10 rounded-lg font-bold text-white/60 transition-all hover:scale-110 active:scale-95">2</button>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
