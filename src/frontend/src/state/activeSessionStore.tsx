import { createContext, useContext, useState, ReactNode } from 'react';
import { Eye } from '../backend';

interface ActiveSessionContextType {
  patientId: string | null;
  sessionId: string | null;
  sessionNumber: string;
  currentEye: Eye;
  setPatientId: (id: string | null) => void;
  setSessionId: (id: string | null) => void;
  setSessionNumber: (num: string) => void;
  setCurrentEye: (eye: Eye) => void;
}

const ActiveSessionContext = createContext<ActiveSessionContextType | null>(null);

export function ActiveSessionProvider({ children }: { children: ReactNode }) {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNumber, setSessionNumber] = useState('001');
  const [currentEye, setCurrentEye] = useState<Eye>(Eye.right);

  return (
    <ActiveSessionContext.Provider
      value={{
        patientId,
        sessionId,
        sessionNumber,
        currentEye,
        setPatientId,
        setSessionId,
        setSessionNumber,
        setCurrentEye,
      }}
    >
      {children}
    </ActiveSessionContext.Provider>
  );
}

export function useActiveSession() {
  const context = useContext(ActiveSessionContext);
  if (!context) {
    throw new Error('useActiveSession must be used within ActiveSessionProvider');
  }
  return context;
}
