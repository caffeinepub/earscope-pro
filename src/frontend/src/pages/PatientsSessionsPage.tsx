import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import PatientForm from '../components/PatientForm';
import SessionForm from '../components/SessionForm';
import { useActiveSession } from '../state/activeSessionStore';
import { useGetAllSessions } from '../hooks/useQueries';
import { Patient, Session } from '../backend';
import { toast } from 'sonner';

export default function PatientsSessionsPage() {
  const navigate = useNavigate();
  const { setPatientId, setSessionId, setSessionNumber } = useActiveSession();
  const { data: allSessions = [] } = useGetAllSessions();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handlePatientSelected = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientId(patient.id);
    toast.success(`Patient selected: ${patient.name}`);
  };

  const handleSessionSelected = (session: Session) => {
    setSelectedSession(session);
    setSessionId(session.id);

    const patientSessions = allSessions.filter((s) => s.patientId === session.patientId);
    const sessionIndex = patientSessions.findIndex((s) => s.id === session.id);
    const sessionNum = String(sessionIndex + 1).padStart(3, '0');
    setSessionNumber(sessionNum);

    toast.success(`Session #${sessionNum} selected`);
  };

  const handleProceedToLive = () => {
    if (!selectedPatient || !selectedSession) {
      toast.error('Please select both patient and session');
      return;
    }
    navigate({ to: '/live' });
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <PatientForm onPatientSelected={handlePatientSelected} />
        <SessionForm patientId={selectedPatient?.id || null} onSessionSelected={handleSessionSelected} />
      </div>

      {selectedPatient && selectedSession && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p>
                <strong>Active:</strong> {selectedPatient.name} - Session{' '}
                {allSessions.filter((s) => s.patientId === selectedPatient.id).findIndex((s) => s.id === selectedSession.id) + 1}
              </p>
              <Button onClick={handleProceedToLive} size="lg" className="mt-2">
                Proceed to Live Camera
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
