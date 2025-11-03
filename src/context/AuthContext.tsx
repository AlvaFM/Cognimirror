//AuthContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Patient, GameMode } from '../types';
import { mockInstitutions, mockTherapists, mockPatients } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  selectedPatient: Patient | null;
  gameMode: GameMode;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Partial<User>) => boolean;
  registerPatient: (patientData: Partial<Patient>) => boolean;
  selectPatient: (patientId: string) => void;
  switchGameMode: (mode: GameMode, parentPassword?: string) => boolean;
  addTherapistToInstitution: (therapistId: string, institutionId: string) => boolean;
  getPatientsByTherapist: (therapistId: string) => Patient[];
  getTherapistsByInstitution: (institutionId: string) => User[];
  getAllPatients: () => Patient[];
  quickTry: (name: string, age: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [allUsers, setAllUsers] = useState<User[]>([
    ...mockInstitutions,
    ...mockTherapists,
    ...mockPatients,
  ]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('juego');

  const login = (email: string, password: string): boolean => {
    const user = allUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      setCurrentUser(user);

      if (user.type === 'paciente') {
        setSelectedPatient(user as Patient);
        setGameMode('juego');
      }

      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedPatient(null);
    setGameMode('juego');
  };

  const register = (userData: Partial<User>): boolean => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email || '',
      password: userData.password || '',
      type: userData.type || 'terapeuta',
      name: userData.name || '',
      institutionId: userData.institutionId,
      createdAt: new Date(),
    };

    setAllUsers([...allUsers, newUser]);
    return true;
  };

  const registerPatient = (patientData: Partial<Patient>): boolean => {
    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      email: patientData.email || '',
      password: patientData.password || '',
      type: 'paciente',
      name: patientData.name || '',
      parentEmails: patientData.parentEmails || [],
      therapistId: patientData.therapistId || currentUser?.id || '',
      institutionId: patientData.institutionId || currentUser?.institutionId,
      age: patientData.age,
      diagnosis: patientData.diagnosis || [],
      progress: 0,
      achievements: [],
      sessions: [],
      createdAt: new Date(),
    };

    setAllUsers([...allUsers, newPatient]);
    return true;
  };

  const selectPatient = (patientId: string) => {
    const patient = allUsers.find(
      (u) => u.id === patientId && u.type === 'paciente'
    ) as Patient;

    if (patient) {
      setSelectedPatient(patient);
      setCurrentUser(patient);
      setGameMode('juego');
    }
  };

  const switchGameMode = (mode: GameMode, parentPassword?: string): boolean => {
    if (mode === 'observador') {
      if (parentPassword === '1234' || parentPassword === selectedPatient?.password) {
        setGameMode(mode);
        return true;
      }
      return false;
    }

    setGameMode(mode);
    return true;
  };

  const addTherapistToInstitution = (therapistId: string, institutionId: string): boolean => {
    setAllUsers(
      allUsers.map((user) => {
        if (user.id === therapistId && user.type === 'terapeuta') {
          return { ...user, institutionId };
        }
        return user;
      })
    );
    return true;
  };

  const getPatientsByTherapist = (therapistId: string): Patient[] => {
    return allUsers.filter(
      (u) => u.type === 'paciente' && (u as Patient).therapistId === therapistId
    ) as Patient[];
  };

  const getTherapistsByInstitution = (institutionId: string): User[] => {
    return allUsers.filter(
      (u) => u.type === 'terapeuta' && u.institutionId === institutionId
    );
  };

  const getAllPatients = (): Patient[] => {
    return allUsers.filter((u) => u.type === 'paciente') as Patient[];
  };

  // Crear paciente temporal para flujo "Pruébalo ahora"
  const quickTry = (name: string, age: number): string => {
    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      email: '',
      password: '',
      type: 'paciente',
      name,
      parentEmails: [],
      therapistId: currentUser?.id || '',
      institutionId: currentUser?.institutionId,
      age,
      diagnosis: [],
      progress: 0,
      achievements: [],
      sessions: [],
      createdAt: new Date(),
    };

    setAllUsers([...allUsers, newPatient]);
    setSelectedPatient(newPatient);
    setCurrentUser(newPatient);
    setGameMode('juego');
    return newPatient.id;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        selectedPatient,
        gameMode,
        login,
        logout,
        register,
        registerPatient,
        selectPatient,
        switchGameMode,
        addTherapistToInstitution,
        getPatientsByTherapist,
        getTherapistsByInstitution,
        getAllPatients,
        quickTry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
