import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import CaptureGrid from '../components/CaptureGrid';
import { useGetAllCaptures, useGetAllSessions, useGetAllPatients } from '../hooks/useQueries';
import { Capture } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { saveQualityScore, getQualityScore } from '../gallery/localPersistence';

export default function GalleryPage() {
  const { data: patients = [] } = useGetAllPatients();
  const { data: sessions = [] } = useGetAllSessions();
  const { data: captures = [] } = useGetAllCaptures();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [qualityScore, setQualityScore] = useState(5);

  const patientSessions = sessions.filter((s) => s.patientId === selectedPatientId);
  const sessionCaptures = captures.filter((c) => c.sessionId === selectedSessionId);

  const handleCaptureSelect = (capture: Capture) => {
    setSelectedCapture(capture);
    const savedScore = getQualityScore(capture.id);
    setQualityScore(savedScore || 5);
  };

  const handleQualityScoreChange = (value: number[]) => {
    const score = value[0];
    setQualityScore(score);
    if (selectedCapture) {
      saveQualityScore(selectedCapture.id, score);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
          <CardDescription>View and manage captured images</CardDescription>
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
                      Session #{String(index + 1).padStart(3, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!selectedSessionId && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>Select a patient and session to view captures</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedSessionId && <CaptureGrid captures={sessionCaptures} onSelect={handleCaptureSelect} />}

      <Dialog open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Capture Details</DialogTitle>
            <DialogDescription>
              {selectedCapture &&
                new Date(Number(selectedCapture.timestamp) / 1000000).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedCapture && (
            <div className="space-y-4">
              <img
                src={selectedCapture.image.getDirectURL()}
                alt="Capture"
                className="w-full rounded-lg"
              />
              <div className="space-y-2">
                <Label>Quality Score: {qualityScore}/10</Label>
                <Slider
                  value={[qualityScore]}
                  onValueChange={handleQualityScoreChange}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
