import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import ExportPanel from '../components/ExportPanel';
import { useGetAllPatients, useGetAllSessions, useGetAllCaptures } from '../hooks/useQueries';

export default function ExportReportsPage() {
  const { data: patients = [] } = useGetAllPatients();
  const { data: sessions = [] } = useGetAllSessions();
  const { data: captures = [] } = useGetAllCaptures();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;
  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || null;
  const patientSessions = sessions.filter((s) => s.patientId === selectedPatientId);
  const sessionCaptures = captures.filter((c) => c.sessionId === selectedSessionId);

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Export & Reports</CardTitle>
          <CardDescription>Export session data and generate reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select value={selectedPatientId || ''} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Session</Label>
              <Select
                value={selectedSessionId || ''}
                onValueChange={setSelectedSessionId}
                disabled={!selectedPatientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a session" />
                </SelectTrigger>
                <SelectContent>
                  {patientSessions.map((session, index) => (
                    <SelectItem key={session.id} value={session.id}>
                      Session #{String(index + 1).padStart(3, '0')} -{' '}
                      {new Date(Number(session.timestamp) / 1000000).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedSessionId && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>Select a patient and session to export data</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <ExportPanel patient={selectedPatient} session={selectedSession} captures={sessionCaptures} />
    </div>
  );
}
