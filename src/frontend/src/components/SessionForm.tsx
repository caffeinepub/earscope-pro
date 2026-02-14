import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Session, SessionType, Eye } from '../backend';
import { useAddSession, useGetAllSessions } from '../hooks/useQueries';
import { toast } from 'sonner';

interface SessionFormProps {
  patientId: string | null;
  onSessionSelected: (session: Session) => void;
}

export default function SessionForm({ patientId, onSessionSelected }: SessionFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.routine);
  const [eye, setEye] = useState<Eye>(Eye.right);

  const { data: sessions = [] } = useGetAllSessions();
  const addSession = useAddSession();

  const patientSessions = sessions.filter((s) => s.patientId === patientId);

  const handleCreate = async () => {
    if (!patientId) {
      toast.error('Please select a patient first');
      return;
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await addSession.mutateAsync({
        id: sessionId,
        patientId,
        sessionType,
        eye,
      });

      toast.success('Session created successfully');
      setIsCreating(false);
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    }
  };

  if (!patientId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Please select a patient first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>Select an existing session or create a new one</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCreating ? (
          <>
            {patientSessions.length > 0 && (
              <div className="space-y-2">
                <Label>Select Session</Label>
                <Select onValueChange={(id) => {
                  const session = sessions.find((s) => s.id === id);
                  if (session) onSessionSelected(session);
                }}>
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
            )}
            <Button variant="outline" onClick={() => setIsCreating(true)} className="w-full">
              Create New Session
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select value={sessionType} onValueChange={(value) => setSessionType(value as SessionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SessionType.routine}>Routine</SelectItem>
                  <SelectItem value={SessionType.followUp}>Follow-up</SelectItem>
                  <SelectItem value={SessionType.emergency}>Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ear</Label>
              <Select value={eye} onValueChange={(value) => setEye(value as Eye)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Eye.left}>Left</SelectItem>
                  <SelectItem value={Eye.right}>Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={addSession.isPending} className="flex-1">
                {addSession.isPending ? 'Creating...' : 'Create Session'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
